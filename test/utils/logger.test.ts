import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Logger, setupLogging, getLogger } from '../../src/utils/logger';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  appendFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  statSync: vi.fn(),
  unlinkSync: vi.fn(),
  renameSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn()
}));

vi.mock('path', () => ({
  join: vi.fn(),
  dirname: vi.fn()
}));

vi.mock('os', () => ({
  homedir: vi.fn(),
  tmpdir: vi.fn()
}));

describe('Logger', () => {
  const mockLogPath = '/fake/path/log.log';
  let logger: Logger;

  beforeEach(() => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.appendFileSync).mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    
    logger = new Logger(mockLogPath);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create log directory if it does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(path.dirname).mockReturnValue('/fake/path');
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    
    new Logger(mockLogPath);
    
    expect(fs.existsSync).toHaveBeenCalledWith('/fake/path');
    expect(fs.mkdirSync).toHaveBeenCalledWith('/fake/path', { recursive: true });
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    
    expect(console.log).toHaveBeenCalledWith('Test info message');
    expect(fs.appendFileSync).toHaveBeenCalled();
    expect(vi.mocked(fs.appendFileSync).mock.calls[0][0]).toBe(mockLogPath);
    expect(vi.mocked(fs.appendFileSync).mock.calls[0][1]).toContain('INFO - Test info message');
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    
    expect(console.error).toHaveBeenCalledWith('Test error message');
    expect(fs.appendFileSync).toHaveBeenCalled();
    expect(vi.mocked(fs.appendFileSync).mock.calls[0][1]).toContain('ERROR - Test error message');
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    
    expect(console.warn).toHaveBeenCalledWith('Test warning message');
    expect(fs.appendFileSync).toHaveBeenCalled();
    expect(vi.mocked(fs.appendFileSync).mock.calls[0][1]).toContain('WARN - Test warning message');
  });

  it('should log critical messages', () => {
    logger.critical('Test critical message');
    
    expect(console.error).toHaveBeenCalledWith('Test critical message');
    expect(fs.appendFileSync).toHaveBeenCalled();
    expect(vi.mocked(fs.appendFileSync).mock.calls[0][1]).toContain('CRITICAL - Test critical message');
  });
});

describe('setupLogging', () => {
  beforeEach(() => {
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(os.homedir).mockReturnValue('/home/user');
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    vi.mocked(fs.statSync).mockReturnValue({ size: 5 * 1024 * 1024 } as fs.Stats);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should setup logging correctly', () => {
    const logger = setupLogging();
    
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should rotate log file if too large', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ size: 11 * 1024 * 1024 } as fs.Stats);
    vi.mocked(fs.unlinkSync).mockImplementation(() => undefined);
    vi.mocked(fs.renameSync).mockImplementation(() => undefined);
    
    setupLogging();
    
    expect(fs.statSync).toHaveBeenCalled();
    expect(fs.renameSync).toHaveBeenCalled();
  });

  it('should return existing logger with getLogger', () => {
    const logger1 = setupLogging();
    const logger2 = getLogger();
    
    expect(logger1).toBe(logger2);
  });
});