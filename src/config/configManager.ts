import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { getLogger } from "../utils/logger";
import { currentVersion } from "../version";

export interface SavedProfile {
  playerName: string;
  profileName: string;
  displayName?: string;
}

export interface Config {
  version: string;
  createdAt: string;
  playerName: string;
  defaultProfile: string;
  selectedTheme: string;
  autoRefreshInterval: string;
  savedProfiles: SavedProfile[];
}

export function getAppDataPath(): string {
  return path.join(
    process.env.APPDATA ??
      (process.platform === "darwin"
        ? path.join(os.homedir(), "Library/Preferences")
        : path.join(os.homedir(), ".local/share")),
    "SkyCrypt+",
  );
}

export function getConfigPath(): string {
  return path.join(getAppDataPath(), "config.json");
}

export function readConfig(): Config | null {
  try {
    const configPath = getConfigPath();

    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(configData) as Config;
    }
    return null;
  } catch (err: unknown) {
    getLogger().error(
      `Error reading config file: ${err instanceof Error ? err.message : String(err)}`,
    );
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

    let updated = false;

    if (config.version !== currentVersion) {
      config.version = currentVersion;
      updated = true;
    }

    if (!config.savedProfiles) {
      config.savedProfiles = [
        {
          playerName: config.playerName,
          profileName: config.defaultProfile,
          displayName: `${config.playerName} - ${config.defaultProfile}`,
        },
      ];
      updated = true;
      getLogger().info(`Migrated config to include savedProfiles`);
    }

    if (updated) {
      const configPath = getConfigPath();
      await fs.promises.writeFile(configPath, JSON.stringify(config, null, 4));
      getLogger().info(`Updated config to version ${currentVersion}`);
    }

    return true;
  } catch (err: unknown) {
    getLogger().error(
      `Error updating config version: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}

export function saveConfig(
  username: string,
  profile: string,
  theme = "default.json",
  autoRefresh = "off",
  savedProfiles?: SavedProfile[],
): boolean {
  try {
    const appDataPath = getAppDataPath();
    const configPath = getConfigPath();

    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }

    let profiles = savedProfiles;
    if (!profiles) {
      const existingConfig = readConfig();
      if (existingConfig?.savedProfiles) {
        profiles = existingConfig.savedProfiles;
      } else {
        profiles = [
          {
            playerName: username,
            profileName: profile,
            displayName: `${username} - ${profile}`,
          },
        ];
      }
    }

    const config: Config = {
      version: currentVersion,
      createdAt: new Date().toISOString(),
      playerName: username,
      defaultProfile: profile,
      selectedTheme: theme,
      autoRefreshInterval: autoRefresh,
      savedProfiles: profiles,
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    getLogger().info(
      `Configuration saved for ${username} with profile ${profile}, theme ${theme}, and auto refresh ${autoRefresh}`,
    );
    return true;
  } catch (err: unknown) {
    getLogger().error(
      `Error saving config file: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}

export function addSavedProfile(
  playerName: string,
  profileName: string,
  displayName?: string,
): boolean {
  try {
    const config = readConfig();
    if (!config) return false;

    const newProfile: SavedProfile = {
      playerName,
      profileName,
      displayName: displayName || `${playerName} - ${profileName}`,
    };

    const exists = config.savedProfiles?.some(
      (p) => p.playerName === playerName && p.profileName === profileName,
    );

    if (exists) {
      getLogger().info(`Profile ${playerName}/${profileName} already exists`);
      return false;
    }

    if (!config.savedProfiles) {
      config.savedProfiles = [];
    }

    config.savedProfiles.push(newProfile);

    return saveConfig(
      config.playerName,
      config.defaultProfile,
      config.selectedTheme,
      config.autoRefreshInterval,
      config.savedProfiles,
    );
  } catch (err: unknown) {
    getLogger().error(
      `Error adding saved profile: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}

export function removeSavedProfile(
  playerName: string,
  profileName: string,
): boolean {
  try {
    const config = readConfig();
    if (!config || !config.savedProfiles) return false;

    const newProfiles = config.savedProfiles.filter(
      (p) => !(p.playerName === playerName && p.profileName === profileName),
    );

    if (newProfiles.length === 0) {
      getLogger().info(`Cannot remove the last saved profile`);
      return false;
    }

    let currentPlayerName = config.playerName;
    let currentProfileName = config.defaultProfile;

    if (
      playerName === config.playerName &&
      profileName === config.defaultProfile
    ) {
      currentPlayerName = newProfiles[0].playerName;
      currentProfileName = newProfiles[0].profileName;
    }

    return saveConfig(
      currentPlayerName,
      currentProfileName,
      config.selectedTheme,
      config.autoRefreshInterval,
      newProfiles,
    );
  } catch (err: unknown) {
    getLogger().error(
      `Error removing saved profile: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}

export function switchToProfile(
  playerName: string,
  profileName: string,
): boolean {
  try {
    const config = readConfig();
    if (!config) return false;

    const profileExists = config.savedProfiles?.some(
      (p) => p.playerName === playerName && p.profileName === profileName,
    );

    if (!profileExists) {
      getLogger().info(
        `Profile ${playerName}/${profileName} not found in saved profiles`,
      );
      return false;
    }

    return saveConfig(
      playerName,
      profileName,
      config.selectedTheme,
      config.autoRefreshInterval,
      config.savedProfiles,
    );
  } catch (err: unknown) {
    getLogger().error(
      `Error switching profile: ${err instanceof Error ? err.message : String(err)}`,
    );
    return false;
  }
}
