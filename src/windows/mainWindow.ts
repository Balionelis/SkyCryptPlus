import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { readConfig, saveConfig, getConfigPath } from '../config/configManager';
import { checkForUpdatesAsync } from '../utils/updater';
import { getLogger } from '../utils/logger';
import { getEssentialJsCode, getEnhancedJsCode } from '../assets/scripts/jsInjector';
import { app } from 'electron';

export function createMainWindow(username: string, profile: string, theme = 'default.json'): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../assets/images/logo_square.svg'),
    resizable: true,
    maximizable: false,
    fullscreenable: false,
    maxWidth: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/mainPreload.js'),
      devTools: true
    }
  });
  
  mainWindow.setMenuBarVisibility(false);
  mainWindow.autoHideMenuBar = true;
  
  mainWindow.setFullScreenable(false);
  
  mainWindow.on('maximize', () => {
    mainWindow.unmaximize();
  });
  
  const url = `https://sky.shiiyu.moe/stats/${username}/${profile}`;
  
  setupMainWindowHandlers();
  
  mainWindow.loadURL(url);
  
  mainWindow.webContents.on('did-finish-load', () => {
    injectScripts(mainWindow, theme);
    
    checkForUpdatesAsync(mainWindow);
  });
  
  return mainWindow;
}
function setupMainWindowHandlers(): void {
  ipcMain.handle('save-theme', (_, theme: string) => {
    try {
      const config = readConfig();
      if (config) {
        config.selectedTheme = theme;
        saveConfig(config.playerName, config.defaultProfile, theme, config.autoRefreshInterval);
        getLogger().info(`Theme saved: ${theme}`);
        return true;
      }
      return false;
    } catch (err: unknown) {
      getLogger().error(`Error saving theme: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  });
  
  ipcMain.handle('save-auto-refresh', (_, interval: string) => {
    try {
      const config = readConfig();
      if (config) {
        config.autoRefreshInterval = interval;
        saveConfig(config.playerName, config.defaultProfile, config.selectedTheme, interval);
        getLogger().info(`Auto refresh interval saved: ${interval}`);
        return true;
      }
      return false;
    } catch (err: unknown) {
      getLogger().error(`Error saving auto refresh interval: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  });
  
  ipcMain.handle('get-auto-refresh', () => {
    try {
      const config = readConfig();
      if (config?.autoRefreshInterval) {
        return config.autoRefreshInterval;
      }
      return 'off';
    } catch (err: unknown) {
      getLogger().error(`Error getting auto refresh interval: ${err instanceof Error ? err.message : String(err)}`);
      return 'off';
    }
  });
  
  ipcMain.handle('reset-config', () => {
    try {
      const configPath = getConfigPath();
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
        getLogger().info(`Configuration reset successful`);
        return true;
      }
      return false;
    } catch (err: unknown) {
      getLogger().error(`Error resetting configuration: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  });

  ipcMain.handle('exit-app', () => {
    getLogger().info('User requested app exit after config reset');
    app.quit();
    return true;
  });
}

function injectScripts(window: BrowserWindow, theme: string): void {
  try {
    const essentialScript = getEssentialJsCode(theme);
    window.webContents.executeJavaScript(essentialScript);
    getLogger().info("Essential JavaScript injection successful");
    
    setTimeout(() => {
      try {
        const enhancedScript = getEnhancedJsCode(theme);
        window.webContents.executeJavaScript(enhancedScript);
        getLogger().info("Enhanced JavaScript injection successful");
      } catch (err: unknown) {
        getLogger().error(`Error injecting enhanced JavaScript: ${err instanceof Error ? err.message : String(err)}`);
      }
    }, 1000);
  } catch (err: unknown) {
    getLogger().error(`Error injecting JavaScript: ${err instanceof Error ? err.message : String(err)}`);
  }
}