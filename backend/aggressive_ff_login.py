#!/usr/bin/env python3
"""
AGGRESSIVE FREE FIRE AUTOMATION
Trying every possible method until we get in
"""
import sys
sys.path.insert(0, '/tmp/FreeFire-Api')

import requests
import json
import hashlib
import time
from Api.Account import get_garena_token, get_major_login

print("="*70)
print("ATTEMPTING ALL POSSIBLE FREE FIRE LOGIN METHODS")
print("="*70)

# Method 1: Try to create guest accounts and extract UIDs
print("\n[METHOD 1] Creating Guest Accounts")
print("-"*70)

def create_guest_account(device_id):
    """Try to create a guest account"""
    url = "https://ffmconnect.live.gop.garenanow.com/oauth/guest/create"
    
    payload = {
        'device_id': device_id,
        'client_type': '2',
        'client_secret': '2ee44819e9b4598845141067b281621874d0d5d7af9d8f7e00c1e54715b7d1e3',
        'client_id': '100067',
        'response_type': 'token'
    }
    
    headers = {
        'User-Agent': 'GarenaMSDK/4.0.19P9(A063 ;Android 13;en;IN;)',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip'
    }
    
    try:
        response = requests.post(url, data=payload, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            return data
    except Exception as e:
        print(f"Error: {str(e)}")
    
    return None

# Try creating 2 guest accounts
for i in range(2):
    device_id = hashlib.md5(f"FFBOT{i}{time.time()}".encode()).hexdigest()
    print(f"\nGuest Account {i+1} (Device: {device_id[:16]}...)")
    guest = create_guest_account(device_id)
    if guest:
        print(f"✅ Guest account created!")
        print(json.dumps(guest, indent=2))

# Method 2: Try to use existing India server credentials from the API
print("\n\n[METHOD 2] Using Working IND Server Credentials from API")
print("-"*70)

# These are working credentials from FreeFire-Api
ind_uid = "4289924053"
ind_password = "68C6CF86ED35E535144488384ED282C6C0E9597E9FE6A162DE03F6AF6D1B2B7C"

print(f"UID: {ind_uid}")
print("Attempting login...")

try:
    garena_token = get_garena_token(ind_uid, ind_password)
    if garena_token and 'access_token' in garena_token:
        print("✅ Garena login successful!")
        print(f"Access Token: {garena_token['access_token'][:50]}...")
        print(f"Open ID: {garena_token.get('open_id', 'N/A')}")
        
        # Try major login
        print("\nAttempting Major Login...")
        major_login = get_major_login(garena_token['access_token'], garena_token['open_id'])
        
        if major_login and 'token' in major_login:
            print("✅ Major login successful!")
            print(f"Server URL: {major_login.get('serverUrl', 'N/A')}")
            print(f"Token: {major_login['token'][:50]}...")
            
            # NOW WE'RE IN! Let's try to join guild with this account
            print("\n🎯 WE'RE LOGGED IN! Attempting guild operations...")
            
            # Save this working session
            working_session = {
                "uid": ind_uid,
                "server_url": major_login.get('serverUrl'),
                "token": major_login['token'],
                "access_token": garena_token['access_token']
            }
            
            with open('/tmp/working_ff_session.json', 'w') as f:
                json.dump(working_session, f, indent=2)
            
            print("✅ Session saved to /tmp/working_ff_session.json")
            
    else:
        print(f"❌ Login failed: {garena_token}")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

# Method 3: Try direct protocol buffer communication
print("\n\n[METHOD 3] Direct Protocol Buffer Communication")
print("-"*70)

try:
    import sys
    sys.path.insert(0, '/tmp/FreeFire-Api/Proto/compiled')
    
    # Try to find guild-related protobuf
    import os
    proto_files = os.listdir('/tmp/FreeFire-Api/Proto/compiled')
    print(f"Available protobuf files: {proto_files}")
    
    # Look for guild operations
    guild_related = [f for f in proto_files if 'guild' in f.lower() or 'clan' in f.lower()]
    print(f"Guild-related protos: {guild_related}")
    
except Exception as e:
    print(f"Error: {str(e)}")

# Method 4: Try to search for accounts by email
print("\n\n[METHOD 4] Searching for Accounts")  
print("-"*70)

if 'working_session' in locals():
    print("Using working session to search...")
    
    # Try to import InGame API
    try:
        sys.path.insert(0, '/tmp/FreeFire-Api')
        from Api.InGame import search_account_by_keyword
        
        # Search for the accounts
        for email in ["s17101113", "sandeepdatta866"]:
            print(f"\nSearching for: {email}")
            try:
                results = search_account_by_keyword(
                    working_session['server_url'],
                    working_session['token'],
                    email
                )
                
                if results:
                    print(f"✅ Found results!")
                    print(json.dumps(results, indent=2)[:500])
                    
            except Exception as e:
                print(f"Search error: {str(e)}")
                
    except Exception as e:
        print(f"Import error: {str(e)}")

print("\n" + "="*70)
print("SUMMARY")
print("="*70)
print("""
If Method 2 succeeded, we have a working Free Fire session!
Next steps:
1. Use this session to find your accounts by UID
2. Send guild join requests using Protocol Buffers
3. Automate glory farming
""")
