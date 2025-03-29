# SkyCryptPlus/assets/js/injector.py
# Handles JavaScript code injection for the webview

def get_js_code(theme):
    """
    Returns the JavaScript code to inject into the webview,
    with the provided theme setting
    """
    js_code = f"""
    (function() {{
        console.log('SkyCrypt+ JavaScript starting');
        
        // Function to remove unneeded header elements
        function removeHeaderElements() {{
            console.log('Removing header elements');
            try {{
                document.getElementById('additional_player_stats')?.remove();
                document.getElementById('info-button')?.remove();
                document.getElementById('api_button')?.remove();
                document.querySelector('a.blm-logo')?.remove();
                document.getElementById('info-box')?.remove();
            }} catch (error) {{
                console.error('Error removing header elements:', error);
            }}
        }}

        // Function to add networth element at the top
        function addNetworth() {{
            console.log('Adding networth element');
            try {{
                const networth = document.querySelector('#additional_stats_container .additional-stat span[data-tippy-content*="Total Networth"] .stat-value');
                const profileStats = document.getElementById('stats_for_profile');
                
                if (profileStats && networth) {{
                    const value = networth.textContent.trim();
                    
                    const networthEl = document.createElement('span');
                    networthEl.id = 'player_networth';
                    networthEl.className = 'player-networth';
                    networthEl.style.cssText = 'position: relative; display: inline-block; font-weight: 600; cursor: context-menu; background-color: rgba(127, 127, 127, .2); border-radius: 100px; padding: 0 15px; height: 54px; line-height: 54px; vertical-align: middle; font-size: 30px; margin-left: 10px;';
                    
                    const labelSpan = document.createElement('span');
                    labelSpan.textContent = 'Networth: ';
                    
                    const valueSpan = document.createElement('span');
                    valueSpan.textContent = value;
                    valueSpan.style.color = '#55FF55';
                    
                    networthEl.appendChild(labelSpan);
                    networthEl.appendChild(valueSpan);
                    
                    profileStats.insertAdjacentElement('afterend', networthEl);
                    console.log('Networth added');
                }} else {{
                    console.warn('Could not find networth or stats_for_profile');
                }}
            }} catch (error) {{
                console.error('Error adding Networth:', error);
            }}
        }}

        // Remove donation banners
        function removeBanners() {{
            try {{
                document.querySelectorAll('figure.banner').forEach(banner => banner.remove());
                console.log('Banners removed');
            }} catch (error) {{
                console.error('Error removing banners:', error);
            }}
        }}

        // Hide and watch the themes button
        function handleThemes() {{
            const themesBtn = document.getElementById('themes-button');
            const themesList = document.getElementById('themes-box');
            
            if (themesBtn && themesList) {{
                themesBtn.style.display = 'none';
                themesList.style.display = 'none';
                themesList.style.visibility = 'hidden';
                
                // Watch for theme changes
                new MutationObserver((mutations) => {{
                    mutations.forEach((mutation) => {{
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {{
                            document.querySelectorAll('input[name="theme"]').forEach(radio => {{
                                radio.addEventListener('change', () => {{
                                    if (!localStorage.getItem('themesButtonVisible')) {{
                                        localStorage.setItem('themesButtonVisible', 'true');
                                        const theme = radio.value.split('/').pop();
                                        window.pywebview.api.save_theme(theme);
                                    }}
                                }});
                            }});
                        }}
                    }});
                }}).observe(themesBtn, {{ attributes: true }});
            }}
        }}
        
        // Add all the custom buttons
        function addCustomButtons() {{
            console.log('Adding custom buttons');
            
            // Get username and profile from URL
            const pathParts = window.location.pathname.split('/');
            const username = pathParts[2] || '';
            const profile = pathParts[3] || '';
            const isMainPage = window.location.href === 'https://sky.shiiyu.moe/';
            
            // Create button container
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'custom-buttons-container';
            buttonContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; gap: 10px; align-items: center;';

            // Create refresh button
            const refreshBtn = document.createElement('button');
            refreshBtn.id = 'custom-reload-button';
            refreshBtn.textContent = 'Refresh Page';
            refreshBtn.style.cssText = 'padding: 10px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; outline: none;';
            refreshBtn.onclick = () => window.location.reload();

            // Create websites button
            const sitesBtn = document.createElement('button');
            sitesBtn.id = 'custom-websites-button';
            sitesBtn.textContent = 'Other Websites';
            sitesBtn.style.cssText = `padding: 10px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; outline: none; display: ${{isMainPage ? 'none' : 'block'}};`;

            // Create websites dropdown
            const sitesDropdown = document.createElement('div');
            sitesDropdown.id = 'websites-dropdown';
            sitesDropdown.style.cssText = 'position: fixed; bottom: 80px; right: 140px; z-index: 10000; background-color: #282828; border: 1px solid #FFFFFF; border-radius: 5px; display: none; flex-direction: column; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

            // Create themes button
            const themeBtn = document.createElement('button');
            themeBtn.id = 'custom-theme-button';
            themeBtn.textContent = 'Themes';
            themeBtn.style.cssText = 'width: 75px; height: 35px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; display: flex; justify-content: center; align-items: center;';

            // Create themes dropdown
            const themesDropdown = document.createElement('div');
            themesDropdown.id = 'themes-dropdown';
            themesDropdown.style.cssText = 'position: fixed; bottom: 80px; right: 100px; z-index: 10000; background-color: #282828; border: 1px solid #FFFFFF; border-radius: 5px; display: none; flex-direction: column; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

            // Create Patreon button
            const patreonBtn = document.createElement('button');
            patreonBtn.id = 'custom-patreon-button';
            patreonBtn.style.cssText = 'width: 35px; height: 35px; background-color: #FF424D; border: none; border-radius: 5px; cursor: pointer; padding: 4px; outline: none; display: flex; justify-content: center; align-items: center;';
            patreonBtn.onclick = () => window.open('https://www.patreon.com/shiiyu', '_blank');

            // Create Patreon SVG
            const patreonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            patreonSvg.setAttribute('version', '1.2');
            patreonSvg.setAttribute('baseProfile', 'tiny');
            patreonSvg.setAttribute('viewBox', '0 0 1014.8 1014.8');
            patreonSvg.setAttribute('overflow', 'visible');
            patreonSvg.style.width = '100%';
            patreonSvg.style.height = '100%';
            patreonSvg.innerHTML = '<path fill="#FF424D" d="M507.4,1014.8L507.4,1014.8C227.2,1014.8,0,787.7,0,507.4v0C0,227.2,227.2,0,507.4,0h0c280.2,0,507.4,227.2,507.4,507.4v0C1014.8,787.7,787.7,1014.8,507.4,1014.8z"/><g><circle fill="#FFFFFF" cx="586.4" cy="439.1" r="204.6"/><rect x="223.8" y="234.5" fill="#241E12" width="100" height="545.8"/></g>';
            patreonBtn.appendChild(patreonSvg);

            // Define websites
            const websites = [
                {{ name: "Plancke", url: `https://plancke.io/hypixel/player/stats/${{username}}` }},
                {{ name: "EliteBot", url: `https://elitebot.dev/@${{username}}/${{profile}}` }},
                {{ name: "Coflnet", url: `https://sky.coflnet.com/player/${{username}}` }}
            ];

            // Define themes
            const themes = [
                {{ name: "Default Theme", file: "default.json" }},
                {{ name: "Draconic Purple Theme", file: "draconic.json" }},
                {{ name: "Default Light Theme", file: "light.json" }},
                {{ name: "sky.lea.moe", file: "skylea.json" }},
                {{ name: "Night Blue Theme", file: "nightblue.json" }},
                {{ name: "Sunrise Orange Theme", file: "sunrise.json" }},
                {{ name: "Burning Cinnabar Theme", file: "burning-cinnabar.json" }},
                {{ name: "Candy Cane Theme", file: "candycane.json" }},
                {{ name: "April Fools 2024 Theme", file: "april-fools-2024.json" }}
            ];

            // Add website links
            websites.forEach(site => {{
                const link = document.createElement('a');
                link.textContent = site.name;
                link.href = site.url;
                link.target = '_blank';
                link.style.cssText = 'padding: 10px; color: #FFFFFF; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s;';
                link.onmouseover = () => link.style.backgroundColor = 'rgba(186, 95, 222, 0.1)';
                link.onmouseout = () => link.style.backgroundColor = 'transparent';
                sitesDropdown.appendChild(link);
            }});

            // Add theme options
            const currentTheme = localStorage.getItem('currentTheme') || 'default.json';
            themes.forEach(theme => {{
                const option = document.createElement('div');
                option.textContent = theme.name;
                option.style.cssText = `padding: 10px; color: ${{theme.file === currentTheme ? 'white' : '#FFFFFF'}}; background-color: ${{theme.file === currentTheme ? '#282828' : 'transparent'}}; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s; cursor: pointer;`;
                
                option.onclick = () => {{
                    const themesButton = document.getElementById('themes-button');
                    if (themesButton) {{
                        themesButton.click();
                        
                        setTimeout(() => {{
                            const radio = document.querySelector(`input[value="/resources/themes/${{theme.file}}"]`);
                            
                            if (radio) {{
                                radio.click();
                                localStorage.setItem('currentTheme', theme.file);
                                window.pywebview.api.save_theme(theme.file);

                                // Update selected theme appearance
                                document.querySelectorAll('#themes-dropdown > div').forEach(opt => {{
                                    opt.style.color = opt.textContent === option.textContent ? 'white' : '#FFFFFF';
                                    opt.style.backgroundColor = opt.textContent === option.textContent ? '#FF424D' : 'transparent';
                                }});

                                if (themesButton.getAttribute('aria-expanded') === 'true') {{
                                    themesButton.click();
                                }}
                                
                                themesDropdown.style.display = 'none';
                            }}
                        }}, 300);
                    }}
                }};
                
                themesDropdown.appendChild(option);
            }});

            // Toggle websites dropdown
            sitesBtn.onclick = () => {{
                sitesDropdown.style.display = sitesDropdown.style.display === 'none' || sitesDropdown.style.display === '' ? 'flex' : 'none';
            }};

            // Toggle themes dropdown
            themeBtn.onclick = () => {{
                themesDropdown.style.display = themesDropdown.style.display === 'none' || themesDropdown.style.display === '' ? 'flex' : 'none';
            }};

            // Close dropdowns when clicking outside
            document.addEventListener('click', (e) => {{
                if (!sitesBtn.contains(e.target) && !sitesDropdown.contains(e.target)) {{
                    sitesDropdown.style.display = 'none';
                }}
                if (!themeBtn.contains(e.target) && !themesDropdown.contains(e.target)) {{
                    themesDropdown.style.display = 'none';
                }}
            }});

            // Add all buttons to container
            buttonContainer.appendChild(refreshBtn);
            buttonContainer.appendChild(sitesBtn);
            buttonContainer.appendChild(themeBtn);
            buttonContainer.appendChild(patreonBtn);

            // Add everything to the page
            document.body.appendChild(buttonContainer);
            document.body.appendChild(sitesDropdown);
            document.body.appendChild(themesDropdown);
        }}

        // Apply theme from config
        function applyTheme() {{
            const hasSetTheme = localStorage.getItem('initialThemeSet');
            
            if (!hasSetTheme) {{
                const themeToUse = '{theme}';
                
                const themesBtn = document.getElementById('themes-button'); 
                if (themesBtn) {{ 
                    themesBtn.click(); 
                    
                    setTimeout(() => {{ 
                        const radio = document.querySelector(`input[value="/resources/themes/${{themeToUse}}"]`); 
                        if (radio) {{ 
                            radio.click(); 
                            
                            setTimeout(() => {{
                                if (themesBtn.getAttribute('aria-expanded') === 'true') {{ 
                                    themesBtn.click(); 
                                }} 
                                
                                localStorage.setItem('currentTheme', themeToUse);
                                localStorage.setItem('initialThemeSet', 'true');
                            }}, 300);
                        }}
                    }}, 500); 
                }}
            }}
        }}

        // Change site name
        function changeSiteName() {{
            try {{
                const nameEl = document.querySelector('#site_name');
                if (nameEl) {{
                    nameEl.textContent = 'SkyCrypt+';
                }}
            }} catch (error) {{
                console.error('Error changing site name:', error);
            }}
        }}
        
        // Update button function
        function addUpdateButton(updateInfo) {{
            try {{
                const buttonContainer = document.getElementById('custom-buttons-container');
                
                if (!buttonContainer || document.getElementById('update-available-button')) {{
                    return;
                }}
                
                const updateBtn = document.createElement('button');
                updateBtn.id = 'update-available-button';
                updateBtn.textContent = `Update Available: v${{updateInfo.latestVersion}}`;
                updateBtn.style.cssText = 'padding: 10px; background-color: #FF424D; color: white; border: none; border-radius: 5px; cursor: pointer; outline: none;';
                
                updateBtn.onmouseout = () => updateBtn.style.backgroundColor = '#FF424D';
                updateBtn.onclick = () => window.open(updateInfo.releaseUrl, '_blank');
                
                buttonContainer.insertBefore(updateBtn, buttonContainer.firstChild);
            }} catch (error) {{
                console.error('Error adding update button:', error);
            }}
        }}
        
        // Listen for update events
        document.addEventListener('skycryptPlusUpdateAvailable', (event) => {{
            addUpdateButton(event.detail);
        }});
        
        if (window.updateInfo) {{
            addUpdateButton(window.updateInfo);
        }}

        // Run all the functions when page loads
        function runAll() {{
            console.log('Running all SkyCrypt+ modifications');
            removeHeaderElements();
            addNetworth();
            addCustomButtons();
            removeBanners();
            handleThemes();
            applyTheme();
            changeSiteName();
        }}

        // Run when page is ready
        if (document.readyState === 'loading') {{
            document.addEventListener('DOMContentLoaded', runAll);
        }} else {{
            runAll();
        }}
    }})();
    """
    return js_code  # Add this return statement