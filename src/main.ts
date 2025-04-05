import { app, BrowserWindow, Menu } from 'electron';
import { setupLogging } from './utils/logger';
import { readConfig, updateConfigVersion } from './config/configManager';
import { createFirstTimeWindow } from './windows/firstTimeSetup';
import { createMainWindow } from './windows/mainWindow';
import { showErrorWindow } from './windows/errorWindow';

async function main() {
  try {
    await updateConfigVersion();
    setupLogging();
    const config = readConfig();
    
    Menu.setApplicationMenu(null);
    
    if (config?.playerName && config.defaultProfile) {
      const username = config.playerName;
      const profile = config.defaultProfile;
      const theme = config.selectedTheme || 'default.json';
      return createMainWindow(username, profile, theme);
    } else {
      return createFirstTimeWindow();
    }
  } catch (err: unknown) {
    const errorDetails = `Error: ${err instanceof Error ? err.message : String(err)}\n\nStack trace:${err instanceof Error ? err.stack : ''}`;
    console.error(errorDetails);
    return showErrorWindow(errorDetails);
  }
}

app.whenReady().then(() => {
  try {
    app.on('browser-window-created', (_, window) => {
      window.setMenuBarVisibility(false);
      window.setMaximizable(false);
      window.setFullScreenable(false);
      
      window.on('maximize', () => {
        window.unmaximize();
      });
      
      window.on('enter-full-screen', () => {
        window.setFullScreen(false);
      });
    });
    
    void main();
  } catch (err: unknown) {
    const errorDetails = `Unhandled Error: ${err instanceof Error ? err.message : String(err)}\n\nStack trace:${err instanceof Error ? err.stack : ''}`;
    console.error(errorDetails);
    showErrorWindow(errorDetails);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void main();
  }
});