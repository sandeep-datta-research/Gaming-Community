#!/usr/bin/env python3
"""
FF Glory Bot Backend API Test Suite
Tests all authentication, bot session, transaction, and admin endpoints
"""

import requests
import json
import time
from datetime import datetime
import uuid

# Backend URL from frontend environment
BASE_URL = "https://service-233.preview.emergentagent.com/api"

class FFGloryBotTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_session_id = None
        self.test_transaction_id = None
        self.results = {
            "auth": [],
            "sessions": [],
            "transactions": [],
            "admin": [],
            "errors": []
        }
    
    def log_result(self, category, test_name, success, details="", response_data=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response"] = response_data
        
        self.results[category].append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None, token=None):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        # Set up headers
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)
        if token:
            req_headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=req_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=req_headers, timeout=30)
            elif method.upper() == "PATCH":
                response = requests.patch(url, json=data, headers=req_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request error for {method} {endpoint}: {str(e)}")
            return None
    
    def test_health_check(self):
        """Test API health check"""
        print("\n=== HEALTH CHECK ===")
        response = self.make_request("GET", "/")
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("auth", "Health Check", True, 
                          f"API is running: {data.get('message', 'Unknown')}")
        else:
            self.log_result("auth", "Health Check", False, 
                          f"API not responding. Status: {response.status_code if response else 'No response'}")
    
    def test_user_registration(self):
        """Test user registration"""
        print("\n=== AUTHENTICATION TESTS ===")
        
        # Generate unique test user
        timestamp = int(time.time())
        test_data = {
            "name": "Test User",
            "email": f"test{timestamp}@example.com",
            "password": "test123"
        }
        
        response = self.make_request("POST", "/auth/register", test_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.user_token = data.get("access_token")
            self.test_user_id = data.get("user", {}).get("id")
            
            # Verify response structure
            if all(key in data for key in ["user", "access_token", "token_type"]):
                user = data["user"]
                if all(key in user for key in ["id", "name", "email", "role", "credits"]):
                    self.log_result("auth", "User Registration", True, 
                                  f"User created with ID: {self.test_user_id}")
                else:
                    self.log_result("auth", "User Registration", False, 
                                  "Missing user fields in response")
            else:
                self.log_result("auth", "User Registration", False, 
                              "Missing required fields in response")
        else:
            error_msg = "Unknown error"
            if response:
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", f"Status {response.status_code}")
                except:
                    error_msg = f"Status {response.status_code}"
            
            self.log_result("auth", "User Registration", False, error_msg)
    
    def test_user_login(self):
        """Test user login with created user"""
        if not self.test_user_id:
            self.log_result("auth", "User Login", False, "No test user created")
            return
        
        # Extract email from previous registration
        test_email = None
        for result in self.results["auth"]:
            if result["test"] == "User Registration" and result["success"]:
                # Get email from the registration test
                timestamp = int(time.time())
                test_email = f"test{timestamp}@example.com"
                break
        
        if not test_email:
            # Fallback - create new user for login test
            timestamp = int(time.time())
            test_email = f"testlogin{timestamp}@example.com"
            reg_data = {
                "name": "Login Test User",
                "email": test_email,
                "password": "test123"
            }
            reg_response = self.make_request("POST", "/auth/register", reg_data)
            if reg_response and reg_response.status_code == 200:
                reg_data_resp = reg_response.json()
                self.test_user_id = reg_data_resp.get("user", {}).get("id")
        
        login_data = {
            "email": test_email,
            "password": "test123"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.user_token = data.get("access_token")
            
            if "access_token" in data and "user" in data:
                self.log_result("auth", "User Login", True, 
                              f"Login successful, token received")
            else:
                self.log_result("auth", "User Login", False, 
                              "Missing token or user in response")
        else:
            error_msg = "Login failed"
            if response:
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", f"Status {response.status_code}")
                except:
                    error_msg = f"Status {response.status_code}"
            
            self.log_result("auth", "User Login", False, error_msg)
    
    def test_get_current_user(self):
        """Test get current user endpoint"""
        if not self.user_token:
            self.log_result("auth", "Get Current User", False, "No user token available")
            return
        
        response = self.make_request("GET", "/auth/me", token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ["id", "name", "email", "role", "credits"]
            
            if all(field in data for field in required_fields):
                self.log_result("auth", "Get Current User", True, 
                              f"User info retrieved: {data['email']}")
            else:
                self.log_result("auth", "Get Current User", False, 
                              "Missing required fields in user info")
        else:
            self.log_result("auth", "Get Current User", False, 
                          f"Failed to get user info. Status: {response.status_code if response else 'No response'}")
    
    def test_admin_login(self):
        """Test admin user login"""
        admin_data = {
            "email": "sandeepdatta866@gmail.com",
            "password": "admin123"
        }
        
        # First try to register admin if not exists
        reg_response = self.make_request("POST", "/auth/register", {
            "name": "Admin User",
            "email": "sandeepdatta866@gmail.com",
            "password": "admin123"
        })
        
        # Now try to login
        response = self.make_request("POST", "/auth/login", admin_data)
        
        if response and response.status_code == 200:
            data = response.json()
            user = data.get("user", {})
            
            if user.get("role") == "admin":
                self.admin_token = data.get("access_token")
                self.log_result("auth", "Admin Login", True, 
                              f"Admin login successful, role: {user.get('role')}")
            else:
                self.log_result("auth", "Admin Login", False, 
                              f"User role is {user.get('role')}, expected admin")
        else:
            # Try with different password
            admin_data["password"] = "test123"
            response = self.make_request("POST", "/auth/login", admin_data)
            
            if response and response.status_code == 200:
                data = response.json()
                user = data.get("user", {})
                
                if user.get("role") == "admin":
                    self.admin_token = data.get("access_token")
                    self.log_result("auth", "Admin Login", True, 
                                  f"Admin login successful with alternate password")
                else:
                    self.log_result("auth", "Admin Login", False, 
                                  f"User exists but role is {user.get('role')}")
            else:
                self.log_result("auth", "Admin Login", False, 
                              "Admin login failed with both passwords")
    
    def test_start_bot_session(self):
        """Test starting a bot session"""
        print("\n=== BOT SESSION TESTS ===")
        
        if not self.user_token:
            self.log_result("sessions", "Start Bot Session", False, "No user token available")
            return
        
        # First, grant some credits to the test user for session testing
        if self.admin_token and self.test_user_id:
            credit_data = {
                "userId": self.test_user_id,
                "credits": 5,
                "reason": "Test credits for session testing"
            }
            self.make_request("POST", "/admin/credits/grant", credit_data, token=self.admin_token)
        
        session_data = {
            "clanId": "CLAN123",
            "region": "ME",
            "botCount": 4
        }
        
        response = self.make_request("POST", "/sessions/start", session_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.test_session_id = data.get("sessionId")
            
            required_fields = ["sessionId", "status", "botCount", "gloryPerHour"]
            if all(field in data for field in required_fields):
                self.log_result("sessions", "Start Bot Session", True, 
                              f"Session started: {self.test_session_id}")
            else:
                self.log_result("sessions", "Start Bot Session", False, 
                              "Missing required fields in session response")
        else:
            error_msg = "Session start failed"
            if response:
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", f"Status {response.status_code}")
                except:
                    error_msg = f"Status {response.status_code}"
            
            self.log_result("sessions", "Start Bot Session", False, error_msg)
    
    def test_get_user_sessions(self):
        """Test getting user sessions"""
        if not self.user_token:
            self.log_result("sessions", "Get User Sessions", False, "No user token available")
            return
        
        response = self.make_request("GET", "/sessions", token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                self.log_result("sessions", "Get User Sessions", True, 
                              f"Retrieved {len(data)} sessions")
            else:
                self.log_result("sessions", "Get User Sessions", False, 
                              "Response is not a list")
        else:
            self.log_result("sessions", "Get User Sessions", False, 
                          f"Failed to get sessions. Status: {response.status_code if response else 'No response'}")
    
    def test_create_purchase_transaction(self):
        """Test creating a purchase transaction"""
        print("\n=== TRANSACTION TESTS ===")
        
        if not self.user_token:
            self.log_result("transactions", "Create Purchase Transaction", False, "No user token available")
            return
        
        transaction_data = {
            "planId": "plan-1",
            "transactionId": "UPI123456",
            "upiId": "9366183700@fam"
        }
        
        response = self.make_request("POST", "/transactions/purchase", transaction_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.test_transaction_id = data.get("id")
            
            required_fields = ["id", "userId", "type", "status", "credits"]
            if all(field in data for field in required_fields):
                if data.get("status") == "pending":
                    self.log_result("transactions", "Create Purchase Transaction", True, 
                                  f"Transaction created: {self.test_transaction_id}")
                else:
                    self.log_result("transactions", "Create Purchase Transaction", False, 
                                  f"Transaction status is {data.get('status')}, expected pending")
            else:
                self.log_result("transactions", "Create Purchase Transaction", False, 
                              "Missing required fields in transaction response")
        else:
            error_msg = "Transaction creation failed"
            if response:
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", f"Status {response.status_code}")
                except:
                    error_msg = f"Status {response.status_code}"
            
            self.log_result("transactions", "Create Purchase Transaction", False, error_msg)
    
    def test_get_user_transactions(self):
        """Test getting user transactions"""
        if not self.user_token:
            self.log_result("transactions", "Get User Transactions", False, "No user token available")
            return
        
        response = self.make_request("GET", "/transactions", token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                self.log_result("transactions", "Get User Transactions", True, 
                              f"Retrieved {len(data)} transactions")
            else:
                self.log_result("transactions", "Get User Transactions", False, 
                              "Response is not a list")
        else:
            self.log_result("transactions", "Get User Transactions", False, 
                          f"Failed to get transactions. Status: {response.status_code if response else 'No response'}")
    
    def test_admin_get_users(self):
        """Test admin get all users"""
        print("\n=== ADMIN TESTS ===")
        
        if not self.admin_token:
            self.log_result("admin", "Get All Users", False, "No admin token available")
            return
        
        response = self.make_request("GET", "/admin/users", token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                self.log_result("admin", "Get All Users", True, 
                              f"Retrieved {len(data)} users")
            else:
                self.log_result("admin", "Get All Users", False, 
                              "Response is not a list")
        else:
            self.log_result("admin", "Get All Users", False, 
                          f"Failed to get users. Status: {response.status_code if response else 'No response'}")
    
    def test_admin_get_sessions(self):
        """Test admin get all sessions"""
        if not self.admin_token:
            self.log_result("admin", "Get All Sessions", False, "No admin token available")
            return
        
        response = self.make_request("GET", "/admin/sessions", token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                self.log_result("admin", "Get All Sessions", True, 
                              f"Retrieved {len(data)} sessions")
            else:
                self.log_result("admin", "Get All Sessions", False, 
                              "Response is not a list")
        else:
            self.log_result("admin", "Get All Sessions", False, 
                          f"Failed to get sessions. Status: {response.status_code if response else 'No response'}")
    
    def test_admin_get_transactions(self):
        """Test admin get all transactions"""
        if not self.admin_token:
            self.log_result("admin", "Get All Transactions", False, "No admin token available")
            return
        
        response = self.make_request("GET", "/admin/transactions", token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                self.log_result("admin", "Get All Transactions", True, 
                              f"Retrieved {len(data)} transactions")
            else:
                self.log_result("admin", "Get All Transactions", False, 
                              "Response is not a list")
        else:
            self.log_result("admin", "Get All Transactions", False, 
                          f"Failed to get transactions. Status: {response.status_code if response else 'No response'}")
    
    def test_admin_get_stats(self):
        """Test admin get platform stats"""
        if not self.admin_token:
            self.log_result("admin", "Get Platform Stats", False, "No admin token available")
            return
        
        response = self.make_request("GET", "/admin/stats", token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            
            required_fields = ["totalUsers", "totalRevenue", "activeSessions", "totalGlory"]
            if all(field in data for field in required_fields):
                self.log_result("admin", "Get Platform Stats", True, 
                              f"Stats retrieved: {data['totalUsers']} users, {data['activeSessions']} active sessions")
            else:
                self.log_result("admin", "Get Platform Stats", False, 
                              "Missing required fields in stats response")
        else:
            self.log_result("admin", "Get Platform Stats", False, 
                          f"Failed to get stats. Status: {response.status_code if response else 'No response'}")
    
    def test_admin_grant_credits(self):
        """Test admin grant credits"""
        if not self.admin_token or not self.test_user_id:
            self.log_result("admin", "Grant Credits", False, "No admin token or test user available")
            return
        
        credit_data = {
            "userId": self.test_user_id,
            "credits": 5,
            "reason": "Test credit grant"
        }
        
        response = self.make_request("POST", "/admin/credits/grant", credit_data, token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            
            if data.get("success") and "credits" in data.get("message", ""):
                self.log_result("admin", "Grant Credits", True, 
                              f"Credits granted: {data.get('message')}")
            else:
                self.log_result("admin", "Grant Credits", False, 
                              "Unexpected response format")
        else:
            error_msg = "Credit grant failed"
            if response:
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", f"Status {response.status_code}")
                except:
                    error_msg = f"Status {response.status_code}"
            
            self.log_result("admin", "Grant Credits", False, error_msg)
    
    def test_admin_verify_payment(self):
        """Test admin verify payment"""
        if not self.admin_token or not self.test_transaction_id:
            self.log_result("admin", "Verify Payment", False, "No admin token or test transaction available")
            return
        
        verification_data = {
            "transactionId": self.test_transaction_id,
            "status": "approve"
        }
        
        response = self.make_request("POST", "/admin/payments/verify", verification_data, token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            
            if data.get("success") and "approved" in data.get("message", "").lower():
                self.log_result("admin", "Verify Payment", True, 
                              f"Payment verified: {data.get('message')}")
            else:
                self.log_result("admin", "Verify Payment", False, 
                              "Unexpected response format")
        else:
            error_msg = "Payment verification failed"
            if response:
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", f"Status {response.status_code}")
                except:
                    error_msg = f"Status {response.status_code}"
            
            self.log_result("admin", "Verify Payment", False, error_msg)
    
    def test_error_handling(self):
        """Test error handling scenarios"""
        print("\n=== ERROR HANDLING TESTS ===")
        
        # Test invalid credentials
        invalid_login = {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
        
        response = self.make_request("POST", "/auth/login", invalid_login)
        
        if response and response.status_code == 401:
            self.log_result("errors", "Invalid Credentials", True, 
                          "Correctly rejected invalid credentials")
        else:
            self.log_result("errors", "Invalid Credentials", False, 
                          f"Expected 401, got {response.status_code if response else 'No response'}")
        
        # Test insufficient credits (if we have a user token)
        if self.user_token:
            # First, try to start session without credits
            session_data = {
                "clanId": "TESTCLAN",
                "region": "ME",
                "botCount": 8
            }
            
            response = self.make_request("POST", "/sessions/start", session_data, token=self.user_token)
            
            if response and response.status_code == 400:
                try:
                    error_data = response.json()
                    if "insufficient" in error_data.get("detail", "").lower():
                        self.log_result("errors", "Insufficient Credits", True, 
                                      "Correctly rejected session start with insufficient credits")
                    else:
                        self.log_result("errors", "Insufficient Credits", False, 
                                      f"Wrong error message: {error_data.get('detail')}")
                except:
                    self.log_result("errors", "Insufficient Credits", False, 
                                  "Could not parse error response")
            else:
                self.log_result("errors", "Insufficient Credits", False, 
                              f"Expected 400, got {response.status_code if response else 'No response'}")
        
        # Test unauthorized admin access
        if self.user_token:
            response = self.make_request("GET", "/admin/users", token=self.user_token)
            
            if response and response.status_code == 403:
                self.log_result("errors", "Unauthorized Admin Access", True, 
                              "Correctly rejected non-admin user from admin endpoint")
            else:
                self.log_result("errors", "Unauthorized Admin Access", False, 
                              f"Expected 403, got {response.status_code if response else 'No response'}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting FF Glory Bot API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Health check
        self.test_health_check()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        self.test_admin_login()
        
        # Bot session tests
        self.test_start_bot_session()
        self.test_get_user_sessions()
        
        # Transaction tests
        self.test_create_purchase_transaction()
        self.test_get_user_transactions()
        
        # Admin tests
        self.test_admin_get_users()
        self.test_admin_get_sessions()
        self.test_admin_get_transactions()
        self.test_admin_get_stats()
        self.test_admin_grant_credits()
        self.test_admin_verify_payment()
        
        # Error handling tests
        self.test_error_handling()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = 0
        passed_tests = 0
        
        for category, tests in self.results.items():
            if tests:
                print(f"\n{category.upper()}:")
                for test in tests:
                    status = "✅" if test["success"] else "❌"
                    print(f"  {status} {test['test']}")
                    total_tests += 1
                    if test["success"]:
                        passed_tests += 1
        
        print(f"\n📊 OVERALL RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests}")
        print(f"   Failed: {total_tests - passed_tests}")
        print(f"   Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "   Success Rate: 0%")
        
        if total_tests - passed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for category, tests in self.results.items():
                for test in tests:
                    if not test["success"]:
                        print(f"   • {test['test']}: {test['details']}")

if __name__ == "__main__":
    tester = FFGloryBotTester()
    tester.run_all_tests()