import sys
import os

# Add the current directory to sys.path so we can import the tools package
sys.path.append(os.getcwd())

from tools.replay_analyzer.engine import ReplayEngine

def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_replay.py <path_to_replay.json>")
        sys.exit(1)

    file_path = sys.argv[1]
    engine = ReplayEngine()
    engine.analyze_file(file_path)

if __name__ == "__main__":
    main()
