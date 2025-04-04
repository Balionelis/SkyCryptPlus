import axios from 'axios';
import { getLogger } from './logger';
import { readConfig } from '../config/configManager';
import { BrowserWindow } from 'electron';

interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseUrl: string;
}

export async function checkForUpdates(): Promise<UpdateCheckResult | null> {
  try {
    const response = await axios.get(
      "https://api.github.com/repos/Balionelis/SkyCryptPlus/releases/latest",
      {
        headers: { "Accept": "application/vnd.github.v3+json" },
        timeout: 5000
      }
    );
    
    if (response.status === 200) {
      const releaseData = response.data;
      const latestVersion = (releaseData.tag_name || "").replace(/^v/, "");
      const releaseUrl = releaseData.html_url || "https://github.com/Balionelis/SkyCryptPlus/releases";
      
      const config = readConfig();
      if (config) {
        const currentVersion = config.version;
        
        const updateAvailable = compareVersions(latestVersion, currentVersion) > 0;
        
        return {
          currentVersion,
          latestVersion,
          updateAvailable,
          releaseUrl
        };
      }
      return null;
    } else {
      getLogger().error(`GitHub API returned status code ${response.status}`);
      return null;
    }
  } catch (err: any) {
    getLogger().error(`Error checking for updates: ${err.message}`);
    return null;
  }
}

export function checkForUpdatesAsync(window: BrowserWindow): void {
  setTimeout(async () => {
    try {
      const updateInfo = await checkForUpdates();
      
      if (updateInfo && updateInfo.updateAvailable) {
        window.webContents.executeJavaScript(`
          window.updateInfo = {
            currentVersion: "${updateInfo.currentVersion}",
            latestVersion: "${updateInfo.latestVersion}",
            releaseUrl: "${updateInfo.releaseUrl}"
          };
          
          const updateEvent = new CustomEvent('skycryptPlusUpdateAvailable', { 
            detail: window.updateInfo 
          });
          document.dispatchEvent(updateEvent);
        `);
        
        getLogger().info(`Update available: ${updateInfo.currentVersion} → ${updateInfo.latestVersion}`);
      }
    } catch (err: any) {
      getLogger().error(`Error in update checker: ${err.message}`);
    }
  }, 5000);
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = i < parts1.length ? parts1[i] : 0;
    const part2 = i < parts2.length ? parts2[i] : 0;
    
    if (part1 !== part2) {
      return part1 - part2;
    }
  }
  
  return 0;
}