import html
from typing import Dict, Any

def v(d: Dict[str, Any], key: str, default: str = "—") -> str:
    """Safely get value from dictionary with default and HTML escape"""
    value = d.get(key, default)
    if value is None:
        return default
    # Handle case where value might be a number or boolean
    return html.escape(str(value))

def format_notification(data: Dict[str, Any]) -> str:
    """Format notification message with all fields optional"""
    # Create a copy of data with default values for all possible fields
    safe_data = {
        "feature": "—",
        "request": "—",
        "solution": "—",
        "lore": "—",
        "milestones": "—",
        "files": "—",
        "registry": "—",
        "audit": "—",
        "duration": "—",
        "confidence": "—",
        "summary": "—",
        "game_system": "—",
        "player_impact": "—",
        "backward_compatible": "—",
        "narrative_hook": "—",
        "design_problem": "—",
        "design_goal": "—",
        "issues": "—",
        "security": "—",
        "quote": "—",
        "impact": "—",
        "insight": "—",
        "next": "—"
    }
    
    # Update with user-provided data
    safe_data.update(data)
    
    return f"""
✦ 🏆 <b>{v(safe_data,'feature')}: FULLY OPERATIONAL</b>

💬 <b>Permintaan/Pertanyaan:</b>
{v(safe_data,'request')}

🛠️ <b>Jawaban/Implementasi:</b>
{v(safe_data,'solution')}

📜 <b>World Lore:</b>
{v(safe_data,'lore')}

🌟 <b>Milestones Reached:</b>
{v(safe_data,'milestones')}

📊 <b>Technical Details:</b>
- <b>Files:</b> {v(safe_data,'files')}
- <b>Registry:</b> {v(safe_data,'registry')}
- <b>Audit:</b> {v(safe_data,'audit')}

⏱️ <b>Duration:</b> {v(safe_data,'duration')}
🎯 <b>Confidence:</b> {v(safe_data,'confidence')}
🧾 <b>TL;DR:</b>
{v(safe_data,'summary')}

🕹️ <b>Gameplay Impact:</b>
- Affected System: {v(safe_data,'game_system')}
- Player Impact: {v(safe_data,'player_impact')}
- Backward Compatible: {v(safe_data,'backward_compatible')}

📖 <b>Narrative Hook:</b>
{v(safe_data,'narrative_hook')}

🎯 <b>Design Intent:</b>
- Problem: {v(safe_data,'design_problem')}
- Goal: {v(safe_data,'design_goal')}

⚠️ <b>Risk Assessment:</b>
- <b>Known Issues:</b> {v(safe_data,'issues')}
- <b>Security Protocol:</b> {v(safe_data,'security')}

💬 <b>Quote of the Build:</b>
<i>{v(safe_data,'quote')}</i>

🔗 <b>System Impact:</b>
{v(safe_data,'impact')}

💡 <b>Key Insight:</b>
{v(safe_data,'insight')}

🚀 <b>Next Up:</b>
{v(safe_data,'next')}
""".strip()
