import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(
  'api', {
    saveConfig: (username: string, profile: string, theme: string) => {
      return ipcRenderer.invoke('save-config', username, profile, theme);
    }
  }
);