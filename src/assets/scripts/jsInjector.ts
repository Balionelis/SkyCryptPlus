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

      function showNotification(message, duration = 2000) {
        try {
          const existingNotification = document.getElementById('copy-notification');
          if (existingNotification) {
            existingNotification.remove();
          }

          const notification = document.createElement('div');
          notification.id = 'copy-notification';
          notification.textContent = message;
          notification.style.cssText = 'position: fixed; bottom: 70px; right: 20px; background-color: #282828; color: white; padding: 10px 15px; border-radius: 5px; z-index: 10000; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: opacity 0.3s ease-in-out;';

          document.body.appendChild(notification);

          setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
              notification.remove();
            }, 300);
          }, duration);
        } catch (error) {
          console.error('Error showing notification:', error);
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

        const copyBtn = document.createElement('button');
        copyBtn.id = 'custom-copy-button';
        copyBtn.style.cssText = 'width: 35px; height: 35px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; padding: 4px; outline: none; display: ' + (isMainPage ? 'none' : 'flex') + '; justify-content: center; align-items: center;';
        copyBtn.onclick = () => {
          const currentUrl = window.location.href;
          navigator.clipboard.writeText(currentUrl)
            .then(() => {
              showNotification('URL copied to clipboard!');
            })
            .catch(err => {
              console.error('Error copying URL: ', err);
              showNotification('Failed to copy URL');
            });
        };

        const copySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        copySvg.setAttribute('viewBox', '0 0 24 24');
        copySvg.setAttribute('fill', 'none');
        copySvg.style.width = '100%';
        copySvg.style.height = '100%';
        copySvg.innerHTML = '<path d="M15.197 3.35462C16.8703 1.67483 19.4476 1.53865 20.9536 3.05046C22.4596 4.56228 22.3239 7.14956 20.6506 8.82935L18.2268 11.2626M10.0464 14C8.54044 12.4882 8.67609 9.90087 10.3494 8.22108L12.5 6.06212" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-opacity:1" /><path d="M13.9536 10C15.4596 11.5118 15.3239 14.0991 13.6506 15.7789L11.2268 18.2121L8.80299 20.6454C7.12969 22.3252 4.55237 22.4613 3.0464 20.9495C1.54043 19.4377 1.67609 16.8504 3.34939 15.1706L5.77323 12.7373" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" style="fill:none;fill-opacity:1;stroke:#ffffff;stroke-opacity:1" />';
        copyBtn.appendChild(copySvg);

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

        const profileSwitchOption = document.createElement('div');
        profileSwitchOption.textContent = 'Profile Switch';
        profileSwitchOption.style.cssText = 'padding: 10px; color: #FFFFFF; background-color: transparent; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s; cursor: pointer;';
        profileSwitchOption.onclick = () => {
          openProfileSwitcher();
          settingsDropdown.style.display = 'none';
        };
        settingsDropdown.appendChild(profileSwitchOption);

        const resetConfigOption = document.createElement('div');
        resetConfigOption.textContent = 'Reset Configuration';
        resetConfigOption.style.cssText = 'padding: 5px; color: #FF424D; background-color: transparent; font-weight: bold ; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s; cursor: pointer;';

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
        buttonContainer.appendChild(copyBtn);
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

      function openProfileSwitcher() {
        const existingProfileSwitcher = document.getElementById('profile-switcher-dropdown');
        if (existingProfileSwitcher) {
          existingProfileSwitcher.remove();
        }

        const profileSwitcherDropdown = document.createElement('div');
        profileSwitcherDropdown.id = 'profile-switcher-dropdown';
        profileSwitcherDropdown.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10001; background-color: #282828; border: 1px solid #FFFFFF; border-radius: 5px; display: flex; flex-direction: column; min-width: 350px; max-height: 500px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;';

        const titleBar = document.createElement('div');
        titleBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background-color: #1a1a1a; border-bottom: 1px solid #4a4a4a; cursor: move;'; // Added cursor: move

        const titleText = document.createElement('span');
        titleText.textContent = 'Profile Management';
        titleText.style.cssText = 'color: white; font-weight: bold; pointer-events: none;'; // Added pointer-events: none to prevent issues with dragging

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = 'background: none; border: none; color: white; font-size: 20px; cursor: pointer;';
        closeButton.onclick = () => profileSwitcherDropdown.remove();

        titleBar.appendChild(titleText);
        titleBar.appendChild(closeButton);
        profileSwitcherDropdown.appendChild(titleBar);

        const contentArea = document.createElement('div');
        contentArea.style.cssText = 'padding: 10px; overflow-y: auto; max-height: 400px;';
        profileSwitcherDropdown.appendChild(contentArea);

        const loadingDiv = document.createElement('div');
        loadingDiv.textContent = 'Loading profiles...';
        loadingDiv.style.cssText = 'padding: 20px; text-align: center; color: white;';
        contentArea.appendChild(loadingDiv);

        const addProfileSection = document.createElement('div');
        addProfileSection.style.cssText = 'padding: 15px; border-top: 1px solid #4a4a4a;';

        const addProfileForm = document.createElement('form');
        addProfileForm.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Minecraft Username';
        usernameInput.style.cssText = 'padding: 8px; border-radius: 4px; border: 1px solid #4a4a4a; background-color: #333; color: white;';

        const profileInput = document.createElement('input');
        profileInput.type = 'text';
        profileInput.placeholder = 'Profile Name (e.g., Apple, Banana)';
        profileInput.style.cssText = 'padding: 8px; border-radius: 4px; border: 1px solid #4a4a4a; background-color: #333; color: white;';

        const displayNameInput = document.createElement('input');
        displayNameInput.type = 'text';
        displayNameInput.placeholder = 'Display Name (optional)';
        displayNameInput.style.cssText = 'padding: 8px; border-radius: 4px; border: 1px solid #4a4a4a; background-color: #333; color: white;';

        const addButton = document.createElement('button');
        addButton.textContent = 'Add Profile';
        addButton.style.cssText = 'padding: 8px; border-radius: 4px; background-color: #4CAF50; color: white; border: none; cursor: pointer;';

        addButton.onclick = (e) => {
          e.preventDefault();

          const playerName = usernameInput.value.trim();
          const profileName = profileInput.value.trim();
          const displayName = displayNameInput.value.trim() || \`\${playerName} - \${profileName}\`;

          if (!playerName || !profileName) {
            showNotification('Please enter both username and profile name', 3000);
            return;
          }

          if (window.api) {
            window.api.addSavedProfile(playerName, profileName, displayName)
              .then(success => {
                if (success) {
                  usernameInput.value = '';
                  profileInput.value = '';
                  displayNameInput.value = '';
                  loadProfiles(contentArea);
                  showNotification('Profile added successfully', 2000);
                } else {
                  showNotification('Profile already exists or could not be added', 3000);
                }
              })
              .catch(err => {
                console.error('Error adding profile:', err);
                showNotification('Error adding profile', 3000);
              });
          }
        };

        addProfileForm.appendChild(usernameInput);
        addProfileForm.appendChild(profileInput);
        addProfileForm.appendChild(displayNameInput);
        addProfileForm.appendChild(addButton);
        addProfileSection.appendChild(addProfileForm);

        profileSwitcherDropdown.appendChild(addProfileSection);
        document.body.appendChild(profileSwitcherDropdown);

        makeDraggable(profileSwitcherDropdown, titleBar);

        loadProfiles(contentArea);

        let isDragging = false;
        titleBar.addEventListener('mousedown', () => {
          isDragging = true;
        });

        document.addEventListener('mouseup', () => {
          isDragging = false;
        });

        document.addEventListener('click', function closeProfileSwitcher(e) {
          if (!isDragging && !profileSwitcherDropdown.contains(e.target) && e.target !== profileSwitchOption) {
            profileSwitcherDropdown.remove();
            document.removeEventListener('click', closeProfileSwitcher);
          }
        });
      }

      function makeDraggable(element, dragHandle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          element.style.top = rect.top + 'px';
          element.style.left = rect.left + 'px';
          element.style.transform = 'none';
        }, 10);

        dragHandle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          element.style.top = (element.offsetTop - pos2) + "px";
          element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
          document.onmouseup = null;
          document.onmousemove = null;
        }
      }

      function makeDraggable(element, dragHandle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          element.style.top = rect.top + 'px';
          element.style.left = rect.left + 'px';
          element.style.transform = 'none';
        }, 10);

        dragHandle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          element.style.top = (element.offsetTop - pos2) + "px";
          element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
          document.onmouseup = null;
          document.onmousemove = null;
        }
      }

      function loadProfiles(contentArea) {
        contentArea.innerHTML = '';

        const loadingDiv = document.createElement('div');
        loadingDiv.textContent = 'Loading profiles...';
        loadingDiv.style.cssText = 'padding: 20px; text-align: center; color: white;';
        contentArea.appendChild(loadingDiv);

        if (window.api) {
          window.api.getSavedProfiles()
            .then(data => {
              contentArea.innerHTML = '';

              if (!data.profiles || data.profiles.length === 0) {
                const noProfilesDiv = document.createElement('div');
                noProfilesDiv.textContent = 'No saved profiles found.';
                noProfilesDiv.style.cssText = 'padding: 20px; text-align: center; color: white;';
                contentArea.appendChild(noProfilesDiv);
                return;
              }

              const profilesList = document.createElement('div');
              profilesList.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

              const currentProfileDiv = document.createElement('div');
              currentProfileDiv.textContent = 'Current: ' + data.currentPlayer + ' - ' + data.currentProfile;
              currentProfileDiv.style.cssText = 'padding: 10px; background-color: #1a1a1a; border-radius: 4px; color: #4CAF50; margin-bottom: 10px; font-weight: bold;';
              profilesList.appendChild(currentProfileDiv);

              data.profiles.forEach(profile => {
                const profileRow = document.createElement('div');
                profileRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px; background-color: ' +
                  ((profile.playerName === data.currentPlayer && profile.profileName === data.currentProfile) ?
                  'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)') +
                  '; border-radius: 4px;';

                const profileInfo = document.createElement('div');

                const displayName = document.createElement('div');
                displayName.textContent = profile.displayName || (profile.playerName + ' - ' + profile.profileName);
                displayName.style.cssText = 'font-weight: bold; color: white;';

                const profileDetails = document.createElement('div');
                profileDetails.textContent = profile.playerName + ' / ' + profile.profileName;
                profileDetails.style.cssText = 'font-size: 0.8em; color: #aaa;';

                profileInfo.appendChild(displayName);
                profileInfo.appendChild(profileDetails);

                const actions = document.createElement('div');
                actions.style.cssText = 'display: flex; gap: 5px;';

                if (!(profile.playerName === data.currentPlayer && profile.profileName === data.currentProfile)) {
                  const switchButton = document.createElement('button');
                  switchButton.textContent = 'Switch';
                  switchButton.style.cssText = 'padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;';
                  switchButton.onclick = () => {
                    if (window.api) {
                      window.api.switchProfile(profile.playerName, profile.profileName)
                        .then(success => {
                          if (!success) {
                            showNotification('Failed to switch profile', 3000);
                          }
                        })
                        .catch(err => {
                          console.error('Error switching profile:', err);
                          showNotification('Error switching profile', 3000);
                        });
                    }
                  };
                  actions.appendChild(switchButton);
                }

                if (data.profiles.length > 1) {
                  const deleteButton = document.createElement('button');
                  deleteButton.textContent = 'Delete';
                  deleteButton.style.cssText = 'padding: 5px 10px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;';
                  deleteButton.onclick = () => {
                    if (confirm('Are you sure you want to delete profile: ' + (profile.displayName || (profile.playerName + ' - ' + profile.profileName)) + '?')) {
                      if (window.api) {
                        window.api.removeSavedProfile(profile.playerName, profile.profileName)
                          .then(success => {
                            if (success) {
                              loadProfiles(contentArea);
                              showNotification('Profile removed successfully', 2000);
                            } else {
                              showNotification('Failed to remove profile', 3000);
                            }
                          })
                          .catch(err => {
                            console.error('Error removing profile:', err);
                            showNotification('Error removing profile', 3000);
                          });
                      }
                    }
                  };
                  actions.appendChild(deleteButton);
                }

                profileRow.appendChild(profileInfo);
                profileRow.appendChild(actions);
                profilesList.appendChild(profileRow);
              });

              contentArea.appendChild(profilesList);
            })
            .catch(err => {
              console.error('Error loading profiles:', err);
              contentArea.innerHTML = '';

              const errorDiv = document.createElement('div');
              errorDiv.textContent = 'Error loading profiles. Please try again.';
              errorDiv.style.cssText = 'padding: 20px; text-align: center; color: #f44336;';
              contentArea.appendChild(errorDiv);
            });
        } else {
          contentArea.innerHTML = '';

          const noApiDiv = document.createElement('div');
          noApiDiv.textContent = 'Profile management API not available.';
          noApiDiv.style.cssText = 'padding: 20px; text-align: center; color: #f44336;';
          contentArea.appendChild(noApiDiv);
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
