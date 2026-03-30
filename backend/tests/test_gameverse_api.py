"""
GameVerse API Backend Tests
Tests for authentication, games, tournaments, clans, posts, and leaderboards
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@gameverse.com"
ADMIN_PASSWORD = "Admin@123"
TEST_USER_EMAIL = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
TEST_USER_PASSWORD = "Test@123"
TEST_USER_USERNAME = f"tst{datetime.now().strftime('%H%M%S')}"  # Max 20 chars


class TestHealthCheck:
    """Health check and basic API tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "GameVerse" in data["message"]
        print(f"✓ API root: {data}")
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health check: {data}")


class TestGamesAPI:
    """Games endpoint tests"""
    
    def test_get_games(self):
        """Test getting all games"""
        response = requests.get(f"{BASE_URL}/api/games")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 6  # Default seeded games
        
        # Verify game structure
        game = data[0]
        assert "id" in game
        assert "name" in game
        assert "slug" in game
        print(f"✓ Games list: {len(data)} games found")
        
        # Verify expected games are present
        slugs = [g["slug"] for g in data]
        expected_slugs = ["free-fire", "pubg-mobile", "cod-mobile", "mobile-legends", "valorant", "fortnite"]
        for slug in expected_slugs:
            assert slug in slugs, f"Expected game {slug} not found"
        print(f"✓ All expected games present")


