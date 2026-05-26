import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WasteCollectionModule } from './waste-collection/waste-collection.module';
import { RecyclablesModule } from './recyclables/recyclables.module';
import { WalletModule } from './wallet/wallet.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GeoapifyModule } from './geoapify/geoapify.module';
import { CollectionRoutesModule } from './collection-routes/collection-routes.module';
import { CollectionRequestsModule } from './collection-requests/collection-requests.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { LocationsModule } from './locations/locations.module';
import { UploadModule } from './upload/upload.module';
import { PaystackModule } from './paystack/paystack.module';
import { PayoutsModule } from './payouts/payouts.module';
import { AdminInvitesModule } from './admin-invites/admin-invites.module';
import { LogisticsModule } from './logistics/logistics.module';
import { ServiceSchedulesModule } from './service-schedules/service-schedules.module';
import { BillingModule } from './billing/billing.module';
import { SecurityLoggerMiddleware } from './common/middleware/security-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting - 100 requests per minute per IP
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests
    }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const dbHost = configService.get<string>('DB_HOST');
        const dbProvider = configService.get<string>('DB_PROVIDER', 'postgres');
        const useSsl =
          configService.get<string>('DB_SSL', databaseUrl || dbHost ? 'true' : 'false') === 'true';
        const synchronize = configService.get<string>('DB_SYNC', 'false') === 'true';

        const baseConfig = {
          autoLoadEntities: true,
          synchronize,
        } as const;

        if (dbProvider !== 'postgres') {
          throw new Error('ARMS backend is configured for Supabase Postgres only. Set DB_PROVIDER=postgres.');
        }

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl: useSsl ? { rejectUnauthorized: false } : false,
            extra: useSsl ? { ssl: { rejectUnauthorized: false } } : undefined,
            ...baseConfig,
          };
        }

        if (dbHost) {
          return {
            type: 'postgres' as const,
            host: dbHost,
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD', ''),
            database: configService.get<string>('DB_NAME', 'postgres'),
            ssl: useSsl ? { rejectUnauthorized: false } : false,
            extra: useSsl ? { ssl: { rejectUnauthorized: false } } : undefined,
            ...baseConfig,
          };
        }

        throw new Error('Supabase Postgres configuration is required. Set DATABASE_URL or DB_HOST.');
      },
    }),
    AuthModule,
    UsersModule,
    WasteCollectionModule,
    RecyclablesModule,
    WalletModule,
    ReportsModule,
    NotificationsModule,
    GeoapifyModule,
    CollectionRoutesModule,
    CollectionRequestsModule,
    ServiceRequestsModule,
    LocationsModule,
    UploadModule,
    PaystackModule,
    PayoutsModule,
    AdminInvitesModule,
    LogisticsModule,
    ServiceSchedulesModule,
    BillingModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security logging middleware to all routes
    consumer
      .apply(SecurityLoggerMiddleware)
      .forRoutes('*');
  }
}
