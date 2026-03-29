#!/usr/bin/env python3
"""
FF Glory Bot Backend API - Focused Error Handling Tests
"""

import requests
import json
import time

BASE_URL = "https://bot-glory-grind.preview.emergentagent.com/api"

def test_specific_issues():
    print("🔍 Testing specific error handling scenarios...")
    
    # Test 1: Invalid login credentials
    print("\n1. Testing invalid login credentials...")
    invalid_login = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=invalid_login, timeout=10)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ PASS: Correctly rejected invalid credentials")
        else:
            print(f"   ❌ FAIL: Expected 401, got {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
    
    # Test 2: Create a user with no credits and try to start session
    print("\n2. Testing insufficient credits...")
    timestamp = int(time.time())
    test_user = {
        "name": "No Credits User",
        "email": f"nocredits{timestamp}@example.com",
        "password": "test123"
    }
    
    try:
        # Register user
        reg_response = requests.post(f"{BASE_URL}/auth/register", json=test_user, timeout=10)
        if reg_response.status_code == 200:
            user_data = reg_response.json()
            token = user_data.get("access_token")
            
            # Try to start session without credits
            session_data = {
                "clanId": "TESTCLAN",
                "region": "ME",
                "botCount": 4
            }
            
            headers = {"Authorization": f"Bearer {token}"}
            session_response = requests.post(f"{BASE_URL}/sessions/start", json=session_data, headers=headers, timeout=10)
            
            print(f"   Status Code: {session_response.status_code}")
            if session_response.status_code == 400:
                error_data = session_response.json()
                if "insufficient" in error_data.get("detail", "").lower():
                    print("   ✅ PASS: Correctly rejected session start with insufficient credits")
                else:
                    print(f"   ❌ FAIL: Wrong error message: {error_data.get('detail')}")
            else:
                print(f"   ❌ FAIL: Expected 400, got {session_response.status_code}")
                print(f"   Response: {session_response.text}")
        else:
            print(f"   ❌ ERROR: Could not create test user: {reg_response.status_code}")
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
    
    # Test 3: Non-admin user trying to access admin endpoint
    print("\n3. Testing unauthorized admin access...")
    try:
        # Use the user token from test 2
        if 'token' in locals():
            headers = {"Authorization": f"Bearer {token}"}
            admin_response = requests.get(f"{BASE_URL}/admin/users", headers=headers, timeout=10)
            
            print(f"   Status Code: {admin_response.status_code}")
            if admin_response.status_code == 403:
                print("   ✅ PASS: Correctly rejected non-admin user from admin endpoint")
            else:
                print(f"   ❌ FAIL: Expected 403, got {admin_response.status_code}")
                print(f"   Response: {admin_response.text}")
        else:
            print("   ❌ ERROR: No user token available for test")
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
    
    # Test 4: Test user login with correct credentials
    print("\n4. Testing user login with correct credentials...")
    try:
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=10)
        print(f"   Status Code: {login_response.status_code}")
        
        if login_response.status_code == 200:
            data = login_response.json()
            if "access_token" in data and "user" in data:
                print("   ✅ PASS: User login successful with correct credentials")
            else:
                print("   ❌ FAIL: Missing required fields in login response")
        else:
            print(f"   ❌ FAIL: Login failed with status {login_response.status_code}")
            print(f"   Response: {login_response.text}")
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")

if __name__ == "__main__":
    test_specific_issues()