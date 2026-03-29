import asyncio
import requests
import json

BACKEND_URL = "http://localhost:8001"

async def add_bots():
    # First login as admin
    login_response = requests.post(f"{BACKEND_URL}/api/auth/login", json={
        "email": "sandeepdatta866@gmail.com",
        "password": "12SRIMOYEE34"
    })
    
    if login_response.status_code != 200:
        # Register admin if doesn't exist
        register_response = requests.post(f"{BACKEND_URL}/api/auth/register", json={
            "name": "Sandeep Datta",
            "email": "sandeepdatta866@gmail.com",
            "password": "12SRIMOYEE34"
        })
        token = register_response.json()["access_token"]
    else:
        token = login_response.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("="*60)
    print("ADDING BOT CREDENTIALS")
    print("="*60)
    
    # Add bot 1
    print("\n1. Adding bot: s17101113@gmail.com...")
    bot1_response = requests.post(
        f"{BACKEND_URL}/api/admin/bots/add",
        json={
            "email": "s17101113@gmail.com",
            "password": "12SUZUNE34",
            "region": "IN"
        },
        headers=headers
    )
    
    print(f"   Status: {bot1_response.status_code}")
    if bot1_response.status_code == 200:
        result1 = bot1_response.json()
        print(f"   ✅ Bot 1 added successfully!")
        print(f"   Bot ID: {result1['bot_id']}")
        print(f"   UID: {result1['uid']}")
        bot1_id = result1['bot_id']
    else:
        print(f"   ❌ Failed: {bot1_response.text}")
        bot1_id = None
    
    # Add bot 2 (which is also admin account)
    print("\n2. Adding bot: SANDEEPDATTA866@GMAIL.COM...")
    bot2_response = requests.post(
        f"{BACKEND_URL}/api/admin/bots/add",
        json={
            "email": "SANDEEPDATTA866@GMAIL.COM",
            "password": "12SRIMOYEE34",
            "region": "IN"
        },
        headers=headers
    )
    
    print(f"   Status: {bot2_response.status_code}")
    if bot2_response.status_code == 200:
        result2 = bot2_response.json()
        print(f"   ✅ Bot 2 added successfully!")
        print(f"   Bot ID: {result2['bot_id']}")
        print(f"   UID: {result2['uid']}")
        bot2_id = result2['bot_id']
    else:
        print(f"   ❌ Failed: {bot2_response.text}")
        bot2_id = None
    
    # Get all bots
    print("\n" + "="*60)
    print("ALL BOT CREDENTIALS")
    print("="*60)
    
    bots_response = requests.get(f"{BACKEND_URL}/api/admin/bots", headers=headers)
    if bots_response.status_code == 200:
        bots = bots_response.json()
        print(f"\nTotal Bots: {len(bots)}")
        for i, bot in enumerate(bots, 1):
            print(f"\nBot {i}:")
            print(f"  Email: {bot['email']}")
            print(f"  UID: {bot.get('uid', 'N/A')}")
            print(f"  Region: {bot['region']}")
            print(f"  Status: {bot['status']}")
            print(f"  Current Guild: {bot.get('current_guild', 'None')}")
    
    # Test joining guild with bot 1
    if bot1_id:
        print("\n" + "="*60)
        print("TESTING GUILD JOIN WITH BOT 1")
        print("="*60)
        
        join_response = requests.post(
            f"{BACKEND_URL}/api/admin/bots/{bot1_id}/join-guild?guild_uid=3048504325",
            headers=headers
        )
        
        if join_response.status_code == 200:
            result = join_response.json()
            print(f"\n✅ {result['message']}")
        else:
            print(f"\n❌ Failed: {join_response.text}")
    
    print("\n" + "="*60)
    print("COMPLETE!")
    print("="*60)

asyncio.run(add_bots())
