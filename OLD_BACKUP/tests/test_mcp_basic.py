#!/usr/bin/env python3
"""Basic MCP server test"""

import os
import sys
sys.path.append(os.path.abspath('.'))

print("Testing MCP server module...")

try:
    import sys
    import os
    import importlib.util
    
    # Import formatter module directly
    formatter_spec = importlib.util.spec_from_file_location(
        'formatter', 
        os.path.abspath('mcp-telegram/formatter.py')
    )
    formatter = importlib.util.module_from_spec(formatter_spec)
    sys.modules['formatter'] = formatter
    formatter_spec.loader.exec_module(formatter)
    print("OK Formatter module imported successfully")
    
    # Import notifier module directly
    notifier_spec = importlib.util.spec_from_file_location(
        'notifier', 
        os.path.abspath('mcp-telegram/notifier.py')
    )
    notifier = importlib.util.module_from_spec(notifier_spec)
    sys.modules['notifier'] = notifier
    notifier_spec.loader.exec_module(notifier)
    print("OK Notifier module imported successfully")
    
    # Import server module directly
    server_spec = importlib.util.spec_from_file_location(
        'server', 
        os.path.abspath('mcp-telegram/server.py')
    )
    server = importlib.util.module_from_spec(server_spec)
    sys.modules['server'] = server
    server_spec.loader.exec_module(server)
    print("OK Server module imported successfully")
    
    print("\n=== All modules are working ===")
    print(f"- Formatter has format_notification: {hasattr(formatter, 'format_notification')}")
    print(f"- Notifier has notify_html: {hasattr(notifier, 'notify_html')}")
    print(f"- Server has task_done: {hasattr(server, 'task_done')}")
    
    if hasattr(server, 'task_done'):
        # Test with simple task
        try:
            test_result = server.task_done(
                feature="Test Feature",
                request="Test Request", 
                solution="Test Solution",
                summary="Test Summary"
            )
            print("OK task_done function works")
            print(f"  Result: {test_result}")
        except Exception as e:
            print(f"ERROR task_done failed: {e}")
            import traceback
            print(f"  Stack trace: {traceback.format_exc()}")
            
except Exception as e:
    print(f"ERROR Error: {e}")
    import traceback
    print(f"Stack trace: {traceback.format_exc()}")

print("\n=== Formatter Test ===")
try:
    test_data = {
        "feature": "test feature",
        "request": "test request", 
        "solution": "test solution",
        "summary": "test summary"
    }
    result = formatter.format_notification(test_data)
    print("OK format_notification works")
    print(f"  Output length: {len(result)} characters")
    print(f"  Contains test data: {all(key in result for key in test_data.values())}")
except Exception as e:
    print(f"ERROR format_notification failed: {e}")

print("\n=== Notifier Test ===")
try:
    test_message = "Test notification"
    import asyncio
    result = asyncio.run(notifier.notify_html(test_message))
    print("OK notify_html works")
    print(f"  Result: {result}")
except Exception as e:
    print(f"ERROR notify_html failed: {e}")
    import traceback
    print(f"Stack trace: {traceback.format_exc()}")
