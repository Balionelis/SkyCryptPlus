import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { readConfig, saveConfig, updateConfigVersion, getConfigPath } from '../../src/config/configManager';

vi.mock('fs');
vi.mock('path');
vi.mock('../src/utils/logger', () => ({
  getLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    error: vi.fn()
  })
}));
vi.mock('../src/version', () => ({
  currentVersion: '1.0.5'
}));

describe('configManager', () => {
  const mockConfigPath = '/fake/path/config.json';
  const mockConfig = {
    version: '1.0.5',
    createdAt: '2023-01-01T00:00:00Z',
    playerName: 'TestUser',
    defaultProfile: 'Apple',
    selectedTheme: 'default.json',
    autoRefreshInterval: 'off'
  };

  beforeEach(() => {
    vi.spyOn(path, 'join').mockReturnValue(mockConfigPath);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should read config successfully', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockConfig));

    const result = readConfig();
    expect(result).toEqual(mockConfig);
    expect(fs.existsSync).toHaveBeenCalledWith(mockConfigPath);
    expect(fs.readFileSync).toHaveBeenCalledWith(mockConfigPath, 'utf-8');
  });

  it('should return null when config file does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    const result = readConfig();
    expect(result).toBeNull();
    expect(fs.existsSync).toHaveBeenCalledWith(mockConfigPath);
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  it('should save config successfully', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

    const result = saveConfig('TestUser', 'Apple');
    expect(result).toBe(true);
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should update config version', async () => {
    const oldConfig = { ...mockConfig, version: '1.0.4' };
    
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(oldConfig));
    
    const writeFileSpy = vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
    
    const result = await updateConfigVersion();
    
    expect(result).toBe(true);
    expect(writeFileSpy).toHaveBeenCalled();
    const writtenConfig = JSON.parse(writeFileSpy.mock.calls[0][1] as string);
    expect(writtenConfig.version).toBe('1.0.5');
  });

  it('should not update config if versions match', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockConfig));
    
    const writeFileSpy = vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
    
    const result = await updateConfigVersion();
    
    expect(result).toBe(true);
    expect(writeFileSpy).not.toHaveBeenCalled();
  });
});