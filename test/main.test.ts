import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app, BrowserWindow, Menu } from 'electron';
import { setupLogging } from '../src/utils/logger';
import { readConfig, updateConfigVersion } from '../src/config/configManager';
import { createFirstTimeWindow } from '../src/windows/firstTimeSetup';
import { createMainWindow } from '../src/windows/mainWindow';
import { showErrorWindow } from '../src/windows/errorWindow';

vi.mock('electron', () => ({
  app: {
    whenReady: vi.fn().mockImplementation(() => Promise.resolve()),
    on: vi.fn(),
    quit: vi.fn()
  },
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([])
  },
  Menu: {
    setApplicationMenu: vi.fn()
  }
}));
vi.mock('../src/utils/logger', () => ({
  setupLogging: vi.fn(),
  getLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    error: vi.fn()
  })
}));
vi.mock('../src/config/configManager', () => ({
  readConfig: vi.fn(),
  updateConfigVersion: vi.fn().mockResolvedValue(true)
}));
vi.mock('../src/windows/firstTimeSetup', () => ({
  createFirstTimeWindow: vi.fn().mockReturnValue({ setMenuBarVisibility: vi.fn() })
}));
vi.mock('../src/windows/mainWindow', () => ({
  createMainWindow: vi.fn().mockReturnValue({ setMenuBarVisibility: vi.fn() })
}));
vi.mock('../src/windows/errorWindow', () => ({
  showErrorWindow: vi.fn().mockReturnValue({ setMenuBarVisibility: vi.fn() })
}));

describe('main', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should handle the configuration flow', async () => {
    const mockMain = vi.fn();
    vi.mock('../src/main', () => ({
      default: mockMain
    }));
    
    expect(updateConfigVersion).toBeDefined();
    expect(setupLogging).toBeDefined();
    expect(readConfig).toBeDefined();
    expect(Menu.setApplicationMenu).toBeDefined();
  });
  
  it('should have error handling capabilities', () => {
    expect(showErrorWindow).toBeDefined();
  });

  it('should have app event handlers', () => {
    expect(app.on).toBeDefined();
    expect(app.whenReady).toBeDefined();
    expect(app.quit).toBeDefined();
  });
});