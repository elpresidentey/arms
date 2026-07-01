import { NestFactory } from '@nestjs/core';
import { AppModule } from '../backend/src/app.module';
import { configureApp, initializeSentry } from '../backend/src/bootstrap';
import { INestApplication } from '@nestjs/common';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: INestApplication | null = null;

const initializeApp = async (): Promise<INestApplication> => {
  if (app) return app;
  
  try {
    console.log('Initializing NestJS app for serverless...');
    initializeSentry();
    
    app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn'] 
        : ['log', 'error', 'warn', 'debug'],
    });

    configureApp(app);
    await app.init();
    
    console.log('NestJS app initialized successfully');
    return app;
  } catch (error) {
    console.error('Failed to initialize NestJS app:', error);
    throw error;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const nestApp = await initializeApp();
    
    // Get the underlying Express instance
    const expressInstance = nestApp.getHttpAdapter().getInstance();
    
    // Modify request URL to remove /api prefix for internal routing
    const originalUrl = req.url;
    req.url = req.url?.replace(/^\/api/, '') || '/';
    
    // Set up proper headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    console.log(`${req.method} ${originalUrl} -> ${req.url}`);
    
    // Use Express handler
    return expressInstance(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}