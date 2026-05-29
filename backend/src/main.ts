import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, initializeSentry } from './bootstrap';

async function bootstrap() {
  initializeSentry();

  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn'] 
      : ['log', 'error', 'warn', 'debug'],
  });

  configureApp(app);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`ARMS Backend running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Security: Enhanced protection enabled`);
}

bootstrap();
