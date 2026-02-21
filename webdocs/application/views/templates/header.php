<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title; ?> | Textical webdocs</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;500;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-deep: #020617;
            --bg-surface: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.5);
            --accent: #3b82f6;
            --accent-glow: rgba(59, 130, 246, 0.4);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --border-soft: rgba(255, 255, 255, 0.08);
            --sidebar-width: 280px;
            
            /* Rarity Glows */
            --glow-common: none;
            --glow-uncommon: 0 0 10px rgba(16, 185, 129, 0.2);
            --glow-refined: 0 0 12px rgba(6, 182, 212, 0.25);
            --glow-superior: 0 0 15px rgba(132, 204, 22, 0.3);
            --glow-rare: 0 0 18px rgba(59, 130, 246, 0.35);
            --glow-heroic: 0 0 22px rgba(245, 158, 11, 0.45);
            --glow-epic: 0 0 25px rgba(168, 85, 247, 0.5);
            --glow-relic: 0 0 28px rgba(249, 115, 22, 0.55);
            --glow-ancient: 0 0 32px rgba(244, 63, 94, 0.6);
            --glow-mythic: 0 0 35px rgba(236, 72, 153, 0.7);
        }

        /* Smooth Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-deep); }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }

        body {
            background-color: var(--bg-deep);
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
            color: var(--text-primary);
            font-family: 'Inter', sans-serif;
            margin: 0;
            overflow-x: hidden;
            min-height: 100vh;
        }

        h1, h2, h3, .heading { font-family: 'Outfit', sans-serif; font-weight: 700; letter-spacing: -0.02em; }

        .wrapper { display: flex; align-items: stretch; }

        #sidebar {
            width: var(--sidebar-width);
            min-width: var(--sidebar-width);
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            border-right: 1px solid var(--border-soft);
            height: 100vh;
            position: fixed;
            z-index: 1000;
            padding: 2rem 1rem;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #content {
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 0;
            min-height: 100vh;
        }

        /* Glass Cards */
        .glass-card {
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            border: 1px solid var(--border-soft);
            border-radius: 16px;
            transition: all 0.3s ease;
        }

        .glass-card:hover { border-color: rgba(255, 255, 255, 0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }

        /* Rarity Visuals */
        .rarity-pill {
            font-size: 0.7rem;
            font-weight: 800;
            padding: 3px 10px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .COMMON { color: #94a3b8; background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.2); }
        .UNCOMMON { color: #10b981; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: var(--glow-uncommon); }
        .REFINED { color: #06b6d4; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); box-shadow: var(--glow-refined); }
        .SUPERIOR { color: #84cc16; background: rgba(132, 204, 22, 0.1); border: 1px solid rgba(132, 204, 22, 0.2); box-shadow: var(--glow-superior); }
        .RARE { color: #3b82f6; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); box-shadow: var(--glow-rare); }
        .HEROIC { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); box-shadow: var(--glow-heroic); }
        .EPIC { color: #a855f7; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); box-shadow: var(--glow-epic); }
        .RELIC { color: #f97316; background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.2); box-shadow: var(--glow-relic); }
        .ANCIENT { color: #f43f5e; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); box-shadow: var(--glow-ancient); }
        .MYTHIC { 
            color: #ec4899; 
            background: rgba(236, 72, 153, 0.1); 
            border: 1px solid rgba(236, 72, 153, 0.2); 
            box-shadow: var(--glow-mythic);
            animation: mythic-pulse 2s infinite ease-in-out;
        }

        @keyframes mythic-pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.4); }
            50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.7); }
        }

        /* Form Styling */
        .premium-input {
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid var(--border-soft);
            color: white;
            border-radius: 12px;
            padding: 0.7rem 1rem;
            transition: all 0.3s;
        }

        .premium-input:focus {
            background: rgba(15, 23, 42, 0.8);
            border-color: var(--accent);
            box-shadow: 0 0 0 4px var(--accent-glow);
            outline: none;
        }

        /* Hero Styling */
        .hero-banner {
            padding: 4rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
            border-bottom: 1px solid var(--border-soft);
            background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
        }

        .category-node {
            padding: 0.6rem 1rem;
            border-radius: 10px;
            color: var(--text-secondary);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 4px;
            transition: all 0.2s;
            font-size: 0.95rem;
        }

        .category-node:hover {
            background: rgba(255,255,255,0.05);
            color: var(--text-primary);
        }

        .category-node.active {
            background: var(--accent);
            color: white;
            box-shadow: 0 4px 15px var(--accent-glow);
        }
    </style>
</head>
<body>
<div class="wrapper">
