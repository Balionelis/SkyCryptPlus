import { describe, it, expect } from 'vitest';
import { getEssentialJsCode, getEnhancedJsCode } from '../../src/assets/scripts/jsInjector';

describe('jsInjector', () => {
  it('should generate essential js code with theme name', () => {
    const theme = 'test-theme.json';
    const jsCode = getEssentialJsCode(theme);
    
    expect(jsCode).toContain(`let themeToUse = '${theme}'`);
    expect(jsCode).toContain('window.skycryptEssentialsLoaded = true');
    expect(jsCode).toContain('function applyTheme()');
  });

  it('should generate enhanced js code that checks for essentials', () => {
    const theme = 'test-theme.json';
    const jsCode = getEnhancedJsCode(theme);
    
    expect(jsCode).toContain('if (!window.skycryptEssentialsLoaded) return');
    expect(jsCode).toContain('function addNetworth()');
    expect(jsCode).toContain('function removeHeaderElements()');
    expect(jsCode).toContain('function setupNavigationWatcher()');
  });

  it('should include auto-refresh functionality in enhanced code', () => {
    const jsCode = getEnhancedJsCode('default.json');
    
    expect(jsCode).toContain('function setAutoRefreshInterval(interval)');
    expect(jsCode).toContain('function initAutoRefresh()');
    expect(jsCode).toContain('let autoRefreshTimer = null');
  });

  it('should include update functionality in enhanced code', () => {
    const jsCode = getEnhancedJsCode('default.json');
    
    expect(jsCode).toContain('function addUpdateButton(updateInfo)');
    expect(jsCode).toContain("document.addEventListener('skycryptPlusUpdateAvailable'");
  });
});