import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  saveTheme: (theme: string) => {
    return ipcRenderer.invoke('save-theme', theme);
  },
  saveAutoRefresh: (interval: string) => {
    return ipcRenderer.invoke('save-auto-refresh', interval);
  },
  getAutoRefresh: () => {
    return ipcRenderer.invoke('get-auto-refresh');
  },
  resetConfig: () => {
    return ipcRenderer.invoke('reset-config');
  },
  exitApp: () => {
    return ipcRenderer.invoke('exit-app');
  }
});