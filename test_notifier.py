#!/usr/bin/env python3
"""Test notifier module"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mcp_telegram.notifier import notify_html

async def test_notifier():
    """Test the notify_html function"""
    print("Testing notify_html function...")
    
    test_message = """
✅ <b>Test Notification</b>

This is a test notification from the Textical system.
It includes various HTML formatting features:

- <b>Bold text</b>
- <i>Italic text</i>
- <code>Code blocks</code>
- Links to <a href="https://textical.org">Textical</a>

The notification system should properly handle all these features.
    """.strip()
    
    try:
        print("Attempting to send notification...")
        await notify_html(test_message)
        print("✅ Notification sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Notification failed: {e}")
        print(f"Type: {type(e).__name__}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False

async def test_notifier_with_special_characters():
    """Test notification with special characters"""
    print("\nTesting notify_html with special characters...")
    
    test_message = """
✅ <b>Special Characters Test</b>

This test includes special characters that should be properly escaped:

- & (ampersand)
- < (less than)
- > (greater than)
- " (double quote)
- ' (single quote)
- 🎯 (emoji)
- 🏆 (emoji)
- 💬 (emoji)
    """.strip()
    
    try:
        print("Attempting to send notification...")
        await notify_html(test_message)
        print("✅ Notification with special characters sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Notification with special characters failed: {e}")
        print(f"Type: {type(e).__name__}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False

async def test_notifier_empty_message():
    """Test sending an empty message"""
    print("\nTesting notify_html with empty message...")
    
    try:
        await notify_html("")
        print("✅ Empty notification handled successfully")
        return True
    except Exception as e:
        print(f"❌ Empty notification failed: {e}")
        print(f"Type: {type(e).__name__}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False

async def main():
    """Run all tests"""
    print("=== Notifier Module Tests ===")
    
    tests = [
        test_notifier,
        test_notifier_with_special_characters,
        test_notifier_empty_message
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if await test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"\n❌ {test.__name__} failed unexpectedly: {e}")
            print(f"Type: {type(e).__name__}")
            import traceback
            print(f"Stack trace: {traceback.format_exc()}")
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed} passed, {failed} failed")
    
    if failed > 0:
        return False
    return True

if __name__ == "__main__":
    import asyncio
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
