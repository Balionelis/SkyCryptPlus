# Why Antivirus Software May Flag SkyCrypt+

## What's Happening?

When you download and run SkyCrypt+, your antivirus software might flag it as suspicious or potentially harmful. **This is a false positive** - the application is not malicious.

## Why Does This Happen?

### Electron Apps Trigger Common Security Flags

SkyCrypt+ is built using Electron, which packages web technologies into desktop applications. This technology legitimately does things that security software finds suspicious:

1. **Dynamic Code Execution**
   - SkyCrypt+ injects custom JavaScript into websites to enhance functionality
   - This behavior pattern resembles techniques used by malicious software

2. **Limited Reputation**
   - Being a smaller application means fewer users have run it
   - Antivirus software is cautious about executables that aren't widely used

3. **No Code Signing Certificate**
   - Commercial software is typically signed with certificates that verify its origin
   - SkyCrypt+ doesn't have an expensive code signing certificate

4. **Web Content Modification**
   - The app modifies web content to add features and remove ads
   - This pattern matches how malicious browser extensions operate

## Is SkyCrypt+ Safe?

**Yes**. The application:
- Is open source - you can inspect all the code
- Only modifies the SkyCrypt website display to enhance functionality
- Doesn't collect any personal data
- Only communicates with the SkyCrypt website and the GitHub API (to check for updates)

## What Can You Do?

1. **Add an Exception** to your antivirus software for SkyCrypt+
2. **Verify the Source** by downloading only from our official GitHub repository
3. **Check Reviews** from other users
4. **Install from Source** if you're technically inclined

If you're concerned, you can always run SkyCrypt in your browser instead of using this desktop application.

## Technical Details

Specifically, heuristic detection flags SkyCrypt+ because:
- It creates a BrowserWindow that loads a remote website
- It injects custom JavaScript that modifies DOM elements
- It makes web requests to check for updates
- It reads and writes local configuration files

These behaviors are legitimate for Electron applications but resemble techniques used by adware and browser hijackers.