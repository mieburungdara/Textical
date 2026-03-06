import { describe, it, expect, before, after } from 'node:test';
import assert from 'node:assert';
import { CombatSimulator } from '../src/combat/CombatSimulator.js';

describe('Combat Simulation', () => {
  let simulator;

  before(() => {
    simulator = new CombatSimulator();
  });

  it('should simulate combat and return a result', async () => {
    const playerTeam = [
      { id: '1', name: 'Player', hp: 100, attack: 10 }
    ];
    const enemyTeam = [
      { id: '2', name: 'Slime', hp: 50, attack: 5 }
    ];

    const result = await simulator.simulate(playerTeam, enemyTeam);
    
    assert.ok(result);
    assert.ok(['player', 'enemy'].includes(result.winner));
    assert.ok(Array.isArray(result.logs));
    assert.ok(result.timestamp);
  });

  it('should return valid combat logs', async () => {
    const playerTeam = [
      { id: '1', name: 'Player', hp: 100, attack: 10 }
    ];
    const enemyTeam = [
      { id: '2', name: 'Slime', hp: 50, attack: 5 }
    ];

    const result = await simulator.simulate(playerTeam, enemyTeam);
    
    assert.ok(result.logs.length > 0);
    result.logs.forEach(log => {
      assert.ok(typeof log === 'string');
      assert.ok(log.length > 0);
    });
  });
});
