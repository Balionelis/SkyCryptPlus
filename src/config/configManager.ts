import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getLogger } from '../utils/logger';
import { currentVersion } from '../version';

export interface Config {
  version: string;
  createdAt: string;
  playerName: string;
  defaultProfile: string;
  selectedTheme: string;
  autoRefreshInterval: string;
}

export function getAppDataPath(): string {
  return path.join(
    process.env.APPDATA || 
    (process.platform === 'darwin' 
      ? path.join(os.homedir(), 'Library/Preferences') 
      : path.join(os.homedir(), '.local/share')),
    'SkyCrypt+'
  );
}

export function getConfigPath(): string {
  return path.join(getAppDataPath(), 'config.json');
}

export function readConfig(): Config | null {
  try {
    const configPath = getConfigPath();
    
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configData) as Config;
    }
    return null;
  } catch (err: any) {
    getLogger().error(`Error reading config file: ${err.message}`);
    return null;
  }
}

export async function updateConfigVersion(): Promise<boolean> {
  try {
    const config = readConfig();
    if (!config) {
      getLogger().info("No existing config found to update version");
      return false;
    }
    
    if (config.version !== currentVersion) {
      config.version = currentVersion;
      
      const configPath = getConfigPath();
      fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
      
      getLogger().info(`Updated config version to ${currentVersion}`);
    }
    
    return true;
  } catch (err: any) {
    getLogger().error(`Error updating config version: ${err.message}`);
    return false;
  }
}

export function saveConfig(
  username: string, 
  profile: string, 
  theme: string = "default.json", 
  autoRefresh: string = "off"
): boolean {
  try {
    const appDataPath = getAppDataPath();
    const configPath = getConfigPath();
    
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }
    
    const config: Config = {
      version: currentVersion,
      createdAt: new Date().toISOString(),
      playerName: username,
      defaultProfile: profile,
      selectedTheme: theme,
      autoRefreshInterval: autoRefresh
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    
    getLogger().info(`Configuration saved for ${username} with profile ${profile}, theme ${theme}, and auto refresh ${autoRefresh}`);
    return true;
  } catch (err: any) {
    getLogger().error(`Error saving config file: ${err.message}`);
    return false;
  }
}