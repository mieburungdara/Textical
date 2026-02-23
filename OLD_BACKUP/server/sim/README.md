# 🔮 Eldoria World Oracle (EWO)

The **Eldoria World Oracle** is a high-fidelity mass-simulation suite designed to predict economic trends, identify progression gaps, and stress-test game systems using automated agents.

## 🏗️ Architecture
- **`OracleFactory.js`**: Manages the population lifecycle (Spawn/Cleanup).
- **`OracleBrain.js`**: The pure logic "personality" engine for bots.
- **`OracleRunner.js`**: Orchestrates the time-compressed loop.
- **`run.js`**: The main entry point for executing simulations.

## 🚀 Usage
To run a standard 24-hour world simulation:
```bash
node server/sim/run.js
```

## 🛠️ How to Extend
1. **New Archetypes**: Add a new key to `OracleFactory.ARCHETYPES` and define its decision logic in `OracleBrain.js`.
2. **New Actions**: Implement the service call in `OracleRunner._executeAction`.
3. **New Audits**: Add aggregation queries to `run.js` to track new metrics (e.g., Guild Treasury growth).

## 📊 Purpose
Use this tool whenever you:
- Change tax rates.
- Add new item tiers.
- Adjust material extraction probabilities.
- Implement new PvP consequences.

The Oracle will tell you if your changes will break the world economy before a single player logs in.
