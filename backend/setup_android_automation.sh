#!/bin/bash
set -e

echo "Setting up Android Automation for Free Fire..."

# Install Android SDK command line tools
cd /tmp
wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip -q commandlinetools-linux-9477386_latest.zip
mkdir -p /opt/android-sdk/cmdline-tools/latest
mv cmdline-tools/* /opt/android-sdk/cmdline-tools/latest/

export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Accept licenses
yes | sdkmanager --licenses 2>/dev/null || true

# Install platform tools
sdkmanager "platform-tools" "platforms;android-33"

echo "✓ Android SDK installed"
echo "ANDROID_HOME=$ANDROID_HOME"
