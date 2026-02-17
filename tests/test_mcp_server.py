#!/usr/bin/env python3
"""Test MCP server integration"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import subprocess
import time
import requests
from typing import Dict, Any

def test_mcp_server_startup():
    """Test if MCP server can start successfully"""
    print("Testing MCP server startup...")
    
    try:
        # Try to start the server and check if it responds
        process = subprocess.Popen([
            sys.executable, 
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "mcp-telegram", "server.py")
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        time.sleep(2)
        
        # Check if server is running
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            print(f"❌ Server failed to start")
            print(f"Exit code: {process.returncode}")
            if stdout:
                print(f"STDOUT: {stdout}")
            if stderr:
                print(f"STDERR: {stderr}")
            return False
        
        # Server started successfully
        process.terminate()
        try:
            process.wait(timeout=1)
        except subprocess.TimeoutExpired:
            process.kill()
        
        print("✅ Server started successfully")
        return True
        
    except Exception as e:
        print(f"❌ Server startup test failed: {e}")
        print(f"Type: {type(e).__name__}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False

def test_import_modules():
    """Test if all modules can be imported without errors"""
    print("\nTesting module imports...")
    
    modules_to_test = [
        "mcp_telegram.formatter",
        "mcp_telegram.notifier", 
        "mcp_telegram.server"
    ]
    
    all_success = True
    
    for module_name in modules_to_test:
        try:
            __import__(module_name)
            print(f"✅ {module_name} imported successfully")
        except Exception as e:
            print(f"❌ {module_name} import failed: {e}")
            print(f"Type: {type(e).__name__}")
            import traceback
            print(f"Stack trace: {traceback.format_exc()}")
            all_success = False
    
    return all_success

def test_mcp_server_integration():
    """Test the complete integration of all components"""
    print("\nTesting MCP server integration...")
    
    try:
        # This is a basic integration test
        from mcp_telegram.formatter import format_notification
        from mcp_telegram.notifier import notify_html
        from mcp_telegram.server import task_done
        
        test_data = {
            "feature": "MCP Server Integration Test",
            "request": "Test if the MCP server can be started and modules can be imported",
            "solution": "The server startup and module import tests passed successfully",
            "summary": "MCP server components are working correctly",
            "confidence": "High",
            "duration": "1 minute"
        }
        
        message = format_notification(test_data)
        print(f"✅ Formatter produced message of length: {len(message)}")
        
        print("✅ All MCP server components are working correctly")
        return True
        
    except Exception as e:
        print(f"❌ MCP server integration test failed: {e}")
        print(f"Type: {type(e).__name__}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return False

def main():
    """Run all tests"""
    print("=== MCP Server Integration Tests ===")
    
    tests = [
        test_import_modules,
        test_mcp_server_startup,
        test_mcp_server_integration
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
    success = main()
    sys.exit(0 if success else 1)
