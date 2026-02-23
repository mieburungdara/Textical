import json
from pathlib import Path
from typing import List, Dict, Any

# Modular Auditors Imports
from .auditors.collision import CollisionAuditor
from .auditors.zombie_action import ZombieActionAuditor
from .auditors.zombie_move import ZombieMoveAuditor
from .auditors.heal import HealAudit
from .auditors.teleport import TeleportAudit
from .auditors.range import RangeAudit
from .auditors.damage import DamageAudit
from .auditors.mana import ManaAudit
from .auditors.stun import StunAudit
from .auditors.loop import LoopAudit
from .auditors.cooldown import CooldownAudit
from .auditors.turn import TurnAudit
from .auditors.scaling import ScalingAudit
from .auditors.duration import DurationAudit
from .auditors.outcome import OutcomeAudit
from .auditors.delay import DelayAuditor
from .auditors.facing import FacingAuditor
from .auditors.loot import LootAuditor
from .auditors.terrain import TerrainAuditor
from .auditors.aggro import AggroAuditor
from .auditors.critical_hit import CriticalHitAuditor
from .auditors.block import BlockAuditor
from .auditors.xp_gain import XpGainAuditor
from .auditors.overkill import OverkillAuditor
from .auditors.desync import DesyncAuditor
from .auditors.formation import FormationAuditor
from .auditors.action_economy import ActionEconomyAuditor
from .auditors.buff_stack import BuffStackAuditor
from .auditors.health_cap import HealthCapAuditor
from .auditors.friendly_fire import FriendlyFireAuditor
from .auditors.projectile import ProjectileAuditor
from .auditors.resource_regen import ResourceRegenAuditor
from .auditors.aggro_shift import AggroShiftAuditor
from .auditors.status_synergy import StatusSynergyAuditor
from .auditors.inventory_desync import InventoryDesyncAuditor
from .auditors.aoe import AoeAudit
from .auditors.dodge import DodgeAudit
from .auditors.stalemate import StalemateAudit
from .auditors.ghost_damage import GhostDamageAudit
from .auditors.logic_order import LogicOrderAudit
from .auditors.elemental_resist import ElementalResistAudit
from .auditors.equip_effect import EquipEffectAudit
from .auditors.stealth_visibility import StealthVisibilityAudit
from .auditors.action_cost_desync import ActionCostDesyncAudit
from .auditors.retreat_logic import RetreatLogicAudit
from .auditors.morale import MoraleAuditor
from .auditors.combo import ComboAuditor
from .auditors.spread import SpreadAuditor
from .auditors.leak import LeakAuditor
from .auditors.shadow import ShadowAuditor
from .auditors.traffic import TrafficAuditor
from .auditors.stats import StatsAuditor

class ReplayEngine:
    def __init__(self):
        # Initialize all specialized auditors (Now 52 modules)
        self.auditors = [
            CollisionAuditor(), ZombieActionAuditor(), ZombieMoveAuditor(),
            HealAudit(), TeleportAudit(), RangeAudit(), DamageAudit(),
            ManaAudit(), StunAudit(), LoopAudit(), CooldownAudit(),
            TurnAudit(), ScalingAudit(), DurationAudit(), OutcomeAudit(),
            DelayAuditor(), FacingAuditor(), LootAuditor(), TerrainAuditor(),
            AggroAuditor(), CriticalHitAuditor(), BlockAuditor(),
            XpGainAuditor(), OverkillAuditor(), DesyncAuditor(),
            FormationAuditor(), ActionEconomyAuditor(), BuffStackAuditor(),
            HealthCapAuditor(), FriendlyFireAuditor(),
            ProjectileAuditor(), ResourceRegenAuditor(), AggroShiftAuditor(),
            StatusSynergyAuditor(), InventoryDesyncAuditor(),
            AoeAudit(), DodgeAudit(), StalemateAudit(),
            GhostDamageAudit(), LogicOrderAudit(),
            ElementalResistAudit(), EquipEffectAudit(), StealthVisibilityAudit(),
            ActionCostDesyncAudit(), RetreatLogicAudit(),
            MoraleAuditor(), ComboAuditor(), SpreadAuditor(),
            LeakAuditor(), ShadowAuditor(), TrafficAuditor(),
            StatsAuditor()
        ]
        self.last_state = {} # unit_id -> last observed full state
        self.tick_count = 0

    def analyze_file(self, file_path: str):
        path = Path(file_path)
        if not path.exists():
            print(f"Error: {file_path} not found.")
            return

        with open(path, 'r') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"Error: {file_path} is not a valid JSON file.")
                return

        # Handle different replay formats (Optimized vs Debug)
        ticks = data.get("replay") or data.get("ticks") if isinstance(data, dict) else data
        if not ticks:
            print("Error: No tick data found in replay.")
            return

        print(f"SEARCHING ULTIMATE REPLAY AUDIT ENGAGED: {path.name}")
        print(f"Active Auditors: {len(self.auditors)}")
        
        for tick in ticks:
            self.tick_count += 1
            tick_idx = tick.get("tick") or tick.get("i", self.tick_count)
            units = tick.get("units") or tick.get("u", [])
            events = tick.get("events") or tick.get("e", [])
            
            for auditor in self.auditors:
                auditor.audit_tick(tick_idx, units, events, self.last_state)
            
            for u in units:
                uid = u.get("id")
                if uid:
                    if uid not in self.last_state:
                        self.last_state[uid] = {}
                    self.last_state[uid].update(u)

        self._print_final_report()

    def _print_final_report(self):
        print("\n" + "="*40)
        print("REPLAY AUDIT REPORT")
        print("="*40)
        print(f"Total Ticks Scanned: {self.tick_count}")
        
        total_errors = 0
        for auditor in self.auditors:
            report = auditor.get_report()
            if report['error_count'] > 0:
                print(f"\n[{report['name']}]")
                if report['name'] == "BattleSummary":
                    print("  RESULTS:")
                else:
                    print(f"  FAILED: {report['error_count']} errors detected:")
                
                for err in report['errors']:
                    print(f"    - {err}")
                
                if report['name'] != "BattleSummary":
                    total_errors += report['error_count']
        
        print("\n" + "="*40)
        if total_errors == 0:
            print("STATUS: PERFECT SIMULATION")
        else:
            print(f"STATUS: {total_errors} ISSUES DETECTED")
        print("="*40)