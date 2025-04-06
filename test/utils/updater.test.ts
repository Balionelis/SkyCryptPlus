import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import { checkForUpdates, compareVersions } from '../../src/utils/updater';
import { readConfig } from '../../src/config/configManager';

vi.mock('axios');
vi.mock('../../src/config/configManager', () => ({
  readConfig: vi.fn()
}));

describe('Updater Module', () => {
  describe('compareVersions', () => {
    it('should correctly compare version numbers', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.0.1', '1.0.0')).toBeGreaterThan(0);
      expect(compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
      expect(compareVersions('2.0.0', '1.9.9')).toBeGreaterThan(0);
      expect(compareVersions('1.2.3', '1.2.3.4')).toBeLessThan(0);
    });
  });

  describe('checkForUpdates', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should return null if config is not available', async () => {
      (readConfig as ReturnType<typeof vi.fn>).mockReturnValue(null);
      
      const result = await checkForUpdates();
      expect(result).toBeNull();
    });

    it('should return update info when update is available', async () => {
      const mockAxiosResponse = {
        status: 200,
        data: {
          tag_name: 'v1.1.0',
          html_url: 'https://github.com/Balionelis/SkyCryptPlus/releases/tag/v1.1.0'
        }
      };
      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockAxiosResponse);

      (readConfig as ReturnType<typeof vi.fn>).mockReturnValue({
        version: '1.0.0'
      });

      const result = await checkForUpdates();
      
      expect(result).toEqual({
        currentVersion: '1.0.0',
        latestVersion: '1.1.0',
        updateAvailable: true,
        releaseUrl: 'https://github.com/Balionelis/SkyCryptPlus/releases/tag/v1.1.0'
      });
    });

    it('should return null if GitHub API request fails', async () => {
      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      const result = await checkForUpdates();
      expect(result).toBeNull();
    });
  });
});