'use client';

import { useState, useEffect, useRef } from 'react';

interface OptimizationModalProps {
    isOpen: boolean;
    isComplete: boolean;
    onViewResults: () => void;
}

// ==================== DNA HELIX COMPONENT ====================
function DNAHelix() {
    const [rotation, setRotation] = useState(0);
    const [packets, setPackets] = useState([
        { x: -70, strand: 1, id: 0 },
        { x: -130, strand: 2, id: 1 },
        { x: 30, strand: 1, id: 2 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(r => (r + 2.5) % 360);
            setPackets(prev => prev.map(p => ({ ...p, x: p.x > 110 ? -130 : p.x + 2.5 })));
        }, 30);
        return () => clearInterval(interval);
    }, []);

    const radius = 20;
    const numDots = 16;
    const width = 240;

    const getPos = (x: number, strand: number) => {
        const progress = (x + 120) / 240;
        const angle = (progress * 360 * 3) + rotation + (strand === 2 ? 180 : 0);
        return {
            x,
            y: Math.cos(angle * Math.PI / 180) * radius,
            z: Math.sin(angle * Math.PI / 180) * radius
        };
    };

    const helixDots: Array<{ x: number; y: number; z: number; scale: number; strand: number; fade: number; glow: number }> = [];

    for (let i = 0; i < numDots; i++) {
        const progress = i / numDots;
        const x = (progress * width) - (width / 2);

        const pos1 = getPos(x, 1);
        const pos2 = getPos(x, 2);
        const scale1 = (pos1.z + radius) / (radius * 2) * 0.5 + 0.5;
        const scale2 = (pos2.z + radius) / (radius * 2) * 0.5 + 0.5;
        const fade = Math.min(progress * 3.5, (1 - progress) * 3.5, 1);

        let glow1 = 0, glow2 = 0;
        packets.forEach(p => {
            const dist = Math.abs(x - p.x);
            if (dist < 30) {
                if (p.strand === 1) glow1 = Math.max(glow1, 1 - dist / 30);
                else glow2 = Math.max(glow2, 1 - dist / 30);
            }
        });

        helixDots.push({ ...pos1, scale: scale1, strand: 1, fade, glow: glow1 });
        helixDots.push({ ...pos2, scale: scale2, strand: 2, fade, glow: glow2 });
    }
    helixDots.sort((a, b) => a.z - b.z);

    // Bridges between strands
    const bridges: Array<{ x: number; y1: number; y2: number; z: number; opacity: number }> = [];
    for (let i = 0; i < numDots; i++) {
        const progress = i / numDots;
        const x = (progress * width) - (width / 2);
        const pos1 = getPos(x, 1);
        const pos2 = getPos(x, 2);
        const avgZ = (pos1.z + pos2.z) / 2;
        const fade = Math.min(progress * 3.5, (1 - progress) * 3.5, 1);
        const opacity = ((avgZ + radius) / (radius * 2)) * 0.3 * fade;
        if (opacity > 0.02) {
            bridges.push({ x, y1: pos1.y, y2: pos2.y, z: avgZ, opacity });
        }
    }
    bridges.sort((a, b) => a.z - b.z);

    // Trails behind packets
    const trails: Array<{ x: number; y: number; z: number; strand: number; alpha: number; size: number; id: string }> = [];
    packets.forEach(p => {
        for (let t = 1; t <= 12; t++) {
            const tx = p.x - t * 6;
            if (tx < -110 || tx > 110) continue;
            const pos = getPos(tx, p.strand);
            const alpha = 0.65 - t * 0.05;
            const size = 8 - t * 0.5;
            if (alpha > 0.05 && size > 1) {
                trails.push({ ...pos, strand: p.strand, alpha, size, id: `${p.id}-${t}` });
            }
        }
    });
    trails.sort((a, b) => a.z - b.z);

    return (
        <div className="relative mx-auto" style={{ width: '300px', height: '100px' }}>
            {/* Ambient glow */}
            <div
                className="absolute"
                style={{
                    width: '280px',
                    height: '80px',
                    left: '10px',
                    top: '10px',
                    background: 'radial-gradient(ellipse, rgba(9,183,180,0.15) 0%, transparent 65%)',
                    filter: 'blur(20px)'
                }}
            />

            {/* Bridges */}
            {bridges.map((b, i) => (
                <div
                    key={`bridge-${i}`}
                    className="absolute"
                    style={{
                        width: '2px',
                        height: `${Math.abs(b.y1 - b.y2)}px`,
                        left: `${150 + b.x - 1}px`,
                        top: `${50 + Math.min(b.y1, b.y2)}px`,
                        background: `linear-gradient(180deg, rgba(9,183,180,${b.opacity}), rgba(229,120,68,${b.opacity}))`,
                        zIndex: Math.round(b.z + 20)
                    }}
                />
            ))}

            {/* Helix dots */}
            {helixDots.map((d, i) => {
                const size = (8 + d.glow * 4) * d.scale;
                const alpha = (0.5 + d.scale * 0.5 + d.glow * 0.3) * d.fade;
                return (
                    <div
                        key={`dot-${i}`}
                        className="absolute rounded-full"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            background: d.strand === 1
                                ? `rgba(9, 183, 180, ${alpha})`
                                : `rgba(229, 120, 68, ${alpha})`,
                            boxShadow: d.strand === 1
                                ? `0 0 ${(6 + d.glow * 10) * d.scale}px rgba(9, 183, 180, ${(0.4 + d.glow * 0.4) * d.fade})`
                                : `0 0 ${(6 + d.glow * 10) * d.scale}px rgba(229, 120, 68, ${(0.4 + d.glow * 0.4) * d.fade})`,
                            left: `${150 + d.x - size / 2}px`,
                            top: `${50 + d.y - size / 2}px`,
                            zIndex: Math.round(d.z + 40)
                        }}
                    />
                );
            })}

            {/* Trails */}
            {trails.map(t => {
                const scale = (t.z + radius) / (radius * 2) * 0.5 + 0.6;
                return (
                    <div
                        key={t.id}
                        className="absolute rounded-full"
                        style={{
                            width: `${t.size * scale}px`,
                            height: `${t.size * scale}px`,
                            background: t.strand === 1
                                ? `rgba(9, 183, 180, ${t.alpha * scale})`
                                : `rgba(229, 120, 68, ${t.alpha * scale})`,
                            boxShadow: `0 0 ${t.size * 1.5}px ${t.strand === 1
                                ? `rgba(9, 183, 180, ${t.alpha * 0.6})`
                                : `rgba(229, 120, 68, ${t.alpha * 0.6})`}`,
                            left: `${150 + t.x - t.size * scale / 2}px`,
                            top: `${50 + t.y - t.size * scale / 2}px`,
                            zIndex: Math.round(t.z + 55)
                        }}
                    />
                );
            })}

            {/* Main packets */}
            {packets.map(p => {
                const pos = getPos(p.x, p.strand);
                if (p.x < -100 || p.x > 100) return null;
                const scale = (pos.z + radius) / (radius * 2) * 0.4 + 0.7;
                const size = 18 * scale;
                return (
                    <div
                        key={`packet-${p.id}`}
                        className="absolute rounded-full"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            background: p.strand === 1
                                ? 'radial-gradient(circle, rgba(255,255,255,1) 0%, #0EEAE5 30%, rgba(9,183,180,0.5) 55%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(255,255,255,1) 0%, #F4A261 30%, rgba(229,120,68,0.5) 55%, transparent 70%)',
                            boxShadow: p.strand === 1
                                ? '0 0 12px rgba(255,255,255,0.9), 0 0 25px #0EEAE5, 0 0 50px rgba(9,183,180,0.7)'
                                : '0 0 12px rgba(255,255,255,0.9), 0 0 25px #F4A261, 0 0 50px rgba(229,120,68,0.7)',
                            left: `${150 + pos.x - size / 2}px`,
                            top: `${50 + pos.y - size / 2}px`,
                            zIndex: Math.round(pos.z + 75)
                        }}
                    />
                );
            })}
        </div>
    );
}

