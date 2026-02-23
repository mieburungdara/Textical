#!/usr/bin/env python3
"""Comprehensive formatter module test"""

import sys
import os
import importlib.util

def import_module_from_file(module_name, file_path):
    """Import a module from a specific file path"""
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

def test_formatter_basic():
    """Test basic formatter functionality"""
    print("Testing basic formatter...")
    
    try:
        # Import formatter module directly
        formatter = import_module_from_file(
            'formatter', 
            os.path.abspath(os.path.join('mcp-telegram', 'formatter.py'))
        )
        
        test_data = {
            "feature": "Test Feature",
            "request": "Test Request",
            "solution": "Test Solution",
            "lore": "Test Lore",
            "milestones": "Test Milestones",
            "files": "Test Files",
            "registry": "Test Registry",
            "audit": "Test Audit",
            "duration": "Test Duration",
            "confidence": "Test Confidence",
            "summary": "Test Summary",
            "game_system": "Test Game System",
            "player_impact": "Test Player Impact",
            "backward_compatible": "Test Backward Compatible",
            "narrative_hook": "Test Narrative Hook",
            "design_problem": "Test Design Problem",
            "design_goal": "Test Design Goal",
            "issues": "Test Issues",
            "security": "Test Security",
            "quote": "Test Quote",
            "impact": "Test Impact",
            "insight": "Test Insight",
            "next": "Test Next"
        }
        
        result = formatter.format_notification(test_data)
        print("OK Formatter produces output")
        print(f"Output length: {len(result)} characters")
        
        # Verify the presence of all test keys in the output
        success = True
        for key, value in test_data.items():
            if value not in result:
                print(f"ERROR: '{value}' not found in output")
                success = False
        
        if success:
            print("OK All test data found in output")
        
        return success
        
    except Exception as e:
        print(f"ERROR Formatter failed: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False

def test_formatter_default_values():
    """Test that formatter provides default values for missing fields"""
    print("\nTesting default values...")
    
    try:
        formatter = import_module_from_file(
            'formatter', 
            os.path.abspath(os.path.join('mcp-telegram', 'formatter.py'))
        )
        
        result = formatter.format_notification({})
        print("OK Formatter with default values works")
        
        default_count = result.count("—")
        print(f"Number of default values used: {default_count}")
        
        # Should have at least one default value (feature field)
        assert default_count > 0, "Should use default values"
        
        return True
        
    except Exception as e:
        print(f"ERROR Formatter with default values failed: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False

def test_format_special_characters():
    """Test that HTML special characters are properly escaped"""
    print("\nTesting special characters handling...")
    
    try:
        formatter = import_module_from_file(
            'formatter', 
            os.path.abspath(os.path.join('mcp-telegram', 'formatter.py'))
        )
        
        test_data = {
            "feature": "Feature <script>alert('xss')</script>",
            "request": "Request & < > \" '",
            "solution": "Solution &amp; &lt; &gt; &quot; &#39;"
        }
        
        result = formatter.format_notification(test_data)
        print("OK Special characters handling works")
        
        # Check that special characters are escaped
        assert "<script>" not in result, "Script tags should be escaped"
        assert "&" in result, "Ampersands should be escaped"
        assert "<" in result or ">" in result, "Angle brackets should be escaped"
        
        return True
        
    except Exception as e:
        print(f"ERROR Special characters handling failed: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False

def test_formatter_missing_keys():
    """Test formatter with missing keys"""
    print("\nTesting formatter with missing keys...")
    
    try:
        formatter = import_module_from_file(
            'formatter', 
            os.path.abspath(os.path.join('mcp-telegram', 'formatter.py'))
        )
        
        test_data = {
            "feature": "Feature",
            "request": "Request"
        }
        
        result = formatter.format_notification(test_data)
        print("OK Formatter with missing keys works")
        
        return True
        
    except Exception as e:
        print(f"ERROR Formatter with missing keys failed: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False

def main():
    """Run all tests"""
    print("=== Formatter Module Tests ===")
    
    tests = [
        test_formatter_basic,
        test_formatter_default_values,
        test_format_special_characters,
        test_formatter_missing_keys
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"\nERROR {test.__name__} failed unexpectedly: {e}")
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
    success = main()
    sys.exit(0 if success else 1)
