import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express = require('express');
import { AppModule } from '../src/app.module';
import { configureApp, initializeSentry } from '../src/bootstrap';

let cachedServer: express.Express | null = null;

async function createServer() {
  if (cachedServer) {
    return cachedServer;
  }

  initializeSentry();

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'error', 'warn', 'debug'],
    },
  );

  configureApp(app);
  await app.init();

  cachedServer = expressApp;
  return cachedServer;
}

export default async function handler(req: express.Request, res: express.Response) {
  const server = await createServer();
  return server(req, res);
}