// ==================== ASTEROIDS GAME ====================
function AsteroidsGame({ onScoreChange }: { onScoreChange?: (score: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef({
        ship: { x: 300, y: 225, angle: -90, vx: 0, vy: 0 },
        bullets: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number }>,
        asteroids: [] as Array<{ x: number; y: number; vx: number; vy: number; size: number; id: number }>,
        score: 0,
        keys: { left: false, right: false, up: false, shoot: false },
        lastShot: 0,
        mousePos: { x: 300, y: 225 },
        mouseDown: false
    });

    // Initialize asteroids
    useEffect(() => {
        const g = gameRef.current;
        g.asteroids = [];
        for (let i = 0; i < 6; i++) {
            g.asteroids.push({
                x: Math.random() * 600,
                y: Math.random() * 450,
                vx: (Math.random() - 0.5) * 2.5,
                vy: (Math.random() - 0.5) * 2.5,
                size: 30 + Math.random() * 20,
                id: i
            });
        }
    }, []);

    // Game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const g = gameRef.current;

        const gameLoop = setInterval(() => {
            // Update ship angle to face mouse
            const dx = g.mousePos.x - g.ship.x;
            const dy = g.mousePos.y - g.ship.y;
            g.ship.angle = Math.atan2(dy, dx) * 180 / Math.PI;

            // Thrust
            if (g.keys.up) {
                const rad = g.ship.angle * Math.PI / 180;
                g.ship.vx += Math.cos(rad) * 0.15;
                g.ship.vy += Math.sin(rad) * 0.15;
            }

            // Keyboard rotation
            if (g.keys.left) g.ship.angle -= 5;
            if (g.keys.right) g.ship.angle += 5;

            // Friction & movement
            g.ship.vx *= 0.99;
            g.ship.vy *= 0.99;
            g.ship.x += g.ship.vx;
            g.ship.y += g.ship.vy;

            // Wrap around
            if (g.ship.x < 0) g.ship.x = 600;
            if (g.ship.x > 600) g.ship.x = 0;
            if (g.ship.y < 0) g.ship.y = 450;
            if (g.ship.y > 450) g.ship.y = 0;

            // Shoot
            const now = Date.now();
            if ((g.mouseDown || g.keys.shoot) && now - g.lastShot > 200) {
                const rad = g.ship.angle * Math.PI / 180;
                g.bullets.push({
                    x: g.ship.x + Math.cos(rad) * 18,
                    y: g.ship.y + Math.sin(rad) * 18,
                    vx: Math.cos(rad) * 8,
                    vy: Math.sin(rad) * 8,
                    life: 70
                });
                g.lastShot = now;
            }

            // Update bullets
            g.bullets = g.bullets.filter(b => {
                b.x += b.vx;
                b.y += b.vy;
                b.life--;
                return b.life > 0 && b.x > 0 && b.x < 600 && b.y > 0 && b.y < 450;
            });

            // Update asteroids
            g.asteroids.forEach(a => {
                a.x += a.vx;
                a.y += a.vy;
                if (a.x < -60) a.x = 660;
                if (a.x > 660) a.x = -60;
                if (a.y < -60) a.y = 510;
                if (a.y > 510) a.y = -60;
            });

            // Collision detection
            g.bullets.forEach(b => {
                g.asteroids.forEach(a => {
                    const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
                    if (dist < a.size) {
                        b.life = 0;
                        g.score += Math.round(60 - a.size + 40);
                        onScoreChange?.(g.score);

                        if (a.size > 18) {
                            for (let i = 0; i < 2; i++) {
                                g.asteroids.push({
                                    x: a.x, y: a.y,
                                    vx: a.vx + (Math.random() - 0.5) * 3,
                                    vy: a.vy + (Math.random() - 0.5) * 3,
                                    size: a.size * 0.55,
                                    id: Date.now() + Math.random()
                                });
                            }
                        }
                        a.size = 0;
                    }
                });
            });

            // Remove destroyed & spawn new
            g.asteroids = g.asteroids.filter(a => a.size > 0);
            while (g.asteroids.length < 6) {
                const edge = Math.floor(Math.random() * 4);
                let x, y;
                if (edge === 0) { x = 0; y = Math.random() * 450; }
                else if (edge === 1) { x = 600; y = Math.random() * 450; }
                else if (edge === 2) { x = Math.random() * 600; y = 0; }
                else { x = Math.random() * 600; y = 450; }
                g.asteroids.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    size: 30 + Math.random() * 25,
                    id: Date.now() + Math.random()
                });
            }

            // Draw
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 600, 450);

            // Stars background
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            for (let i = 0; i < 50; i++) {
                ctx.fillRect((i * 127) % 600, (i * 89) % 450, 1, 1);
            }

            // Asteroids
            ctx.strokeStyle = '#09B7B4';
            ctx.lineWidth = 2;
            g.asteroids.forEach(a => {
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
                ctx.stroke();
            });

            // Bullets
            ctx.fillStyle = '#F4A261';
            ctx.shadowColor = '#F4A261';
            ctx.shadowBlur = 10;
            g.bullets.forEach(b => {
                ctx.beginPath();
                ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;

            // Ship
            const rad = g.ship.angle * Math.PI / 180;
            ctx.save();
            ctx.translate(g.ship.x, g.ship.y);
            ctx.rotate(rad);
            ctx.fillStyle = '#0EEAE5';
            ctx.shadowColor = '#0EEAE5';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(18, 0);
            ctx.lineTo(-12, -10);
            ctx.lineTo(-6, 0);
            ctx.lineTo(-12, 10);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // Thrust flame
            if (g.keys.up) {
                ctx.fillStyle = '#F4A261';
                ctx.beginPath();
                ctx.moveTo(-10, -5);
                ctx.lineTo(-22, 0);
                ctx.lineTo(-10, 5);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

        }, 1000 / 60);

        return () => clearInterval(gameLoop);
    }, [onScoreChange]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        gameRef.current.mousePos = {
            x: (e.clientX - rect.left) * (600 / rect.width),
            y: (e.clientY - rect.top) * (450 / rect.height)
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        if (e.button === 0) gameRef.current.mouseDown = true;
        if (e.button === 2) gameRef.current.keys.up = true;
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (e.button === 0) gameRef.current.mouseDown = false;
        if (e.button === 2) gameRef.current.keys.up = false;
    };

    const handleButtonDown = (action: string) => {
        const g = gameRef.current;
        if (action === 'shoot') g.mouseDown = true;
        else if (action === 'thrust') g.keys.up = true;
        else if (action === 'left') g.keys.left = true;
        else if (action === 'right') g.keys.right = true;
    };

    const handleButtonUp = (action: string) => {
        const g = gameRef.current;
        if (action === 'shoot') g.mouseDown = false;
        else if (action === 'thrust') g.keys.up = false;
        else if (action === 'left') g.keys.left = false;
        else if (action === 'right') g.keys.right = false;
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <canvas
                ref={canvasRef}
                width={600}
                height={450}
                className="rounded-xl border border-cyan-500/30 cursor-crosshair w-full max-w-[600px]"
                style={{ aspectRatio: '4/3' }}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => { gameRef.current.mouseDown = false; gameRef.current.keys.up = false; }}
                onContextMenu={(e) => e.preventDefault()}
            />

            {/* On-screen controls */}
            <div className="flex gap-3">
                <button
                    className="w-14 h-14 rounded-full bg-slate-700/80 hover:bg-slate-600 active:bg-cyan-600 text-cyan-400 font-bold text-2xl transition-colors select-none touch-none"
                    onMouseDown={() => handleButtonDown('left')}
                    onMouseUp={() => handleButtonUp('left')}
                    onMouseLeave={() => handleButtonUp('left')}
                    onTouchStart={(e) => { e.preventDefault(); handleButtonDown('left'); }}
                    onTouchEnd={() => handleButtonUp('left')}
                >
                    ←
                </button>
                <button
                    className="w-14 h-14 rounded-full bg-slate-700/80 hover:bg-slate-600 active:bg-orange-600 text-orange-400 font-bold text-xl transition-colors select-none touch-none"
                    onMouseDown={() => handleButtonDown('thrust')}
                    onMouseUp={() => handleButtonUp('thrust')}
                    onMouseLeave={() => handleButtonUp('thrust')}
                    onTouchStart={(e) => { e.preventDefault(); handleButtonDown('thrust'); }}
                    onTouchEnd={() => handleButtonUp('thrust')}
                >
                    ▲
                </button>
                <button
                    className="w-14 h-14 rounded-full bg-slate-700/80 hover:bg-slate-600 active:bg-cyan-600 text-cyan-400 font-bold text-2xl transition-colors select-none touch-none"
                    onMouseDown={() => handleButtonDown('right')}
                    onMouseUp={() => handleButtonUp('right')}
                    onMouseLeave={() => handleButtonUp('right')}
                    onTouchStart={(e) => { e.preventDefault(); handleButtonDown('right'); }}
                    onTouchEnd={() => handleButtonUp('right')}
                >
                    →
                </button>
                <div className="w-4" />
                <button
                    className="w-20 h-14 rounded-full bg-red-600/80 hover:bg-red-500 active:bg-red-400 text-white font-bold transition-colors select-none touch-none"
                    onMouseDown={() => handleButtonDown('shoot')}
                    onMouseUp={() => handleButtonUp('shoot')}
                    onMouseLeave={() => handleButtonUp('shoot')}
                    onTouchStart={(e) => { e.preventDefault(); handleButtonDown('shoot'); }}
                    onTouchEnd={() => handleButtonUp('shoot')}
                >
                    FIRE
                </button>
            </div>

            <p className="text-slate-500 text-xs text-center">
                Mouse aims • Left-click shoots • Right-click thrusts
            </p>
        </div>
    );
}

