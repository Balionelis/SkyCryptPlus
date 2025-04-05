import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { BrowserWindow } from 'electron';
import { checkForUpdates, checkForUpdatesAsync } from '../../src/utils/updater';

vi.mock('axios');
vi.mock('electron', () => ({
  BrowserWindow: vi.fn()
}));
vi.mock('../src/utils/logger', () => ({
  getLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    error: vi.fn()
  })
}));
vi.mock('../src/config/configManager', () => ({
  readConfig: vi.fn().mockReturnValue({
    version: '1.0.4'
  })
}));

describe('updater', () => {
  const mockReleaseResponse = {
    status: 200,
    data: {
      tag_name: 'v1.0.5',
      html_url: 'https://github.com/Balionelis/SkyCryptPlus/releases/tag/v1.0.5'
    }
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should check for updates correctly', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce(mockReleaseResponse);
    
    const result = await checkForUpdates();
    
    expect(result).toEqual({
      currentVersion: '1.0.4',
      latestVersion: '1.0.5',
      updateAvailable: true,
      releaseUrl: 'https://github.com/Balionelis/SkyCryptPlus/releases/tag/v1.0.5'
    });
    
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.github.com/repos/Balionelis/SkyCryptPlus/releases/latest',
      expect.objectContaining({
        headers: { 'Accept': 'application/vnd.github.v3+json' },
        timeout: 5000
      })
    );
  });

  it('should handle network errors', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));
    
    const result = await checkForUpdates();
    
    expect(result).toBeNull();
  });

  it('should handle non-200 responses', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      status: 404,
      data: {}
    });
    
    const result = await checkForUpdates();
    
    expect(result).toBeNull();
  });

  it('should not report update if versions match', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      status: 200,
      data: {
        tag_name: 'v1.0.4',
        html_url: 'https://github.com/Balionelis/SkyCryptPlus/releases/tag/v1.0.4'
      }
    });
    
    const result = await checkForUpdates();
    
    expect(result).toEqual({
      currentVersion: '1.0.4',
      latestVersion: '1.0.4',
      updateAvailable: false,
      releaseUrl: 'https://github.com/Balionelis/SkyCryptPlus/releases/tag/v1.0.4'
    });
  });

  it('should check for updates asynchronously', () => {
    const spySetTimeout = vi.spyOn(global, 'setTimeout');
    const mockWindow = {
      webContents: {
        executeJavaScript: vi.fn().mockResolvedValue(undefined)
      }
    } as unknown as BrowserWindow;
    
    checkForUpdatesAsync(mockWindow);
    
    expect(spySetTimeout).toHaveBeenCalledTimes(1);
    expect(spySetTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });
});