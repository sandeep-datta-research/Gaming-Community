"""
LIVE TEST: Deploy 4 bots to Guild UID 3048504325
"""
import asyncio
from production_ff_bot import deploy_bots_to_guild

async def main():
    print("\n🔴 LIVE BOT DEPLOYMENT TEST")
    print("="*60)
    print("Guild UID: 3048504325")
    print("Region: Middle East (ME)")
    print("Bot Count: 4")
    print("="*60 + "\n")
    
    # Deploy bots
    result = await deploy_bots_to_guild(
        guild_uid="3048504325",
        region="ME",
        bot_count=4
    )
    
    # Show results
    print("\n" + "="*60)
    print("DEPLOYMENT RESULTS")
    print("="*60)
    print(f"Success: {result['success']}")
    print(f"Bots Created: {result['bots_created']}/4")
    print(f"Guild Requests Sent: {result['guild_requests_sent']}")
    print(f"Mode: {result['mode']}")
    
    if result['error']:
        print(f"Error: {result['error']}")
    
    print("\nBot Details:")
    for i, bot in enumerate(result['bots'], 1):
        print(f"\nBot {i}:")
        print(f"  UID: {bot['uid']}")
        print(f"  Guild: {bot['guild_uid']}")
        print(f"  Request Sent: {bot['guild_request_sent']}")
        print(f"  Method: {bot.get('request_method', 'N/A')}")
    
    print("\n" + "="*60 + "\n")
    
    return result

if __name__ == "__main__":
    asyncio.run(main())
