import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk'
import 'dotenv/config'
export const paddle = new Paddle(process.env.PADDLE_API_KEY as string, {
  environment: Environment.sandbox , // or Environment.sandbox for accessing sandbox API
  logLevel: LogLevel.verbose, // or LogLevel.error for less verbose logging
  customHeaders: {
    'X-Custom-Header': 'value' // Optional custom headers
  }
})