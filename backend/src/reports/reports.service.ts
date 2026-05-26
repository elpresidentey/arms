import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportPriority, ReportStatus, ReportType } from './entities/report.entity';
import { NotificationsService } from '../notifications/notifications.service';

const REPORT_STAFF_ROLES = ['admin', 'psp_operator', 'ward_officer', 'supervisor', 'dispatcher'];

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<Report[]> {
    return this.reportsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['reporter'],
    });
  }

  async findMine(userId: string): Promise<Report[]> {
    return this.reportsRepository.find({
      where: { reporterId: userId },
      order: { createdAt: 'DESC' },
      relations: ['reporter'],
    });
  }

  async create(data: Partial<Report>): Promise<Report> {
    const report = this.reportsRepository.create({
      ...data,
      ticketNumber: this.createTicketNumber(),
      status: data.status || ReportStatus.SUBMITTED,
      priority: data.priority || ReportPriority.MEDIUM,
      type: data.type || ReportType.OTHER,
      dueAt: this.calculateDueAt(data.priority || ReportPriority.MEDIUM),
    });
    const saved = await this.reportsRepository.save(report);
    this.notificationsService.notify('report-update', saved, {
      userIds: saved.reporterId ? [saved.reporterId] : undefined,
      roles: REPORT_STAFF_ROLES,
    });
    const reportWithReporter = await this.reportsRepository.findOne({
      where: { id: saved.id },
      relations: ['reporter'],
    });
    if (reportWithReporter?.reporter) {
      void this.notificationsService.sendReportUpdateEmail(reportWithReporter.reporter, reportWithReporter);
    }
    return saved;
  }

  async update(id: string, data: Partial<Report>): Promise<Report> {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['reporter'],
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    Object.assign(report, data);
    if (data.status && data.status !== ReportStatus.SUBMITTED && !report.firstResponseAt) {
      report.firstResponseAt = new Date();
    }
    if (data.status === ReportStatus.RESOLVED && !report.resolvedAt) {
      report.resolvedAt = new Date();
    }
    if (data.priority === ReportPriority.URGENT || data.status === ReportStatus.IN_PROGRESS) {
      const dueAt = report.dueAt ? new Date(report.dueAt) : null;
      if (dueAt && dueAt < new Date() && !report.escalatedAt) {
        report.escalatedAt = new Date();
      }
    }
    const saved = await this.reportsRepository.save(report);
    this.notificationsService.notify('report-update', saved, {
      userIds: saved.reporterId ? [saved.reporterId] : undefined,
      roles: REPORT_STAFF_ROLES,
    });
    if (saved.reporter) {
      void this.notificationsService.sendReportUpdateEmail(saved.reporter, saved);
    }
    return saved;
  }

  private createTicketNumber() {
    return `RPT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  }

  private calculateDueAt(priority: ReportPriority) {
    const dueAt = new Date();
    const hours =
      priority === ReportPriority.URGENT
        ? 6
        : priority === ReportPriority.HIGH
          ? 24
          : priority === ReportPriority.LOW
            ? 72
            : 48;
    dueAt.setHours(dueAt.getHours() + hours);
    return dueAt;
  }
}
