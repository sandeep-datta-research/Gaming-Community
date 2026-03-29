"""
Test script to deploy 4 bots to Guild UID 3048504325
This will attempt REAL Free Fire connection
"""
import asyncio
import sys
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

async def test_real_bot_deployment():
    """Test deploying 4 bots to real Free Fire guild"""
    
    try:
        print("\n" + "="*60)
        print("🔴 FREE FIRE BOT DEPLOYMENT TEST")
        print("="*60)
        print(f"Target Guild UID: 3048504325")
        print(f"Number of Bots: 4")
        print(f"Region: Middle East (ME)")
        print("="*60 + "\n")
        
        # Import the real FF bot system
        from real_ff_bot import RealFreeFireGloryFarm
        
        print("✓ Real FF bot module loaded successfully\n")
        
        # Create glory farm instance
        print("Initializing Free Fire Glory Farm...")
        ff_farm = RealFreeFireGloryFarm(
            guild_uid="3048504325",
            region="ME",
            bot_count=4
        )
        
        print("✓ Glory Farm initialized\n")
        
        # Deploy bots
        print("🔴 Deploying 4 bots to Free Fire servers...")
        print("This will:")
        print("  1. Create 4 guest accounts on Free Fire")
        print("  2. Authenticate each account")
        print("  3. Send join requests to Guild UID 3048504325")
        print("\nStarting deployment...\n")
        
        deployed = await ff_farm.deploy_bots()
        
        if deployed:
            print("\n" + "="*60)
            print("✅ DEPLOYMENT SUCCESSFUL!")
            print("="*60)
            print(f"Bots deployed: {len(ff_farm.bots)}")
            
            # Show bot details
            print("\nBot Details:")
            for i, bot in enumerate(ff_farm.bots, 1):
                account = bot.account
                print(f"\nBot {i}:")
                print(f"  UID: {account['uid']}")
                print(f"  Region: {account['region']}")
                print(f"  Guild Join Requested: Yes (Guild UID: {bot.guild_id})")
                print(f"  Status: {'Mock Account' if account.get('is_mock') else 'Real Account'}")
            
            print("\n" + "="*60)
            print("⚠️ NEXT STEPS:")
            print("="*60)
            print("1. Guild leader needs to ACCEPT the join requests")
            print("2. Check Free Fire guild for 4 pending requests")
            print("3. Once accepted, bots can start farming glory")
            print("="*60 + "\n")
            
            # Cleanup
            print("Cleaning up resources...")
            await ff_farm.cleanup()
            print("✓ Cleanup complete\n")
            
            return True
        else:
            print("\n❌ DEPLOYMENT FAILED")
            print("Check logs above for errors\n")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n🔴 WARNING: This will attempt to connect to REAL Free Fire servers!")
    print("Press Ctrl+C within 5 seconds to cancel...\n")
    
    try:
        import time
        for i in range(5, 0, -1):
            print(f"Starting in {i}...", end='\r')
            time.sleep(1)
        print("\n")
        
        # Run the test
        result = asyncio.run(test_real_bot_deployment())
        
        if result:
            print("✅ Test completed successfully!")
            sys.exit(0)
        else:
            print("❌ Test failed!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⚠️ Test cancelled by user")
        sys.exit(0)
