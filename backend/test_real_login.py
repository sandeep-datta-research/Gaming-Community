#!/usr/bin/env python3
"""
REAL Free Fire Bot - Using 0xMe API with YOUR credentials
"""
import sys
sys.path.insert(0, '/tmp/FreeFire-Api')

from Api.Account import get_garena_token, get_major_login
import json

# Your actual credentials
accounts = {
    "account1": {
        "email": "s17101113@gmail.com",
        "password": "12SUZUNE34"
    },
    "account2": {
        "email": "SANDEEPDATTA866@GMAIL.COM",
        "password": "12SRIMOYEE34"
    }
}

print("="*60)
print("TESTING REAL FREE FIRE LOGIN WITH YOUR CREDENTIALS")
print("="*60)

for name, account in accounts.items():
    print(f"\n{name}: {account['email']}")
    print("-"*60)
    
    # Try to login with Garena
    print("1. Authenticating with Garena...")
    
    # Note: The API expects UID and encrypted password
    # We need to convert email login to UID login
    # For email-based accounts, we need to use Facebook/Google auth
    
    print("   ⚠️  This API requires UID + encrypted password")
    print("   ⚠️  Email/password login needs different endpoint")
    print("   Attempting Facebook/Email auth...")
    
    # Try email auth endpoint
    import requests
    
    try:
        # Garena email login endpoint
        url = "https://sso.garena.com/api/login"
        
        payload = {
            'account': account['email'],
            'password': account['password'],
            'format': 'json',
            'id': '100067'
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 11) FreeFire/1.104.1',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        response = requests.post(url, data=payload, headers=headers, timeout=10)
        print(f"   Response: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Login successful!")
            print(json.dumps(result, indent=2)[:500])
        else:
            print(f"   Response: {response.text[:300]}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

print("\n" + "="*60)
print("ANALYSIS")
print("="*60)
print("""
The Free Fire API requires:
1. UID (not email) - numerical user ID
2. Encrypted password hash (not plain password)

Your accounts use email/password which requires:
- Facebook OAuth flow, OR
- Get UID from email first, OR
- Use actual Free Fire app to extract credentials

NEXT STEP: Extract UID from your FF accounts
""")