// ==================== SPACE INVADERS GAME ====================
function SpaceInvadersGame({ onScoreChange }: { onScoreChange?: (score: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef({
        ship: { x: 300, y: 410 },
        bullets: [] as Array<{ x: number; y: number }>,
        invaders: [] as Array<{ x: number; y: number; type: number; id: number }>,
        invaderBullets: [] as Array<{ x: number; y: number }>,
        score: 0,
        direction: 1,
        lastShot: 0,
        moveTimer: 0,
        keys: { left: false, right: false, shoot: false }
    });

    // Initialize invaders
    useEffect(() => {
        const g = gameRef.current;
        g.invaders = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                g.invaders.push({
                    x: 60 + col * 50,
                    y: 50 + row * 40,
                    type: row,
                    id: row * 10 + col
                });
            }
        }
    }, []);

    // Game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const g = gameRef.current;

        const gameLoop = setInterval(() => {
            // Move ship
            if (g.keys.left && g.ship.x > 25) g.ship.x -= 5;
            if (g.keys.right && g.ship.x < 575) g.ship.x += 5;

            // Shoot
            const now = Date.now();
            if (g.keys.shoot && now - g.lastShot > 250) {
                g.bullets.push({ x: g.ship.x, y: g.ship.y - 15 });
                g.lastShot = now;
            }

            // Move bullets
            g.bullets = g.bullets.filter(b => {
                b.y -= 7;
                return b.y > 0;
            });

            // Move invaders
            g.moveTimer++;
            if (g.moveTimer > 25) {
                g.moveTimer = 0;
                let hitEdge = false;
                g.invaders.forEach(inv => {
                    inv.x += g.direction * 12;
                    if (inv.x < 30 || inv.x > 570) hitEdge = true;
                });
                if (hitEdge) {
                    g.direction *= -1;
                    g.invaders.forEach(inv => inv.y += 20);
                }

                // Random invader shooting
                if (g.invaders.length > 0 && Math.random() < 0.35) {
                    const shooter = g.invaders[Math.floor(Math.random() * g.invaders.length)];
                    g.invaderBullets.push({ x: shooter.x, y: shooter.y + 15 });
                }
            }

            // Move invader bullets
            g.invaderBullets = g.invaderBullets.filter(b => {
                b.y += 5;
                return b.y < 450;
            });

            // Collision: bullets hit invaders
            g.bullets.forEach(b => {
                g.invaders.forEach(inv => {
                    if (Math.abs(b.x - inv.x) < 18 && Math.abs(b.y - inv.y) < 15) {
                        b.y = -100;
                        inv.y = -100;
                        g.score += 10 + (4 - inv.type) * 10;
                        onScoreChange?.(g.score);
                    }
                });
            });
            g.invaders = g.invaders.filter(inv => inv.y > 0);

            // Respawn wave
            if (g.invaders.length === 0) {
                for (let row = 0; row < 5; row++) {
                    for (let col = 0; col < 10; col++) {
                        g.invaders.push({
                            x: 60 + col * 50,
                            y: 50 + row * 40,
                            type: row,
                            id: Date.now() + row * 10 + col
                        });
                    }
                }
            }

            // Draw
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 600, 450);

            // Stars
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            for (let i = 0; i < 40; i++) {
                ctx.fillRect((i * 151) % 600, (i * 97) % 450, 1, 1);
            }

            // Invaders
            g.invaders.forEach(inv => {
                const colors = ['#E57844', '#F4A261', '#fbbf24', '#09B7B4', '#0EEAE5'];
                ctx.fillStyle = colors[inv.type];
                ctx.fillRect(inv.x - 15, inv.y - 10, 30, 20);
                ctx.fillRect(inv.x - 10, inv.y - 15, 20, 5);
                // Eyes
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(inv.x - 8, inv.y - 5, 5, 5);
                ctx.fillRect(inv.x + 3, inv.y - 5, 5, 5);
            });

            // Ship
            ctx.fillStyle = '#0EEAE5';
            ctx.shadowColor = '#0EEAE5';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(g.ship.x, g.ship.y - 20);
            ctx.lineTo(g.ship.x - 20, g.ship.y + 12);
            ctx.lineTo(g.ship.x + 20, g.ship.y + 12);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // Player bullets
            ctx.fillStyle = '#0EEAE5';
            g.bullets.forEach(b => {
                ctx.fillRect(b.x - 2, b.y - 10, 4, 20);
            });

            // Invader bullets
            ctx.fillStyle = '#E57844';
            g.invaderBullets.forEach(b => {
                ctx.fillRect(b.x - 3, b.y - 8, 6, 16);
            });

        }, 1000 / 60);

        return () => clearInterval(gameLoop);
    }, [onScoreChange]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left) * (600 / rect.width);
        gameRef.current.ship.x = Math.max(25, Math.min(575, x));
    };

    const handleMouseDown = () => { gameRef.current.keys.shoot = true; };
    const handleMouseUp = () => { gameRef.current.keys.shoot = false; };

    const handleButtonDown = (action: string) => {
        const g = gameRef.current;
        if (action === 'left') g.keys.left = true;
        else if (action === 'right') g.keys.right = true;
        else if (action === 'shoot') g.keys.shoot = true;
    };

    const handleButtonUp = (action: string) => {
        const g = gameRef.current;
        if (action === 'left') g.keys.left = false;
        else if (action === 'right') g.keys.right = false;
        else if (action === 'shoot') g.keys.shoot = false;
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <canvas
                ref={canvasRef}
                width={600}
                height={450}
                className="rounded-xl border border-orange-500/30 cursor-crosshair w-full max-w-[600px]"
                style={{ aspectRatio: '4/3' }}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* On-screen controls */}
            <div className="flex gap-3">
                <button
                    className="w-16 h-14 rounded-xl bg-slate-700/80 hover:bg-slate-600 active:bg-cyan-600 text-cyan-400 font-bold text-2xl transition-colors select-none touch-none"
                    onMouseDown={() => handleButtonDown('left')}
                    onMouseUp={() => handleButtonUp('left')}
                    onMouseLeave={() => handleButtonUp('left')}
                    onTouchStart={(e) => { e.preventDefault(); handleButtonDown('left'); }}
                    onTouchEnd={() => handleButtonUp('left')}
                >
                    ←
                </button>
                <button
                    className="w-24 h-14 rounded-xl bg-red-600/80 hover:bg-red-500 active:bg-red-400 text-white font-bold text-lg transition-colors select-none touch-none"
                    onMouseDown={() => handleButtonDown('shoot')}
                    onMouseUp={() => handleButtonUp('shoot')}
                    onMouseLeave={() => handleButtonUp('shoot')}
                    onTouchStart={(e) => { e.preventDefault(); handleButtonDown('shoot'); }}
                    onTouchEnd={() => handleButtonUp('shoot')}
                >
                    FIRE
                </button>
                <button
                    className="w-16 h-14 rounded-xl bg-slate-700/80 hover:bg-slate-600 active:bg-cyan-600 text-cyan-400 font-bold text-2xl transition-colors select-none touch-none"
                    onMouseDown={() => handleButtonDown('right')}
                    onMouseUp={() => handleButtonUp('right')}
                    onMouseLeave={() => handleButtonUp('right')}
                    onTouchStart={(e) => { e.preventDefault(); handleButtonDown('right'); }}
                    onTouchEnd={() => handleButtonUp('right')}
                >
                    →
                </button>
            </div>

            <p className="text-slate-500 text-xs text-center">
                Mouse moves ship • Click to shoot
            </p>
        </div>
    );
}

