'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Node {
    id: string;
    label: string;
    type: 'post' | 'tag' | 'category';
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    slug?: string; // For posts
}

interface Link {
    source: string;
    target: string;
}

interface GalaxyData {
    nodes: Node[];
    links: Link[];
}

export default function GalaxyView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [data, setData] = useState<GalaxyData | null>(null);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const requestRef = useRef<number | null>(null);

    // Interaction state
    const [isDragging, setIsDragging] = useState(false);
    const [draggedNode, setDraggedNode] = useState<Node | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 }); // Pan offset
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Fetch data
        fetch('/api/galaxy')
            .then(res => res.json())
            .then(setData);
    }, []);

    useEffect(() => {
        if (!data || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas to match display size for sharpness
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Initialize positions if not set (simple random spread)
        if (data.nodes.length > 0 && data.nodes[0].x === 0) {
            data.nodes.forEach(node => {
                node.x = (Math.random() - 0.5) * width * 0.5;
                node.y = (Math.random() - 0.5) * height * 0.5;
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw background stars (static for now, could be animated)
            // ...

            ctx.save();
            ctx.translate(centerX + offset.x, centerY + offset.y);

            // Physics Loop (Force Directed)
            // 1. Repulsion (Coulomb's Law)
            for (let i = 0; i < data.nodes.length; i++) {
                for (let j = i + 1; j < data.nodes.length; j++) {
                    const n1 = data.nodes[i];
                    const n2 = data.nodes[j];
                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const distSq = dx * dx + dy * dy || 1;
                    const force = 5000 / distSq; // Repulsion strength
                    const fx = (dx / Math.sqrt(distSq)) * force;
                    const fy = (dy / Math.sqrt(distSq)) * force;

                    if (n1 !== draggedNode) {
                        n1.vx += fx;
                        n1.vy += fy;
                    }
                    if (n2 !== draggedNode) {
                        n2.vx -= fx;
                        n2.vy -= fy;
                    }
                }
            }

            // 2. Attraction (Springs) for Links
            data.links.forEach(link => {
                const source = data.nodes.find(n => n.id === link.source);
                const target = data.nodes.find(n => n.id === link.target);
                if (source && target) {
                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const force = (dist - 100) * 0.005; // Spring constant
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    if (source !== draggedNode) {
                        source.vx += fx;
                        source.vy += fy;
                    }
                    if (target !== draggedNode) {
                        target.vx -= fx;
                        target.vy -= fy;
                    }

                    // Draw Link
                    ctx.beginPath();
                    ctx.moveTo(source.x, source.y);
                    ctx.lineTo(target.x, target.y);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            // 3. Center Gravity (keep everything in view)
            data.nodes.forEach(node => {
                const dist = Math.sqrt(node.x * node.x + node.y * node.y);
                const force = dist * 0.0001;
                if (node !== draggedNode) {
                    node.vx -= (node.x / dist) * force;
                    node.vy -= (node.y / dist) * force;
                }

                // Apply Velocity
                if (node !== draggedNode) {
                    node.x += node.vx;
                    node.y += node.vy;
                    node.vx *= 0.9; // Friction
                    node.vy *= 0.9;
                }

                // Draw Node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

                // Glow effect
                const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 2);
                gradient.addColorStop(0, node.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();

                // Label
                if (node === hoveredNode || node.radius > 6) {
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px Arial';
                    ctx.fillText(node.label, node.x + 12, node.y + 4);
                }
            });

            ctx.restore();
            requestRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [data, hoveredNode, draggedNode, offset]);

    const getMousePos = (e: React.MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        const centerX = width / 2;
        const centerY = height / 2;
        return {
            x: e.clientX - rect.left - centerX - offset.x,
            y: e.clientY - rect.top - centerY - offset.y
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { x, y } = getMousePos(e);
        const found = data?.nodes.find(node => {
            const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
            return dist < node.radius + 10;
        });

        if (found) {
            setDraggedNode(found);
            setIsDragging(true);
        } else {
            setIsDragging(true); // Dragging background (pan)
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            if (draggedNode) {
                const { x, y } = getMousePos(e);
                draggedNode.x = x;
                draggedNode.y = y;
                draggedNode.vx = 0;
                draggedNode.vy = 0;
            } else {
                // Panning
                const dx = e.clientX - lastMousePos.x;
                const dy = e.clientY - lastMousePos.y;
                setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
                setLastMousePos({ x: e.clientX, y: e.clientY });
            }
        } else {
            // Hover check
            const { x, y } = getMousePos(e);
            const found = data?.nodes.find(node => {
                const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
                return dist < node.radius + 10;
            });
            setHoveredNode(found || null);
            if (canvasRef.current) {
                canvasRef.current.style.cursor = found ? 'pointer' : isDragging ? 'grabbing' : 'grab';
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDraggedNode(null);
    };

    const handleClick = () => {
        if (hoveredNode && !isDragging && hoveredNode.type === 'post' && hoveredNode.slug) {
            window.location.href = `/blog/${hoveredNode.slug}`;
        }
    };

    return (
        <div className="glass" style={{ width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', cursor: 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
            />
            <div style={{ position: 'absolute', top: 20, left: 20, color: '#fff', pointerEvents: 'none' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>知识星系</h2>
                <p style={{ color: '#ccc', textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>
                    拖动节点以重排，拖动背景以平移
                </p>
            </div>
        </div>
    );
}
