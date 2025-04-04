export function getEssentialJsCode(theme: string): string {
  return `
    (function() {
      function applyTheme() {
        try {
          let themeToUse = '${theme}';
          localStorage.setItem('currentTheme', themeToUse);        
          const html = document.documentElement;
          const themeName = themeToUse.replace('.json', '');
          html.setAttribute('data-theme', themeName);
          console.log('SkyCrypt+ theme applied: ' + themeName);
          
          return true;
        } catch (error) {
          console.error('SkyCrypt+ Error in applyTheme:', error);
          
          try {
            const html = document.documentElement;
            html.setAttribute('data-theme', '${theme}'.replace('.json', ''));
          } catch (fallbackError) {
            console.error('SkyCrypt+ Fallback theme application failed:', fallbackError);
          }
          
          return false;
        }
      }

      let themeApplied = applyTheme();
      
      const themeObserver = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && 
              mutation.attributeName === 'data-theme' && 
              mutation.target === document.documentElement) {
            
            const currentTheme = localStorage.getItem('currentTheme');
            const expectedThemeName = currentTheme ? currentTheme.replace('.json', '') : '${theme}'.replace('.json', '');
            const actualTheme = document.documentElement.getAttribute('data-theme');
            
            if (actualTheme !== expectedThemeName) {
              console.log('SkyCrypt+ theme override: ' + expectedThemeName);
              document.documentElement.setAttribute('data-theme', expectedThemeName);
            }
          }
        }
      });
      
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
      
      document.addEventListener('DOMContentLoaded', function() {
        if (!themeApplied) {
          console.log('SkyCrypt+ attempting to apply theme after DOMContentLoaded');
          themeApplied = applyTheme();
        }
      });
      
      window.addEventListener('load', function() {
        if (!themeApplied) {
          console.log('SkyCrypt+ attempting to apply theme after window load');
          applyTheme();
        }
      });
      
      window.skycryptEssentialsLoaded = true;
    })();
  `;
}
  
