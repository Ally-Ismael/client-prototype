# 🔍 Server Diagnostic Commands

## Check Node.js Installation

Run these commands on your server to diagnose the Node.js issue:

```bash
# Check if Node.js is installed anywhere
which node
whereis node
find /usr -name "node" 2>/dev/null
find /opt -name "node" 2>/dev/null

# Check if nodejs (alternative name) is available
which nodejs
nodejs --version

# Check your PATH
echo $PATH

# Check if Node.js is installed via cPanel
ls -la /opt/cpanel/ea-nodejs*/bin/
ls -la /usr/local/bin/ | grep node
ls -la /usr/bin/ | grep node

# Check cPanel Node.js versions
ls -la /opt/alt/
ls -la /usr/local/cpanel/3rdparty/

# Check if npm is available
which npm
npm --version

# Check your shell environment
env | grep -i node
env | grep -i path

# Check available interpreters
which python
which python3
which php
```

## Possible Solutions

### If Node.js is installed but not in PATH:

```bash
# Try these common locations:
/usr/local/bin/node --version
/opt/cpanel/ea-nodejs16/bin/node --version
/usr/bin/nodejs --version

# If found, create a symlink:
sudo ln -s /path/to/node /usr/local/bin/node
```

### If Node.js needs to be installed:

1. **Check cPanel Node.js Selector first** - it may need to be enabled
2. **Contact your hosting provider** - they may need to install/enable Node.js
3. **Use cPanel's Node.js management** to install a version

## Quick Test Commands

After finding Node.js, test these:

```bash
# Test Node.js works
node --version
npm --version

# Test if your app files are readable
ls -la /home/sedafzgt/nodeapp/
cat /home/sedafzgt/nodeapp/package.json

# Try to run the test server directly
/path/to/node /home/sedafzgt/nodeapp/test-server.js
```