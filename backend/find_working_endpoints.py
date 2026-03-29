import requests
import json

# Try every possible Free Fire endpoint
endpoints = [
    "https://ff.garena.com",
    "https://ff.garena.com/api",
    "https://id.ff.garena.com",
    "https://sea.ff.garena.com",
    "https://sso.garena.com/api",
    "https://account.garena.com/api",
    "https://api.ff.garena.com",
    "https://firebaseapi.garena.com",
    "https://gop.garena.com/api"
]

print("Testing Free Fire API endpoints...\n")

for endpoint in endpoints:
    try:
        response = requests.get(endpoint, timeout=5, headers={
            "User-Agent": "Mozilla/5.0 (Linux; Android 11) FreeFire/1.104.1"
        })
        print(f"✅ {endpoint}")
        print(f"   Status: {response.status_code}")
        if response.text[:200]:
            print(f"   Response: {response.text[:200]}...")
        print()
    except Exception as e:
        print(f"❌ {endpoint}: {str(e)[:50]}")

print("\nTrying POST endpoints for account creation...")

# Try account creation
creation_endpoints = [
    ("https://sso.garena.com/api/guest/create", {"region": "IN"}),
    ("https://account.garena.com/api/create_guest", {"region": "IN", "device": "android"}),
]

for url, payload in creation_endpoints:
    try:
        response = requests.post(url, json=payload, timeout=5, headers={
            "User-Agent": "FreeFire/1.104.1",
            "Content-Type": "application/json"
        })
        print(f"✅ {url}")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:300]}")
    except Exception as e:
        print(f"❌ {url}: {str(e)[:50]}")