export function getEnhancedJsCode(theme: string): string {
  return `
    (function() {
      if (!window.skycryptEssentialsLoaded) return;
      
      function batchDomChanges(callback) {
        return window.requestAnimationFrame(() => {
          callback();
        });
      }

      function removeHeaderElements() {
        try {
          batchDomChanges(() => {
            const elements = [
              document.querySelector('.flex.flex-wrap.items-center.gap-x-4.gap-y-2'),
              document.querySelector('.text-text.w-full.space-y-4.p-5.font-medium.text-pretty.select-none'),
              document.querySelector('button[aria-haspopup="dialog"][data-state="closed"] svg.lucide-info')?.closest('button'),
              document.getElementById('bits-5')
            ];
            
            elements.forEach(el => el && el.remove());
          });
        } catch (error) {
          console.error('Error removing header elements:', error);
        }
      }

      function addNetworth() {
        try {
          if (window.isAddingNetworth) {
            return;
          }
          
          window.isAddingNetworth = true;
          
          const existingNetworths = document.querySelectorAll('#player_networth');
          existingNetworths.forEach(el => el.remove());
          
          const networthButtons = document.querySelectorAll("button");
          let networthValue = null;
          
          for (const button of networthButtons) {
            if (button.textContent.includes("Networth:")) {
              const spans = button.querySelectorAll("span");
              for (const span of spans) {
                if (span.textContent && !span.textContent.includes("*")) {
                  networthValue = span.textContent.trim();
                  break;
                }
              }
              break;
            }
          }
          
          if (networthValue) {
            batchDomChanges(() => {
              const targetDiv = document.querySelector("div.flex.flex-wrap.items-center.gap-x-2.gap-y-3.text-4xl");
              
              if (targetDiv) {
                const networthEl = document.createElement("span");
                networthEl.id = "player_networth";
                networthEl.style.cssText = "position: relative; display: inline-block; font-weight: 600; cursor: context-menu; background-color: rgba(127, 127, 127, .2); border-radius: 100px; padding: 0 15px; height: 54px; line-height: 54px; vertical-align: middle; font-size: 30px; margin-left: 10px;";
                
                const labelSpan = document.createElement("span");
                labelSpan.textContent = "Networth: ";
                
                const valueSpan = document.createElement("span");
                valueSpan.textContent = networthValue;
                valueSpan.style.color = "#55FF55";
                
                networthEl.appendChild(labelSpan);
                networthEl.appendChild(valueSpan);
                
                targetDiv.appendChild(networthEl);
              }
            });
          }
          setTimeout(() => {
            window.isAddingNetworth = false;
          }, 100);
        } catch (error) {
          console.error("Error adding Networth:", error);
          window.isAddingNetworth = false;
        }
      }
      
      function removeBanners() {
        try {
          batchDomChanges(() => {
            document.querySelectorAll('figure.banner').forEach(banner => banner.remove());
          });
        } catch (error) {
          console.error('Error removing banners:', error);
        }
      }

      function setupNavigationWatcher() {
        try {
          let debounceTimer;
          let isProcessing = false;
          
          const processChanges = () => {
            if (isProcessing) return;
            
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              isProcessing = true;
              
              removeHeaderElements();
              addNetworth();
              removeBanners();
              changeSiteName();
              
              setTimeout(() => {
                isProcessing = false;
              }, 200);
            }, 300);
          };
          
          const navigationObserver = new MutationObserver((mutations) => {
            const isRelevantChange = mutations.some(mutation => {
              return (
                mutation.target.classList && 
                (mutation.target.classList.contains('flex') || 
                mutation.target.id === 'player_networth' ||
                mutation.target.id === 'custom-buttons-container')
              ) || 
              mutation.addedNodes.length > 3 ||
              mutation.removedNodes.length > 3;
            });
            
            if (isRelevantChange) {
              processChanges();
            }
          });
          
          navigationObserver.observe(document.body, {
            childList: true, 
            subtree: true,
            attributes: false,
            characterData: false
          });

          let lastUrlPath = location.pathname + location.search;
          new MutationObserver(() => {
            const currentUrlPath = location.pathname + location.search;
            if (currentUrlPath !== lastUrlPath) {
              lastUrlPath = currentUrlPath;
              window.location.reload();
            }
          }).observe(document, {
            subtree: true, 
            childList: true,
            attributes: false,
            characterData: false
          });
          
          processChanges();
          
          window.addEventListener('focus', () => {
            const existingNetworths = document.querySelectorAll('#player_networth');
            if (existingNetworths.length > 1) {
              existingNetworths.forEach((el, index) => {
                if (index > 0) el.remove();
              });
            }
            processChanges();
          });
        } catch (error) {
          console.error('Error setting up navigation watcher:', error);
        }
      }     

      function changeSiteName() {
        try {
          batchDomChanges(() => {
            const linkWithSiteName = document.querySelector('a[data-button-root="true"][href="/"], a[href="/"]');
            
            if (linkWithSiteName) {
              const childNodes = Array.from(linkWithSiteName.childNodes);
              for (let i = 0; i < childNodes.length; i++) {
                const node = childNodes[i];
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === "SkyCrypt") {
                  node.textContent = " SkyCrypt+ ";
                  return;
                }
              }
            }
          });
        } catch (error) {
          console.error('Error changing site name:', error);
        }
      }
      
      removeHeaderElements();
      addNetworth();
      removeBanners();
      changeSiteName();
      setupNavigationWatcher();
      
      setTimeout(() => {
        addCustomButtons();
        initAutoRefresh();
        
        if (window.updateInfo) {
          addUpdateButton(window.updateInfo);
        }
      }, 500);
      
      function addCustomButtons() {
        const pathParts = window.location.pathname.split('/');
        const username = pathParts[2] || '';
        const profile = pathParts[3] || '';
        const isMainPage = window.location.pathname === '/' || !username;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'custom-buttons-container';
        buttonContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; gap: 10px; align-items: center;';

        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'custom-reload-button';
        refreshBtn.textContent = 'Refresh Page';
        refreshBtn.style.cssText = 'width: 120px; height: 35px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; display: flex; justify-content: center; align-items: center;';
        refreshBtn.onclick = () => window.location.reload();

        const sitesBtn = document.createElement('button');
        sitesBtn.id = 'custom-websites-button';
        sitesBtn.textContent = 'Other Websites';
        sitesBtn.style.cssText = 'width: 140px; height: 35px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; display: ' + (isMainPage ? 'none' : 'flex') + '; justify-content: center; align-items: center;';

        const sitesDropdown = document.createElement('div');
        sitesDropdown.id = 'websites-dropdown';
        sitesDropdown.style.cssText = 'position: fixed; bottom: 80px; right: 140px; z-index: 10000; background-color: #282828; border: 1px solid #FFFFFF; border-radius: 5px; display: none; flex-direction: column; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

        const themeBtn = document.createElement('button');
        themeBtn.id = 'custom-theme-button';
        themeBtn.textContent = 'Themes';
        themeBtn.style.cssText = 'width: 80px; height: 35px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; display: flex; justify-content: center; align-items: center;';

        const themesDropdown = document.createElement('div');
        themesDropdown.id = 'themes-dropdown';
        themesDropdown.style.cssText = 'position: fixed; bottom: 80px; right: 100px; z-index: 10000; background-color: #282828; border: 1px solid #FFFFFF; border-radius: 5px; display: none; flex-direction: column; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'custom-settings-button';
        settingsBtn.style.cssText = 'width: 35px; height: 35px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; padding: 4px; outline: none; display: flex; justify-content: center; align-items: center;';

        const settingsSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        settingsSvg.setAttribute('viewBox', '0 0 24 24');
        settingsSvg.setAttribute('fill', 'none');
        settingsSvg.style.width = '100%';
        settingsSvg.style.height = '100%';
        settingsSvg.innerHTML = '<circle cx="12" cy="12" r="3" stroke="#ffffff" stroke-width="1.5" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-opacity:1" /><path d="M3.66122 10.6392C4.13377 10.9361 4.43782 11.4419 4.43782 11.9999C4.43781 12.558 4.13376 13.0638 3.66122 13.3607C3.33966 13.5627 3.13248 13.7242 2.98508 13.9163C2.66217 14.3372 2.51966 14.869 2.5889 15.3949C2.64082 15.7893 2.87379 16.1928 3.33973 16.9999C3.80568 17.8069 4.03865 18.2104 4.35426 18.4526C4.77508 18.7755 5.30694 18.918 5.83284 18.8488C6.07287 18.8172 6.31628 18.7185 6.65196 18.5411C7.14544 18.2803 7.73558 18.2699 8.21895 18.549C8.70227 18.8281 8.98827 19.3443 9.00912 19.902C9.02332 20.2815 9.05958 20.5417 9.15224 20.7654C9.35523 21.2554 9.74458 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8478 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.9021C15.0117 19.3443 15.2977 18.8281 15.7811 18.549C16.2644 18.27 16.8545 18.2804 17.3479 18.5412C17.6837 18.7186 17.9271 18.8173 18.1671 18.8489C18.693 18.9182 19.2249 18.7756 19.6457 18.4527C19.9613 18.2106 20.1943 17.807 20.6603 17C20.8677 16.6407 21.029 16.3614 21.1486 16.1272M20.3387 13.3608C19.8662 13.0639 19.5622 12.5581 19.5621 12.0001C19.5621 11.442 19.8662 10.9361 20.3387 10.6392C20.6603 10.4372 20.8674 10.2757 21.0148 10.0836C21.3377 9.66278 21.4802 9.13092 21.411 8.60502C21.3591 8.2106 21.1261 7.80708 20.6601 7.00005C20.1942 6.19301 19.9612 5.7895 19.6456 5.54732C19.2248 5.22441 18.6929 5.0819 18.167 5.15113C17.927 5.18274 17.6836 5.2814 17.3479 5.45883C16.8544 5.71964 16.2643 5.73004 15.781 5.45096C15.2977 5.1719 15.0117 4.6557 14.9909 4.09803C14.9767 3.71852 14.9404 3.45835 14.8478 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74458 2.35523 9.35523 2.74458 9.15224 3.23463C9.05958 3.45833 9.02332 3.71848 9.00912 4.09794C8.98826 4.65566 8.70225 5.17191 8.21891 5.45096C7.73557 5.73002 7.14548 5.71959 6.65205 5.4588C6.31633 5.28136 6.0729 5.18269 5.83285 5.15108C5.30695 5.08185 4.77509 5.22436 4.35427 5.54727C4.03866 5.78945 3.80569 6.19297 3.33974 7C3.13231 7.35929 2.97105 7.63859 2.85138 7.87273" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-opacity:1" />';
        settingsBtn.appendChild(settingsSvg);            

        const settingsDropdown = document.createElement('div');
        settingsDropdown.id = 'settings-dropdown';
        settingsDropdown.style.cssText = 'position: fixed; bottom: 80px; right: 20px; z-index: 10000; background-color: #282828; border: 1px solid #FFFFFF; border-radius: 5px; display: none; flex-direction: column; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

        const patreonBtn = document.createElement('button');
        patreonBtn.id = 'custom-patreon-button';
        patreonBtn.style.cssText = 'width: 35px; height: 35px; background-color: #FF424D; border: none; border-radius: 5px; cursor: pointer; padding: 4px; outline: none; display: flex; justify-content: center; align-items: center;';
        patreonBtn.onclick = () => window.open('https://www.patreon.com/shiiyu', '_blank');

        const patreonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        patreonSvg.setAttribute('version', '1.2');
        patreonSvg.setAttribute('baseProfile', 'tiny');
        patreonSvg.setAttribute('viewBox', '0 0 1014.8 1014.8');
        patreonSvg.setAttribute('overflow', 'visible');
        patreonSvg.style.width = '100%';
        patreonSvg.style.height = '100%';
        patreonSvg.innerHTML = '<path fill="#FF424D" d="M507.4,1014.8L507.4,1014.8C227.2,1014.8,0,787.7,0,507.4v0C0,227.2,227.2,0,507.4,0h0c280.2,0,507.4,227.2,507.4,507.4v0C1014.8,787.7,787.7,1014.8,507.4,1014.8z"/><g><circle fill="#FFFFFF" cx="586.4" cy="439.1" r="204.6"/><rect x="223.8" y="234.5" fill="#241E12" width="100" height="545.8"/></g>';
        patreonBtn.appendChild(patreonSvg);

        const websites = [
          { name: "MinionAH", url: "https://minionah.com/" },
          { name: "Plancke", url: "https://plancke.io/hypixel/player/stats/" + username },
          { name: "EliteBot", url: "https://elitebot.dev/@" + username + "/" + profile },
          { name: "Coflnet", url: "https://sky.coflnet.com/player/" + username }
        ];

        const themes = [
          { name: "Default Theme", file: "default.json" },
          { name: "Draconic Purple Theme", file: "draconic.json" },
          { name: "Default Light Theme", file: "light.json" },
          { name: "sky.lea.moe", file: "skylea.json" },
          { name: "Night Blue Theme", file: "nightblue.json" },
          { name: "Sunrise Orange Theme", file: "sunrise.json" },
          { name: "Burning Cinnabar Theme", file: "burning-cinnabar.json" },
          { name: "Candy Cane Theme", file: "candycane.json" },
          { name: "April Fools 2024 Theme", file: "april-fools-2024.json" }
        ];

        const autoRefreshOptions = [
          { name: "Turn Off", value: "off" },
          { name: "1 minute", value: "1" },
          { name: "2 minutes", value: "2" },
          { name: "3 minutes", value: "3" },
          { name: "4 minutes", value: "4" },
          { name: "5 minutes", value: "5" }
        ];            

        websites.forEach(site => {
          const link = document.createElement('a');
          link.textContent = site.name;
          link.href = site.url;
          link.target = '_blank';
          link.style.cssText = 'padding: 10px; color: #FFFFFF; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s;';
          link.onmouseover = () => link.style.backgroundColor = 'rgba(224, 224, 224, 0.5)';
          link.onmouseout = () => link.style.backgroundColor = 'transparent';
          sitesDropdown.appendChild(link);
        });

        const currentTheme = localStorage.getItem('currentTheme') || 'default.json';
        themes.forEach(theme => {
          const option = document.createElement('div');
          option.textContent = theme.name;
          option.dataset.file = theme.file;
          option.style.cssText = 'padding: 10px; color: #FFFFFF; background-color: transparent; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s; cursor: pointer;';
          
          option.onclick = () => {
            applyThemeSelection(theme.file);
            
            document.querySelectorAll('#themes-dropdown > div').forEach(opt => {
              opt.style.backgroundColor = opt.dataset.file === theme.file ? 'rgba(224, 224, 224, 0.5)' : 'transparent';
            });
            
            themesDropdown.style.display = 'none';
          };
          
          themesDropdown.appendChild(option);
        });

        const autoRefreshHeading = document.createElement('div');
        autoRefreshHeading.textContent = 'Auto Refresh:';
        autoRefreshHeading.style.cssText = 'padding: 10px; color: #FFFFFF; font-weight: bold; border-bottom: 1px solid #e0e0e0;';
        settingsDropdown.appendChild(autoRefreshHeading);

        function applyThemeSelection(themeFile) {
          try {
            localStorage.setItem('currentTheme', themeFile);
            const html = document.documentElement;
            const themeName = themeFile.replace('.json', '');
            html.setAttribute('data-theme', themeName);
            
            if (window.api) {
              window.api.saveTheme(themeFile);
            }
          } catch (error) {
            console.error('Error applying theme:', error);
          }
        }

        autoRefreshOptions.forEach(option => {
          const optionElement = document.createElement('div');
          optionElement.textContent = option.name;
          optionElement.dataset.value = option.value;
          optionElement.style.cssText = 'padding: 10px; color: #FFFFFF; background-color: transparent; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s; cursor: pointer;';
          
          optionElement.onclick = () => {
            setAutoRefreshInterval(option.value);
            
            document.querySelectorAll('#settings-dropdown > div:not(:first-child)').forEach(opt => {
              opt.style.backgroundColor = opt.textContent === option.name ? 'rgba(224, 224, 224, 0.5)' : 'transparent';
            });
            
            settingsDropdown.style.display = 'none';
          };
          
          settingsDropdown.appendChild(optionElement);
        });
        
        const resetConfigOption = document.createElement('div');
        resetConfigOption.textContent = 'Reset Configuration';
        resetConfigOption.style.cssText = 'padding: 10px; color: #FF424D; background-color: transparent; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s; cursor: pointer; margin-top: 10px;';
        
        resetConfigOption.onclick = () => {
          if (confirm('Are you sure you want to reset all configuration? The application will close.')) {
            if (window.api) {
              window.api.resetConfig().then(() => {
                if (window.api.exitApp) {
                  window.api.exitApp();
                } else {
                  console.log('Exit API not available, just reloading');
                  window.location.reload();
                }
              }).catch((error) => {
                console.error('Error resetting configuration:', error);
              });
            }
          }
          settingsDropdown.style.display = 'none';
        };
        
        settingsDropdown.appendChild(resetConfigOption);

        sitesBtn.onclick = () => {
          sitesDropdown.style.display = sitesDropdown.style.display === 'none' || sitesDropdown.style.display === '' ? 'flex' : 'none';
        };

        themeBtn.onclick = () => {
          if (themesDropdown.style.display === 'none' || themesDropdown.style.display === '') {
            updateThemeHighlight();
            themesDropdown.style.display = 'flex';
          } else {
            themesDropdown.style.display = 'none';
          }
        };

        settingsBtn.onclick = () => {
          if (settingsDropdown.style.display === 'none' || settingsDropdown.style.display === '') {
            updateAutoRefreshHighlight();
            settingsDropdown.style.display = 'flex';
          } else {
            settingsDropdown.style.display = 'none';
          }
        };

        function updateThemeHighlight() {
          try {
            const currentTheme = localStorage.getItem('currentTheme') || 'default.json';
            
            document.querySelectorAll('#themes-dropdown > div').forEach(opt => {
              const themeFile = opt.dataset.file;
              opt.style.backgroundColor = themeFile === currentTheme ? 'rgba(224, 224, 224, 0.5)' : 'transparent';
            });
          } catch (error) {
            console.error('Error updating theme highlight:', error);
          }
        }

        function updateAutoRefreshHighlight() {
          try {
            if (window.api) {
              window.api.getAutoRefresh().then((interval) => {
                document.querySelectorAll('#settings-dropdown > div:not(:first-child)').forEach(opt => {
                  const optionValue = opt.dataset.value;
                  opt.style.backgroundColor = optionValue === interval ? 'rgba(224, 224, 224, 0.5)' : 'transparent';
                });
              }).catch((error) => {
                console.error('Error getting auto refresh setting from config for highlighting:', error);
              });
            } else {
              const interval = localStorage.getItem('autoRefreshInterval') || 'off';
              document.querySelectorAll('#settings-dropdown > div:not(:first-child)').forEach(opt => {
                const optionValue = opt.dataset.value;
                opt.style.backgroundColor = optionValue === interval ? 'rgba(224, 224, 224, 0.5)' : 'transparent';
              });
            }
          } catch (error) {
            console.error('Error updating auto refresh highlight:', error);
          }
        }            

        document.addEventListener('click', (e) => {
          if (!sitesBtn.contains(e.target) && !sitesDropdown.contains(e.target)) {
            sitesDropdown.style.display = 'none';
          }
          if (!themeBtn.contains(e.target) && !themesDropdown.contains(e.target)) {
            themesDropdown.style.display = 'none';
          }
          if (!settingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
            settingsDropdown.style.display = 'none';
          }
        });

        buttonContainer.appendChild(refreshBtn);
        buttonContainer.appendChild(sitesBtn);
        buttonContainer.appendChild(themeBtn);
        buttonContainer.appendChild(settingsBtn);
        buttonContainer.appendChild(patreonBtn);

        document.body.appendChild(buttonContainer);
        document.body.appendChild(sitesDropdown);
        document.body.appendChild(themesDropdown);
        document.body.appendChild(settingsDropdown);

        initAutoRefresh();
      }
      
      let autoRefreshTimer = null;
      
      function setAutoRefreshInterval(interval) {
        try {
          localStorage.setItem('autoRefreshInterval', interval);
          
          if (window.api) {
            window.api.saveAutoRefresh(interval);
          }
          
          if (autoRefreshTimer) {
            clearTimeout(autoRefreshTimer);
            autoRefreshTimer = null;
          }
          
          if (interval !== 'off') {
            const minutes = parseInt(interval);
            if (!isNaN(minutes) && minutes > 0) {
              const milliseconds = minutes * 60 * 1000;
              autoRefreshTimer = setTimeout(() => window.location.reload(), milliseconds);
            }
          }
        } catch (error) {
          console.error('Error setting auto refresh interval:', error);
        }
      }
      
      function initAutoRefresh() {
        try {
          const interval = localStorage.getItem('autoRefreshInterval');
          
          if (interval && interval !== 'off') {
            setAutoRefreshInterval(interval);
          } else if (window.api) {
            window.api.getAutoRefresh().then((interval) => {
              if (interval && interval !== 'off') {
                localStorage.setItem('autoRefreshInterval', interval);
                setAutoRefreshInterval(interval);
              }
            }).catch((error) => {
              console.error('Error getting auto refresh setting from config:', error);
            });
          }
        } catch (error) {
          console.error('Error initializing auto refresh:', error);
        }
      }
      
      function addUpdateButton(updateInfo) {
        try {
          const buttonContainer = document.getElementById('custom-buttons-container');
          
          if (!buttonContainer || document.getElementById('update-available-button')) {
            return;
          }
          
          const updateBtn = document.createElement('button');
          updateBtn.id = 'update-available-button';
          updateBtn.textContent = 'Update Available: v' + updateInfo.latestVersion;
          updateBtn.style.cssText = 'width: 210px; height: 35px; background-color: #FF424D; color: white; border: none; border-radius: 5px; cursor: pointer; display: flex; justify-content: center; align-items: center;';
          updateBtn.onmouseout = () => updateBtn.style.backgroundColor = '#FF424D';
          updateBtn.onclick = () => window.open(updateInfo.releaseUrl, '_blank');
          
          buttonContainer.insertBefore(updateBtn, buttonContainer.firstChild);
        } catch (error) {
          console.error('Error adding update button:', error);
        }
      }
      
      document.addEventListener('skycryptPlusUpdateAvailable', (event) => {
        addUpdateButton(event.detail);
      });
    })();
  `;
}