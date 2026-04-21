import uvicorn
import sys
import traceback

try:
    print("Importing chat_service.main...")
    import chat_service.main
    print("Import successful. App object:", chat_service.main.app)
    print("Starting uvicorn server...")
    uvicorn.run("chat_service.main:app", host="127.0.0.1", port=5006, log_level="debug")
except Exception as e:
    print("FAILED TO START!")
    traceback.print_exc()
