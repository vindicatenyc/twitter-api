import dotenv from 'dotenv';

// Load environment variables before any other imports that may depend on them
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check / root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'twitter-api',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
