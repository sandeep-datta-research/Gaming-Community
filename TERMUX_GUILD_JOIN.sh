#!/bin/bash
# 
# TERMUX SCRIPT FOR YOUR ANDROID PHONE
# ====================================
# 
# Copy this entire script and run it on your Android device in Termux
# It will use your 2 accounts to join Guild 3048504325
#

echo "========================================"
echo "FF GLORY BOT - TERMUX AUTOMATION"
echo "========================================"
echo ""
echo "Guild UID: 3048504325"
echo "Accounts: 2"
echo ""

# Install dependencies
pkg update -y
pkg install python git wget -y
pip install uiautomator2 requests

# Download Free Fire automation library
git clone https://github.com/openatx/uiautomator2
cd uiautomator2
python -m uiautomator2 init

# Create FF automation script
cat > /sdcard/ff_guild_join.py << 'PYTHON_SCRIPT'
import uiautomator2 as u2
import time

# Connect to device
d = u2.connect()

accounts = [
    {"email": "s17101113@gmail.com", "password": "12SUZUNE34"},
    {"email": "SANDEEPDATTA866@GMAIL.COM", "password": "12SRIMOYEE34"}
]

guild_uid = "3048504325"

print("Starting Free Fire automation...")

for i, account in enumerate(accounts, 1):
    print(f"\n{'='*50}")
    print(f"Bot {i}: {account['email']}")
    print('='*50)
    
    # Launch Free Fire
    print("1. Launching Free Fire...")
    d.app_start("com.dts.freefireth")
    time.sleep(10)
    
    # Handle login screen
    print("2. Looking for login...")
    if d(text="LOGIN").exists(timeout=5):
        d(text="LOGIN").click()
        time.sleep(2)
        
        # Facebook/Email login
        if d(text="Email").exists(timeout=3):
            d(text="Email").click()
            time.sleep(1)
            
            # Enter email
            d(className="android.widget.EditText").click()
            d.send_keys(account["email"], clear=True)
            
            # Enter password
            d(className="android.widget.EditText")[1].click()
            d.send_keys(account["password"], clear=True)
            
            # Click login button
            d(text="LOG IN").click()
            time.sleep(5)
    
    print("3. Waiting for lobby...")
    time.sleep(10)
    
    # Navigate to Guild
    print("4. Opening Guild menu...")
    if d(text="GUILD").exists(timeout=5):
        d(text="GUILD").click()
        time.sleep(3)
    
    # Search for guild
    print(f"5. Searching for guild {guild_uid}...")
    if d(resourceId="search").exists(timeout=3):
        d(resourceId="search").click()
        time.sleep(1)
        d.send_keys(guild_uid, clear=True)
        d.press("enter")
        time.sleep(2)
    
    # Join guild
    print("6. Sending join request...")
    if d(text="JOIN").exists(timeout=3):
        d(text="JOIN").click()
        time.sleep(2)
        
        if d(text="CONFIRM").exists(timeout=2):
            d(text="CONFIRM").click()
        
        print(f"✅ Join request sent for {account['email']}")
    else:
        print(f"⚠️  May already be in a guild or request pending")
    
    # Logout
    print("7. Logging out...")
    d.app_stop("com.dts.freefireth")
    time.sleep(3)

print("\n" + "="*50)
print("AUTOMATION COMPLETE!")
print("="*50)
print(f"\n✅ Guild join requests sent to {guild_uid}")
print("✅ Check your guild for pending requests")
print("\nNote: The exact UI elements may vary with FF updates.")
print("If this doesn't work, you may need to adjust the script.")
PYTHON_SCRIPT

# Run the script
python /sdcard/ff_guild_join.py

echo ""
echo "Script execution complete!"
echo ""
echo "If join requests were successful, accept them in your guild."
echo "Then the platform will track their glory farming."
