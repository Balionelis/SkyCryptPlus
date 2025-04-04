import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { readConfig, saveConfig, getConfigPath } from '../config/configManager';
import { checkForUpdatesAsync } from '../utils/updater';
import { getLogger } from '../utils/logger';
import { getEssentialJsCode, getEnhancedJsCode } from '../assets/scripts/jsInjector';
import { app } from 'electron';

export function createMainWindow(username: string, profile: string, theme: string = 'default.json'): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../assets/images/logo_square.svg'),
    resizable: true,
    minWidth: 1200,
    maxWidth: 1200,    
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/mainPreload.js')
    }
  });
  
  mainWindow.setMenuBarVisibility(false);
  mainWindow.autoHideMenuBar = true;
  
  const url = `https://sky.shiiyu.moe/stats/${username}/${profile}`;
  
  setupMainWindowHandlers(mainWindow);
  
  mainWindow.loadURL(url);
  
  mainWindow.webContents.on('did-finish-load', () => {
    injectScripts(mainWindow, theme);
    
    checkForUpdatesAsync(mainWindow);
  });
  
  return mainWindow;
}

function setupMainWindowHandlers(window: BrowserWindow): void {
  ipcMain.handle('save-theme', (event, theme: string) => {
    try {
      const config = readConfig();
      if (config) {
        config.selectedTheme = theme;
        saveConfig(config.playerName, config.defaultProfile, theme, config.autoRefreshInterval);
        getLogger().info(`Theme saved: ${theme}`);
        return true;
      }
      return false;
    } catch (err: any) {
      getLogger().error(`Error saving theme: ${err.message}`);
      return false;
    }
  });
  
  ipcMain.handle('save-auto-refresh', (event, interval: string) => {
    try {
      const config = readConfig();
      if (config) {
        config.autoRefreshInterval = interval;
        saveConfig(config.playerName, config.defaultProfile, config.selectedTheme, interval);
        getLogger().info(`Auto refresh interval saved: ${interval}`);
        return true;
      }
      return false;
    } catch (err: any) {
      getLogger().error(`Error saving auto refresh interval: ${err.message}`);
      return false;
    }
  });
  
  ipcMain.handle('get-auto-refresh', (event) => {
    try {
      const config = readConfig();
      if (config && config.autoRefreshInterval) {
        return config.autoRefreshInterval;
      }
      return 'off';
    } catch (err: any) {
      getLogger().error(`Error getting auto refresh interval: ${err.message}`);
      return 'off';
    }
  });
  
  ipcMain.handle('reset-config', (event) => {
    try {
      const configPath = getConfigPath();
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
        getLogger().info(`Configuration reset successful`);
        return true;
      }
      return false;
    } catch (err: any) {
      getLogger().error(`Error resetting configuration: ${err.message}`);
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
      } catch (err: any) {
        getLogger().error(`Error injecting enhanced JavaScript: ${err.message}`);
      }
    }, 1000);
  } catch (err: any) {
    getLogger().error(`Error injecting JavaScript: ${err.message}`);
  }
}