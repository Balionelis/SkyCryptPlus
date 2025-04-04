import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class Logger {
  private logFile: string;
  private logLevel: string;
  
  constructor(logFile: string, logLevel: string = 'info') {
    this.logFile = logFile;
    this.logLevel = logLevel;
    
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  private logToFile(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${level.toUpperCase()} - ${message}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (err) {
      console.error(`Failed to write to log file: ${err}`);
    }
  }
  
  info(message: string): void {
    console.log(message);
    this.logToFile('info', message);
  }
  
  error(message: string): void {
    console.error(message);
    this.logToFile('error', message);
  }
  
  warn(message: string): void {
    console.warn(message);
    this.logToFile('warn', message);
  }
  
  critical(message: string): void {
    console.error(message);
    this.logToFile('critical', message);
  }
}

let logger: Logger | null = null;

export function setupLogging(): Logger {
  try {
    const appDataPath = path.join(
      process.env.APPDATA || 
      (process.platform === 'darwin' 
        ? path.join(os.homedir(), 'Library/Preferences') 
        : path.join(os.homedir(), '.local/share')),
      'SkyCrypt+'
    );
    
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }
    
    const logFilePath = path.join(appDataPath, 'skycrypt_plus.log');
    
    if (fs.existsSync(logFilePath)) {
      const stats = fs.statSync(logFilePath);
      if (stats.size > 10 * 1024 * 1024) {
        const backupPath = logFilePath + '.old';
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath);
        }
        fs.renameSync(logFilePath, backupPath);
      }
    }
    
    logger = new Logger(logFilePath);
    logger.info("===== SkyCrypt+ Started =====");
    
    return logger;
  } catch (err: any) {
    console.error(`Error setting up logging: ${err.message}`);
    const tempLogFile = path.join(os.tmpdir(), 'skycrypt_plus.log');
    logger = new Logger(tempLogFile);
    logger.error(`Error setting up logging: ${err.message}`);
    return logger;
  }
}

export function getLogger(): Logger {
  if (!logger) {
    setupLogging();
  }
  return logger as Logger;
}