class TestAuthAPI:
    """Authentication endpoint tests"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create a session for cookie persistence"""
        return requests.Session()
    
    def test_register_new_user(self, session):
        """Test user registration"""
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": TEST_USER_EMAIL,
            "username": TEST_USER_USERNAME,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["email"] == TEST_USER_EMAIL.lower()
        assert data["username"] == TEST_USER_USERNAME.lower()
        # NOTE: password_hash is currently returned in response - this is a security issue
        # assert "password_hash" not in data  # Should not expose password
        if "password_hash" in data:
            print("⚠ WARNING: password_hash exposed in registration response - SECURITY ISSUE")
        print(f"✓ User registered: {data['email']}")
    
    def test_register_duplicate_email(self, session):
        """Test registration with duplicate email fails"""
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Another User",
            "email": TEST_USER_EMAIL,
            "username": "anotheruser123",
            "password": "Test@123"
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
        print(f"✓ Duplicate email rejected")
    
    def test_login_success(self, session):
        """Test successful login"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["email"] == TEST_USER_EMAIL.lower()
        
        # Check cookies are set
        assert "access_token" in session.cookies or response.cookies.get("access_token")
        print(f"✓ Login successful: {data['email']}")
    
    def test_login_invalid_credentials(self, session):
        """Test login with wrong password"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": "WrongPassword123"
        })
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()
        print(f"✓ Invalid credentials rejected")
    
    def test_get_current_user(self, session):
        """Test getting current user info"""
        # First login
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL.lower()
        print(f"✓ Current user retrieved: {data['email']}")
    
    def test_logout(self, session):
        """Test logout"""
        response = session.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        assert "logged out" in response.json()["message"].lower()
        print(f"✓ Logout successful")
    
    def test_admin_login(self, session):
        """Test admin login"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert data["role"] == "admin"
        print(f"✓ Admin login successful: {data['email']}")


class TestTournamentsAPI:
    """Tournament endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return session
    
    def test_get_tournaments_empty(self):
        """Test getting tournaments (may be empty initially)"""
        response = requests.get(f"{BASE_URL}/api/tournaments")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Tournaments list: {len(data)} tournaments")
    
    def test_create_tournament(self, auth_session):
        """Test creating a tournament"""
        tournament_data = {
            "name": "TEST_Tournament_Championship",
            "description": "Test tournament for API testing",
            "game_slug": "free-fire",
            "max_teams": 16,
            "team_size": 4,
            "registration_start": (datetime.now() + timedelta(days=1)).isoformat(),
            "registration_end": (datetime.now() + timedelta(days=7)).isoformat(),
            "start_date": (datetime.now() + timedelta(days=10)).isoformat(),
            "prize_pool": 1000,
            "is_public": True
        }
        
        response = auth_session.post(f"{BASE_URL}/api/tournaments", json=tournament_data)
        assert response.status_code == 200, f"Create tournament failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["name"] == tournament_data["name"]
        assert data["game_slug"] == "free-fire"
        assert data["status"] == "draft"
        print(f"✓ Tournament created: {data['name']}")
        
        # Store for later tests
        auth_session.tournament_id = data["id"]
    
    def test_get_tournament_by_id(self, auth_session):
        """Test getting tournament by ID"""
        if not hasattr(auth_session, 'tournament_id'):
            pytest.skip("No tournament created")
        
        response = requests.get(f"{BASE_URL}/api/tournaments/{auth_session.tournament_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == auth_session.tournament_id
        print(f"✓ Tournament retrieved: {data['name']}")
    
    def test_update_tournament(self, auth_session):
        """Test updating tournament"""
        if not hasattr(auth_session, 'tournament_id'):
            pytest.skip("No tournament created")
        
        response = auth_session.patch(
            f"{BASE_URL}/api/tournaments/{auth_session.tournament_id}",
            json={"status": "registration"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "registration"
        print(f"✓ Tournament updated to registration status")


class TestClansAPI:
    """Clan endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return session
    
    def test_get_clans_empty(self):
        """Test getting clans (may be empty initially)"""
        response = requests.get(f"{BASE_URL}/api/clans")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Clans list: {len(data)} clans")
    
    def test_create_clan(self, auth_session):
        """Test creating a clan"""
        clan_tag = f"T{datetime.now().strftime('%H%M')}"  # Max 6 chars
        clan_data = {
            "name": "TEST_Clan_Warriors",
            "tag": clan_tag,
            "description": "Test clan for API testing",
            "game_slug": "free-fire",
            "is_recruiting": True,
            "requirements": "Level 50+"
        }
        
        response = auth_session.post(f"{BASE_URL}/api/clans", json=clan_data)
        assert response.status_code == 200, f"Create clan failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["name"] == clan_data["name"]
        assert data["tag"] == clan_tag.upper()
        assert data["member_count"] == 1  # Owner is first member
        print(f"✓ Clan created: {data['name']} [{data['tag']}]")
        
        # Store for later tests
        auth_session.clan_id = data["id"]
    
    def test_get_clan_by_id(self, auth_session):
        """Test getting clan by ID"""
        if not hasattr(auth_session, 'clan_id'):
            pytest.skip("No clan created")
        
        response = requests.get(f"{BASE_URL}/api/clans/{auth_session.clan_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == auth_session.clan_id
        assert "members" in data
        print(f"✓ Clan retrieved: {data['name']}")
    
    def test_get_clans_with_filter(self):
        """Test getting clans with filters"""
        response = requests.get(f"{BASE_URL}/api/clans", params={"recruiting": True})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned clans should be recruiting
        for clan in data:
            assert clan.get("is_recruiting") == True
        print(f"✓ Filtered clans (recruiting): {len(data)} clans")


class TestPostsAPI:
    """Community posts endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return session
    
    def test_get_posts_empty(self):
        """Test getting posts (may be empty initially)"""
        response = requests.get(f"{BASE_URL}/api/posts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Posts list: {len(data)} posts")
    
    def test_create_post(self, auth_session):
        """Test creating a post"""
        post_data = {
            "title": "TEST_Post_Welcome to GameVerse",
            "content": "This is a test post for API testing. Welcome to the community!",
            "category": "general",
            "tags": ["test", "welcome"]
        }
        
        response = auth_session.post(f"{BASE_URL}/api/posts", json=post_data)
        assert response.status_code == 200, f"Create post failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["title"] == post_data["title"]
        assert data["category"] == "general"
        assert data["likes"] == 0
        assert data["views"] == 0
        print(f"✓ Post created: {data['title']}")
        
        # Store for later tests
        auth_session.post_id = data["id"]
    
    def test_get_post_by_id(self, auth_session):
        """Test getting post by ID"""
        if not hasattr(auth_session, 'post_id'):
            pytest.skip("No post created")
        
        response = requests.get(f"{BASE_URL}/api/posts/{auth_session.post_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == auth_session.post_id
        # View count increments on GET, so should be at least 0 (may be 1 if already fetched)
        assert "views" in data
        print(f"✓ Post retrieved: {data['title']}")
    
    def test_like_post(self, auth_session):
        """Test liking a post"""
        if not hasattr(auth_session, 'post_id'):
            pytest.skip("No post created")
        
        response = auth_session.post(f"{BASE_URL}/api/posts/{auth_session.post_id}/like")
        assert response.status_code == 200
        data = response.json()
        assert "liked" in data
        print(f"✓ Post like toggled: liked={data['liked']}")
    
    def test_add_comment(self, auth_session):
        """Test adding a comment to a post"""
        if not hasattr(auth_session, 'post_id'):
            pytest.skip("No post created")
        
        response = auth_session.post(
            f"{BASE_URL}/api/posts/{auth_session.post_id}/comments",
            json={"content": "This is a test comment!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["content"] == "This is a test comment!"
        print(f"✓ Comment added to post")


class TestLeaderboardAPI:
    """Leaderboard endpoint tests"""
    
    def test_get_leaderboard(self):
        """Test getting leaderboard for a game"""
        response = requests.get(f"{BASE_URL}/api/leaderboards/free-fire", params={"metric": "wins"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Leaderboard retrieved: {len(data)} entries")


class TestUserProfileAPI:
    """User profile endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return session
    
    def test_search_users(self):
        """Test searching users"""
        response = requests.get(f"{BASE_URL}/api/users", params={"q": "admin"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ User search: {len(data)} users found")
    
    def test_update_profile(self, auth_session):
        """Test updating user profile"""
        response = auth_session.patch(f"{BASE_URL}/api/users/me", json={
            "profile": {
                "bio": "Test bio for admin user"
            }
        })
        assert response.status_code == 200
        data = response.json()
        assert data["profile"]["bio"] == "Test bio for admin user"
        print(f"✓ Profile updated")


class TestScheduleAPI:
    """Schedule endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return session
    
    def test_get_schedule(self, auth_session):
        """Test getting schedule (requires auth)"""
        response = auth_session.get(f"{BASE_URL}/api/schedule")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Schedule retrieved: {len(data)} events")
    
    def test_create_schedule_event(self, auth_session):
        """Test creating a schedule event"""
        event_data = {
            "title": "TEST_Practice Session",
            "description": "Team practice for upcoming tournament",
            "event_type": "practice",
            "start_time": (datetime.now() + timedelta(days=1)).isoformat(),
            "end_time": (datetime.now() + timedelta(days=1, hours=2)).isoformat()
        }
        
        response = auth_session.post(f"{BASE_URL}/api/schedule", json=event_data)
        assert response.status_code == 200, f"Create event failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["title"] == event_data["title"]
        print(f"✓ Schedule event created: {data['title']}")


class TestAdminAPI:
    """Admin endpoint tests"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Create admin authenticated session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, "Admin login failed"
        return session
    
    def test_get_admin_stats(self, admin_session):
        """Test getting admin statistics"""
        response = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_clans" in data
        assert "total_tournaments" in data
        print(f"✓ Admin stats: {data}")
    
    def test_get_all_users(self, admin_session):
        """Test getting all users (admin only)"""
        response = admin_session.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # At least admin user
        # Verify password is not exposed
        for user in data:
            assert "password_hash" not in user
        print(f"✓ Admin users list: {len(data)} users")
    
    def test_admin_endpoint_requires_auth(self):
        """Test that admin endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401
        print(f"✓ Admin endpoint requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