// ==================== MAIN MODAL COMPONENT ====================
export default function OptimizationModal({ isOpen, isComplete, onViewResults }: OptimizationModalProps) {
    const [selectedGame, setSelectedGame] = useState<'asteroids' | 'invaders' | null>(null);
    const [score, setScore] = useState(0);
    const [showComplete, setShowComplete] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const startTimeRef = useRef<number>(Date.now());

    const MIN_WAIT_TIME = 10; // Minimum 10 seconds before showing "complete"

    const statusMessages = [
        "Analyzing prompt structure...",
        "Classifying complexity...",
        "Identifying optimization paths...",
        "Transforming your prompt...",
        "Synthesizing improvements...",
        "Finalizing optimization..."
    ];
    const [messageIndex, setMessageIndex] = useState(0);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedGame(null);
            setScore(0);
            setShowComplete(false);
            setElapsedTime(0);
            setMessageIndex(0);
            startTimeRef.current = Date.now();
        }
    }, [isOpen]);

    // Timer for elapsed time
    useEffect(() => {
        if (isOpen && !showComplete) {
            const interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen, showComplete]);

    // Check if we should show complete
    useEffect(() => {
        if (isComplete && elapsedTime >= MIN_WAIT_TIME && !showComplete) {
            setShowComplete(true);
        }
    }, [isComplete, elapsedTime, showComplete]);

    // Rotate status messages
    useEffect(() => {
        if (isOpen && !showComplete) {
            const interval = setInterval(() => {
                setMessageIndex(i => (i + 1) % statusMessages.length);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isOpen, showComplete, statusMessages.length]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-slate-900/95 rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">

                    {/* Header with DNA Helix */}
                    <div className="flex flex-col items-center mb-6">
                        <DNAHelix />
                        <p className="text-cyan-400 text-sm tracking-widest uppercase animate-pulse mt-3">
                            {showComplete ? '✓ Optimization Complete!' : statusMessages[messageIndex]}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                            {elapsedTime}s elapsed
                            {isComplete && !showComplete && ` • Ready in ${MIN_WAIT_TIME - elapsedTime}s`}
                        </p>
                    </div>

                    {/* Completion overlay */}
                    {showComplete && (
                        <div className="bg-gradient-to-b from-cyan-500/20 to-transparent rounded-xl p-5 mb-6 border border-cyan-500/30">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">Your prompt is ready!</p>
                                    {score > 0 && <p className="text-cyan-300 text-sm">Game Score: {score.toLocaleString()} pts</p>}
                                </div>
                            </div>
                            <button
                                onClick={onViewResults}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                            >
                                View Optimized Prompt →
                            </button>
                            <p className="text-slate-400 text-sm text-center mt-3">or continue playing below...</p>
                        </div>
                    )}

                    {/* Game selection */}
                    {!selectedGame && (
                        <div className="space-y-4">
                            <p className="text-white text-center font-medium text-lg">Play a mini-game while you wait!</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedGame('asteroids')}
                                    className="p-6 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 hover:border-cyan-500 transition-all group"
                                >
                                    <div className="text-5xl mb-3">🚀</div>
                                    <div className="text-white font-bold text-lg">Asteroids</div>
                                    <div className="text-slate-400 text-sm">Shoot & survive</div>
                                </button>
                                <button
                                    onClick={() => setSelectedGame('invaders')}
                                    className="p-6 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 hover:border-orange-500 transition-all group"
                                >
                                    <div className="text-5xl mb-3">👾</div>
                                    <div className="text-white font-bold text-lg">Space Invaders</div>
                                    <div className="text-slate-400 text-sm">Classic arcade</div>
                                </button>
                            </div>
                            <p className="text-slate-500 text-sm text-center">Mouse + on-screen button controls</p>
                        </div>
                    )}

                    {/* Selected game */}
                    {selectedGame && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setSelectedGame(null)}
                                    className="text-slate-400 hover:text-white text-sm transition-colors"
                                >
                                    ← Switch game
                                </button>
                                <div className="text-cyan-400 font-bold text-lg">
                                    SCORE: {score.toLocaleString()}
                                </div>
                            </div>

                            {selectedGame === 'asteroids' && (
                                <AsteroidsGame onScoreChange={setScore} />
                            )}
                            {selectedGame === 'invaders' && (
                                <SpaceInvadersGame onScoreChange={setScore} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
