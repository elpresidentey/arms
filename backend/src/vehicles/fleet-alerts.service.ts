import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, LessThanOrEqual, IsNull } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from './entities/maintenance-record.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { NotificationsService } from '../notifications/notifications.service';

interface FleetAlert {
  type: 'maintenance' | 'license' | 'insurance' | 'registration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  vehicleId?: string;
  vehicleCode?: string;
  driverId?: string;
  driverCode?: string;
  message: string;
  dueDate?: Date;
  daysRemaining?: number;
}

@Injectable()
export class FleetAlertsService {
  private readonly logger = new Logger(FleetAlertsService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(MaintenanceRecord)
    private readonly maintenanceRepository: Repository<MaintenanceRecord>,
    @InjectRepository(Driver)
    private readonly driversRepository: Repository<Driver>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Run daily at 8 AM to check for maintenance due
   */
  @Cron('0 8 * * *', {
    name: 'daily-maintenance-check',
    timeZone: 'Africa/Lagos',
  })
  async checkMaintenanceDue() {
    this.logger.log('Running daily maintenance check...');

    try {
      const alerts: FleetAlert[] = [];

      // Find vehicles with overdue maintenance
      const overdueVehicles = await this.vehiclesRepository.find({
        where: {
          status: VehicleStatus.OPERATIONAL,
          nextServiceDue: LessThan(new Date()),
        },
      });

      for (const vehicle of overdueVehicles) {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(vehicle.nextServiceDue).getTime()) / (1000 * 60 * 60 * 24)
        );

        alerts.push({
          type: 'maintenance',
          severity: daysOverdue > 7 ? 'critical' : daysOverdue > 3 ? 'high' : 'medium',
          vehicleId: vehicle.id,
          vehicleCode: vehicle.vehicleCode,
          message: `Vehicle ${vehicle.vehicleCode} (${vehicle.plateNumber}) maintenance is ${daysOverdue} days overdue`,
          dueDate: vehicle.nextServiceDue,
          daysRemaining: -daysOverdue,
        });

        // Auto-create maintenance record if overdue by more than 7 days
        if (daysOverdue > 7) {
          await this.autoScheduleMaintenance(vehicle);
        }
      }

      // Find vehicles with maintenance due within 7 days
      const upcomingDate = new Date();
      upcomingDate.setDate(upcomingDate.getDate() + 7);

      const upcomingVehicles = await this.vehiclesRepository.find({
        where: {
          status: VehicleStatus.OPERATIONAL,
          nextServiceDue: LessThanOrEqual(upcomingDate),
        },
      });

      for (const vehicle of upcomingVehicles) {
        const daysUntil = Math.floor(
          (new Date(vehicle.nextServiceDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntil >= 0) {
          alerts.push({
            type: 'maintenance',
            severity: daysUntil <= 2 ? 'high' : 'medium',
            vehicleId: vehicle.id,
            vehicleCode: vehicle.vehicleCode,
            message: `Vehicle ${vehicle.vehicleCode} (${vehicle.plateNumber}) maintenance due in ${daysUntil} days`,
            dueDate: vehicle.nextServiceDue,
            daysRemaining: daysUntil,
          });
        }
      }

      if (alerts.length > 0) {
        await this.sendMaintenanceAlerts(alerts);
        this.logger.log(`Sent ${alerts.length} maintenance alerts`);
      } else {
        this.logger.log('No maintenance alerts to send');
      }

      return alerts;
    } catch (error) {
      this.logger.error('Error checking maintenance due:', error);
      throw error;
    }
  }

  /**
   * Run daily at 9 AM to check for expiring documents
   */
  @Cron('0 9 * * *', {
    name: 'daily-document-check',
    timeZone: 'Africa/Lagos',
  })
  async checkExpiringDocuments() {
    this.logger.log('Running daily document expiration check...');

    try {
      const alerts: FleetAlert[] = [];

      // Check vehicle insurance
      const insuranceAlerts = await this.checkVehicleInsurance();
      alerts.push(...insuranceAlerts);

      // Check vehicle registration
      const registrationAlerts = await this.checkVehicleRegistration();
      alerts.push(...registrationAlerts);

      // Check driver licenses
      const licenseAlerts = await this.checkDriverLicenses();
      alerts.push(...licenseAlerts);

      if (alerts.length > 0) {
        await this.sendDocumentAlerts(alerts);
        this.logger.log(`Sent ${alerts.length} document expiration alerts`);
      } else {
        this.logger.log('No document expiration alerts to send');
      }

      return alerts;
    } catch (error) {
      this.logger.error('Error checking expiring documents:', error);
      throw error;
    }
  }

  /**
   * Run every Monday at 7 AM to send weekly fleet summary
   */
  @Cron('0 7 * * MON', {
    name: 'weekly-fleet-summary',
    timeZone: 'Africa/Lagos',
  })
  async sendWeeklyFleetReport() {
    this.logger.log('Generating weekly fleet summary report...');

    try {
      const summary = await this.generateFleetSummary();
      await this.sendFleetSummaryEmail(summary);
      this.logger.log('Weekly fleet summary sent successfully');
      return summary;
    } catch (error) {
      this.logger.error('Error generating weekly fleet report:', error);
      throw error;
    }
  }

  private async checkVehicleInsurance(): Promise<FleetAlert[]> {
    const alerts: FleetAlert[] = [];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const vehicles = await this.vehiclesRepository.find({
      where: {
        status: VehicleStatus.OPERATIONAL,
        insuranceExpiry: LessThanOrEqual(thirtyDaysFromNow),
      },
    });

    for (const vehicle of vehicles) {
      const daysUntil = Math.floor(
        (new Date(vehicle.insuranceExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      let severity: FleetAlert['severity'] = 'low';
      if (daysUntil < 0) severity = 'critical';
      else if (daysUntil <= 7) severity = 'high';
      else if (daysUntil <= 14) severity = 'medium';

      alerts.push({
        type: 'insurance',
        severity,
        vehicleId: vehicle.id,
        vehicleCode: vehicle.vehicleCode,
        message: `Vehicle ${vehicle.vehicleCode} (${vehicle.plateNumber}) insurance ${daysUntil < 0 ? 'expired' : 'expires'} ${Math.abs(daysUntil)} days ${daysUntil < 0 ? 'ago' : 'from now'}`,
        dueDate: vehicle.insuranceExpiry,
        daysRemaining: daysUntil,
      });
    }

    return alerts;
  }

  private async checkVehicleRegistration(): Promise<FleetAlert[]> {
    const alerts: FleetAlert[] = [];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const vehicles = await this.vehiclesRepository.find({
      where: {
        status: VehicleStatus.OPERATIONAL,
        registrationExpiry: LessThanOrEqual(thirtyDaysFromNow),
      },
    });

    for (const vehicle of vehicles) {
      const daysUntil = Math.floor(
        (new Date(vehicle.registrationExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      let severity: FleetAlert['severity'] = 'low';
      if (daysUntil < 0) severity = 'critical';
      else if (daysUntil <= 7) severity = 'high';
      else if (daysUntil <= 14) severity = 'medium';

      alerts.push({
        type: 'registration',
        severity,
        vehicleId: vehicle.id,
        vehicleCode: vehicle.vehicleCode,
        message: `Vehicle ${vehicle.vehicleCode} (${vehicle.plateNumber}) registration ${daysUntil < 0 ? 'expired' : 'expires'} ${Math.abs(daysUntil)} days ${daysUntil < 0 ? 'ago' : 'from now'}`,
        dueDate: vehicle.registrationExpiry,
        daysRemaining: daysUntil,
      });
    }

    return alerts;
  }

  private async checkDriverLicenses(): Promise<FleetAlert[]> {
    const alerts: FleetAlert[] = [];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const drivers = await this.driversRepository.find({
      where: {
        status: 'active',
        licenseExpiryDate: LessThanOrEqual(thirtyDaysFromNow),
      },
      relations: ['user'],
    });

    for (const driver of drivers) {
      const daysUntil = Math.floor(
        (new Date(driver.licenseExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      let severity: FleetAlert['severity'] = 'low';
      if (daysUntil < 0) severity = 'critical';
      else if (daysUntil <= 7) severity = 'high';
      else if (daysUntil <= 14) severity = 'medium';

      alerts.push({
        type: 'license',
        severity,
        driverId: driver.id,
        driverCode: driver.driverCode,
        message: `Driver ${driver.driverCode} (${driver.user?.firstName} ${driver.user?.lastName}) license ${daysUntil < 0 ? 'expired' : 'expires'} ${Math.abs(daysUntil)} days ${daysUntil < 0 ? 'ago' : 'from now'}`,
        dueDate: driver.licenseExpiryDate,
        daysRemaining: daysUntil,
      });
    }

    return alerts;
  }

  private async autoScheduleMaintenance(vehicle: Vehicle) {
    // Check if there's already a scheduled maintenance
    const existing = await this.maintenanceRepository.findOne({
      where: {
        vehicleId: vehicle.id,
        status: MaintenanceStatus.SCHEDULED,
      },
    });

    if (existing) {
      this.logger.log(`Maintenance already scheduled for vehicle ${vehicle.vehicleCode}`);
      return;
    }

    // Create new maintenance record
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 3); // Schedule 3 days from now

    const maintenance = this.maintenanceRepository.create({
      vehicleId: vehicle.id,
      maintenanceType: MaintenanceType.PREVENTIVE,
      status: MaintenanceStatus.SCHEDULED,
      priority: 'high',
      title: 'Overdue Preventive Maintenance',
      description: `Automated maintenance scheduling for vehicle ${vehicle.vehicleCode} - overdue by more than 7 days`,
      scheduledDate,
      mileageAtMaintenance: vehicle.currentMileage,
      notes: 'Auto-generated maintenance record due to overdue service',
    });

    await this.maintenanceRepository.save(maintenance);
    this.logger.log(`Auto-scheduled maintenance for vehicle ${vehicle.vehicleCode}`);
  }

  private async sendMaintenanceAlerts(alerts: FleetAlert[]) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const highAlerts = alerts.filter(a => a.severity === 'high');
    const mediumAlerts = alerts.filter(a => a.severity === 'medium');

    const emailBody = `
      <h2>🚨 Fleet Maintenance Alerts</h2>
      <p>Daily maintenance status report for ${new Date().toLocaleDateString()}</p>
      
      ${criticalAlerts.length > 0 ? `
        <h3 style="color: #dc2626;">⚠️ Critical (${criticalAlerts.length})</h3>
        <ul>
          ${criticalAlerts.map(a => `<li>${a.message}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${highAlerts.length > 0 ? `
        <h3 style="color: #ea580c;">⚠️ High Priority (${highAlerts.length})</h3>
        <ul>
          ${highAlerts.map(a => `<li>${a.message}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${mediumAlerts.length > 0 ? `
        <h3 style="color: #f59e0b;">📋 Medium Priority (${mediumAlerts.length})</h3>
        <ul>
          ${mediumAlerts.map(a => `<li>${a.message}</li>`).join('')}
        </ul>
      ` : ''}
      
      <p><small>This is an automated alert from ARMS Fleet Management System</small></p>
    `;

    await this.notificationsService.sendEmail({
      to: process.env.FLEET_MANAGER_EMAIL || 'admin@arms.com',
      subject: `🚨 Fleet Maintenance Alert - ${criticalAlerts.length} Critical`,
      body: emailBody,
    });
  }

  private async sendDocumentAlerts(alerts: FleetAlert[]) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const highAlerts = alerts.filter(a => a.severity === 'high');

    const emailBody = `
      <h2>📄 Fleet Document Expiration Alerts</h2>
      <p>Daily document status report for ${new Date().toLocaleDateString()}</p>
      
      ${criticalAlerts.length > 0 ? `
        <h3 style="color: #dc2626;">⚠️ Expired (${criticalAlerts.length})</h3>
        <ul>
          ${criticalAlerts.map(a => `<li>${a.message}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${highAlerts.length > 0 ? `
        <h3 style="color: #ea580c;">⚠️ Expiring Soon (${highAlerts.length})</h3>
        <ul>
          ${highAlerts.map(a => `<li>${a.message}</li>`).join('')}
        </ul>
      ` : ''}
      
      <p><small>This is an automated alert from ARMS Fleet Management System</small></p>
    `;

    await this.notificationsService.sendEmail({
      to: process.env.FLEET_MANAGER_EMAIL || 'admin@arms.com',
      subject: `📄 Document Expiration Alert - ${criticalAlerts.length} Expired`,
      body: emailBody,
    });
  }

  private async generateFleetSummary() {
    const vehicles = await this.vehiclesRepository.find({
      relations: ['maintenanceRecords', 'routeExecutions'],
    });

    const drivers = await this.driversRepository.find({
      where: { status: 'active' },
    });

    const maintenanceDue = vehicles.filter(
      v => v.nextServiceDue && new Date(v.nextServiceDue) < new Date()
    ).length;

    const insuranceExpiring = vehicles.filter(
      v => v.insuranceExpiry && new Date(v.insuranceExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    const registrationExpiring = vehicles.filter(
      v => v.registrationExpiry && new Date(v.registrationExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      date: new Date().toLocaleDateString(),
      fleet: {
        totalVehicles: vehicles.length,
        operational: vehicles.filter(v => v.status === VehicleStatus.OPERATIONAL).length,
        maintenance: vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length,
        outOfService: vehicles.filter(v => v.status === VehicleStatus.OUT_OF_SERVICE).length,
      },
      drivers: {
        total: drivers.length,
        active: drivers.filter(d => d.status === 'active').length,
      },
      alerts: {
        maintenanceDue,
        insuranceExpiring,
        registrationExpiring,
      },
    };
  }

  private async sendFleetSummaryEmail(summary: any) {
    const emailBody = `
      <h2>📊 Weekly Fleet Summary Report</h2>
      <p>Week ending ${summary.date}</p>
      
      <h3>Fleet Status</h3>
      <ul>
        <li>Total Vehicles: ${summary.fleet.totalVehicles}</li>
        <li>Operational: ${summary.fleet.operational}</li>
        <li>In Maintenance: ${summary.fleet.maintenance}</li>
        <li>Out of Service: ${summary.fleet.outOfService}</li>
      </ul>
      
      <h3>Driver Status</h3>
      <ul>
        <li>Total Drivers: ${summary.drivers.total}</li>
        <li>Active: ${summary.drivers.active}</li>
      </ul>
      
      <h3>⚠️ Alerts</h3>
      <ul>
        <li>Maintenance Due: ${summary.alerts.maintenanceDue}</li>
        <li>Insurance Expiring (30 days): ${summary.alerts.insuranceExpiring}</li>
        <li>Registration Expiring (30 days): ${summary.alerts.registrationExpiring}</li>
      </ul>
      
      <p><small>This is an automated weekly report from ARMS Fleet Management System</small></p>
    `;

    await this.notificationsService.sendEmail({
      to: process.env.FLEET_MANAGER_EMAIL || 'admin@arms.com',
      subject: `📊 Weekly Fleet Summary - ${summary.date}`,
      body: emailBody,
    });
  }

  /**
   * Manual trigger for immediate alert check
   */
  async runImmediateCheck() {
    this.logger.log('Running immediate fleet alerts check...');
    
    const maintenanceAlerts = await this.checkMaintenanceDue();
    const documentAlerts = await this.checkExpiringDocuments();
    
    return {
      maintenance: maintenanceAlerts,
      documents: documentAlerts,
      total: maintenanceAlerts.length + documentAlerts.length,
    };
  }
}
