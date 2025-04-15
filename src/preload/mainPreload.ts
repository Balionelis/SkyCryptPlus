import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  saveTheme: (theme: string) => {
    return ipcRenderer.invoke("save-theme", theme);
  },
  saveAutoRefresh: (interval: string) => {
    return ipcRenderer.invoke("save-auto-refresh", interval);
  },
  getAutoRefresh: () => {
    return ipcRenderer.invoke("get-auto-refresh");
  },
  resetConfig: () => {
    return ipcRenderer.invoke("reset-config");
  },
  exitApp: () => {
    return ipcRenderer.invoke("exit-app");
  },
  getSavedProfiles: () => {
    return ipcRenderer.invoke("get-saved-profiles");
  },
  addSavedProfile: (
    playerName: string,
    profileName: string,
    displayName?: string,
  ) => {
    return ipcRenderer.invoke(
      "add-saved-profile",
      playerName,
      profileName,
      displayName,
    );
  },
  removeSavedProfile: (playerName: string, profileName: string) => {
    return ipcRenderer.invoke("remove-saved-profile", playerName, profileName);
  },
  switchProfile: (playerName: string, profileName: string) => {
    return ipcRenderer.invoke("switch-profile", playerName, profileName);
  },
});
