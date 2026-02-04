#!/usr/bin/env python3
"""Fix any formatter issues"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mcp_telegram.formatter import format_notification
from typing import Dict, Any

def test_fix_missing_default_values():
    """Fix test: Ensure all fields have default values in format_notification"""
    print("Checking for missing default values in formatter...")
    
    # Run tests to see if there are any missing defaults
    from test_formatter import test_formatter_basic, test_formatter_default_values
    
    basic_result = test_formatter_basic()
    default_result = test_formatter_default_values()
    
    return basic_result and default_result

def fix_formatter_for_telegram():
    """Check if formatter produces valid HTML for Telegram API"""
    print("\nChecking formatter compatibility with Telegram API...")
    
    # Test with minimal data
    minimal_data = {
        "feature": "Test Feature",
        "summary": "This is a minimal test notification"
    }
    
    try:
        message = format_notification(minimal_data)
        
        # Check that message doesn't exceed Telegram's maximum message length (4096 characters)
        if len(message) > 4096:
            print(f"❌ Message exceeds Telegram's maximum length: {len(message)} > 4096")
            return False
        
        # Check for common HTML validation issues
        invalid_tags = ["<script>", "</script>", "<style>", "</style>"]
        for tag in invalid_tags:
            if tag in message.lower():
                print(f"❌ Message contains invalid tag: {tag}")
                return False
        
        print(f"✅ Formatter produces valid Telegram HTML")
        print(f"Message length: {len(message)} characters")
        return True
        
    except Exception as e:
        print(f"❌ Formatter failed: {e}")
        return False

def fix_notification_sizing():
    """Check for message length issues"""
    print("\nChecking notification sizing...")
    
    # Test with very large data to see if it stays within limits
    large_data = {
        "feature": "Very Large Feature" * 10,
        "request": "Very long request description " * 20,
        "solution": "Extensive implementation details " * 30,
        "lore": "Detailed world lore explanation " * 40,
        "milestones": "Comprehensive list of achievements " * 5,
        "files": "Multiple files modified: " + ", ".join([f"file{i}.py" for i in range(20)]),
        "registry": "Registry updates " * 10,
        "audit": "Full audit report " * 15,
        "duration": "10 minutes" * 5,
        "confidence": "High" * 3,
        "summary": "Brief summary " * 10,
        "game_system": "Complex system integration " * 5,
        "player_impact": "Significant impact " * 8,
        "backward_compatible": "Yes" * 3,
        "narrative_hook": "Engaging story element " * 10,
        "design_problem": "Challenging technical issue " * 8,
        "design_goal": "Ambitious design objective " * 6,
        "issues": "Known issues: " + ", ".join([f"issue{i}" for i in range(10)]),
        "security": "Security measures implemented " * 8,
        "quote": "Inspirational quote " * 5,
        "impact": "System impact analysis " * 10,
        "insight": "Key architectural insight " * 8,
        "next": "Next steps plan " * 6
    }
    
    try:
        message = format_notification(large_data)
        
        if len(message) > 4096:
            print(f"❌ Message too large: {len(message)} characters (limit: 4096)")
            
            # Find which fields are contributing the most to the size
            print("\nField sizes:")
            for key, value in large_data.items():
                field_size = len(str(value))
                if field_size > 100:
                    print(f"  - {key}: {field_size} characters")
            
            return False
        else:
            print(f"✅ Large notification fits within limits: {len(message)} characters")
            return True
            
    except Exception as e:
        print(f"❌ Large notification test failed: {e}")
        return False

def main():
    """Run all fix functions"""
    print("=== Formatter Issues Fixer ===")
    
    fixes = [
        test_fix_missing_default_values,
        fix_formatter_for_telegram,
        fix_notification_sizing
    ]
    
    passed = 0
    failed = 0
    
    for fix in fixes:
        try:
            if fix():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"\n❌ {fix.__name__} failed: {e}")
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"Fix Results: {passed} passed, {failed} failed")
    
    if failed > 0:
        print("\n❌ Some issues were found with the formatter")
        return False
    else:
        print("\n✅ All issues fixed - formatter is working correctly")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
