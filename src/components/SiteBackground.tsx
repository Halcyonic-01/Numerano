import { motion } from 'framer-motion';
import ShapeSphere from "./components/shapeSphere";
import ShapeCone from "./components/shapeCone";
import ShapeCube from "./components/shapeCube";
import ShapeCylinder from "./components/shapeCylinder";
import ShapeDonut from "./components/shapeDonut";
import ShapeHyperboloid from "./components/shapeHyperboloid";
import ShapeIcosahedron from "./components/shapeIcosahedron";
import ShapeOctahedron from "./components/shapeOctahedron";
import ShapeParaboloid from "./components/shapeParaboloid";
import ShapeTetrahedron from "./components/shapeTetrahedron";
import ShapeHelicoid from "./components/shapeHelicoid";
import ShapeParabola2D from "./components/shapeParabola2D";
import ShapeHyperbola2D from "./components/shapeHyperbola2D";
import ShapeEllipse2D from "./components/shapeEllipse2D";
import { useEffect, useState } from 'react';

type ShapeItem = {
    Component: () => React.JSX.Element;
    baseStyle: React.CSSProperties;
};

const SHAPES_CONFIG: ShapeItem[] = [
    { Component: ShapeCube, baseStyle: { left: "8%", top: "12%", transform: "rotate(18deg) scale(0.8)" } },
    { Component: ShapeCylinder, baseStyle: { left: "25%", top: "8%", transform: "rotate(-22deg) scale(0.7)" } },
    { Component: ShapeParaboloid, baseStyle: { left: "52%", top: "10%", transform: "rotate(-30deg) scale(0.75)" } },
    { Component: ShapeDonut, baseStyle: { left: "75%", top: "14%", transform: "rotate(15deg) scale(0.8)" } },
    { Component: ShapeHyperboloid, baseStyle: { left: "12%", top: "32%", transform: "rotate(28deg) scale(0.9)" } },
    { Component: ShapeSphere, baseStyle: { left: "35%", top: "28%", transform: "rotate(-20deg) scale(0.75)" } },
    { Component: ShapeOctahedron, baseStyle: { left: "65%", top: "30%", transform: "rotate(35deg) scale(0.8)" } },
    { Component: ShapeCone, baseStyle: { left: "85%", top: "34%", transform: "rotate(-25deg) scale(0.7)" } },
    { Component: ShapeTetrahedron, baseStyle: { left: "14%", top: "55%", transform: "rotate(-35deg) scale(0.85)" } },
    { Component: ShapeIcosahedron, baseStyle: { left: "42%", top: "58%", transform: "rotate(18deg) scale(0.75)" } },
    { Component: ShapeCube, baseStyle: { left: "75%", top: "56%", transform: "rotate(-12deg) scale(0.8)" } },
    { Component: ShapeEllipse2D, baseStyle: { left: "3%", top: "80%", transform: "rotate(30deg) scale(0.8)" } },
    { Component: ShapeEllipse2D, baseStyle: { left: "28%", top: "68%", transform: "rotate(-15deg) scale(0.75)" } },
    { Component: ShapeParabola2D, baseStyle: { left: "50%", top: "72%", transform: "rotate(20deg) scale(0.8)" } },
    { Component: ShapeParabola2D, baseStyle: { left: "80%", top: "68%", transform: "rotate(-22deg) scale(0.75)" } },
    { Component: ShapeHyperbola2D, baseStyle: { left: "88%", top: "50%", transform: "rotate(25deg) scale(0.8)" } },
    { Component: ShapeHyperbola2D, baseStyle: { left: "2%", top: "40%", transform: "rotate(-30deg) scale(0.75)" } },
    { Component: ShapeHelicoid, baseStyle: { left: "1%", top: "60%", transform: "rotate(30deg) scale(0.8)" } },
    { Component: ShapeCylinder, baseStyle: { left: "14%", top: "79%", transform: "rotate(22deg) scale(0.75)" } },
    { Component: ShapeDonut, baseStyle: { left: "32%", top: "78%", transform: "rotate(-28deg) scale(0.8)" } },
    { Component: ShapeSphere, baseStyle: { left: "60%", top: "80%", transform: "rotate(30deg) scale(0.75)" } },
    { Component: ShapeCone, baseStyle: { left: "85%", top: "82%", transform: "rotate(18deg) scale(0.7)" } },
];

const MOBILE_SHAPE_INDICES = [0, 3, 5, 7, 9, 12, 14, 16, 20] as const;
const TABLET_SHAPE_INDICES = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 16, 18, 20] as const;

const EQUATION_PARTICLES = [
    '∇·E = ρ/ε₀',
    'F = ma',
    'PV = nRT',
    'HΨ = EΨ',
    'x = [-b ± √(b²-4ac)]/2a',
    'sin²θ + cos²θ = 1',
    '∫e^x dx = e^x + C',
    '∇×E = -∂B/∂t',
    'A = πr²',
    'V = (4/3)πr³',
    'E = hf',
    'z = x + iy',
    'det(A - λI) = 0',
    'f(x) = ∑a_n xⁿ',
    '∂u/∂t = α∇²u',
];

const PARTICLE_STYLES: React.CSSProperties[] = Array.from({ length: 15 }).map((_, i) => ({
    left: `${(i * 37 + 11) % 100}%`,
    animationDelay: `${i * 1.5}s`,
    animationDuration: `${15 + ((i * 7) % 15)}s`,
    fontSize: `${12 + (i % 4) * 2}px`,
    color: `rgba(${
        i % 3 === 0 ? '59,130,246' :
        i % 3 === 1 ? '168,85,247' : '34,211,238'
    }, ${0.1 + (i % 3) * 0.05})`,
}));

export default function SiteBackground() {
    const [mounted, setMounted] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth : 1280
    );

    useEffect(() => {
        setMounted(true);

        const handleResize = () => setViewportWidth(window.innerWidth);
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = viewportWidth < 640;
    const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
    const responsiveScale = isMobile ? 0.62 : isTablet ? 0.8 : 1;

    const activeShapeIndices = isMobile
        ? MOBILE_SHAPE_INDICES
        : isTablet
            ? TABLET_SHAPE_INDICES
            : SHAPES_CONFIG.map((_, index) => index);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <style>{`
        /* ── Mathematical background – exact match from HeroSection ── */
        .math-bg {
          background-color: #0a0e1a;
          background-image:
            url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='150' y='150' font-size='20' font-family='Cambria Math, serif' fill='rgba(59,130,246,0.15)' text-anchor='middle'%3EE = mc²%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='350' height='350' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='175' y='175' font-size='22' font-family='Cambria Math, serif' fill='rgba(168,85,247,0.12)' text-anchor='middle'%3Ee^{iπ} + 1 = 0%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='280' height='280' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='140' y='140' font-size='18' font-family='Cambria Math, serif' fill='rgba(34,211,238,0.1)' text-anchor='middle'%3Eφ = (1+√5)/2%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='380' height='380' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='190' y='190' font-size='16' font-family='monospace' fill='rgba(245,158,11,0.08)' text-anchor='middle'%3E∫_a^b f'(x) dx = f(b)-f(a)%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='320' height='320' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='160' y='160' font-size='14' font-family='monospace' fill='rgba(16,185,129,0.09)' text-anchor='middle'%3Ef'(x)=lim_{h→0} (f(x+h)-f(x))/h%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='260' height='260' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='130' y='130' font-size='24' font-family='Cambria Math, serif' fill='rgba(239,68,68,0.08)' text-anchor='middle'%3Ea² + b² = c²%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='340' height='340' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='170' y='170' font-size='16' font-family='monospace' fill='rgba(139,92,246,0.07)' text-anchor='middle'%3E∇²φ = 1/c² ∂²φ/∂t²%3C/text%3E%3C/svg%3E"),
            radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.08) 0%, transparent 70%),
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size:
            300px 300px,
            350px 350px,
            280px 280px,
            380px 380px,
            320px 320px,
            260px 260px,
            340px 340px,
            100% 100%,
            100% 100%,
            100% 100%,
            40px 40px,
            40px 40px;
          background-position:
            10% 15%,
            85% 30%,
            25% 65%,
            70% 80%,
            40% 40%,
            15% 85%,
            75% 60%,
            0 0,
            0 0,
            0 0,
            0 0,
            0 0;
        }

        .math-symbols-overlay {
          position: absolute;
          inset: 0;
          background-image:
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='50' font-size='40' font-family='Cambria Math' fill='rgba(59,130,246,0.03)' text-anchor='middle'%3E∑%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='50' font-size='36' font-family='Cambria Math' fill='rgba(168,85,247,0.03)' text-anchor='middle'%3E∫%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='50' font-size='32' font-family='Cambria Math' fill='rgba(34,211,238,0.03)' text-anchor='middle'%3Eπ%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='50' font-size='38' font-family='Cambria Math' fill='rgba(245,158,11,0.03)' text-anchor='middle'%3E∞%3C/text%3E%3C/svg%3E");
          background-size: 200px 200px, 180px 180px, 160px 160px, 190px 190px;
          background-position: 20% 25%, 75% 40%, 35% 70%, 80% 75%;
          opacity: 0.3;
          pointer-events: none;
          z-index: 1;
        }

        .equation-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 2;
        }

        .equation-particle {
          position: absolute;
          font-family: 'Cambria Math', serif;
          font-size: 14px;
          color: rgba(59, 130, 246, 0.2);
          white-space: nowrap;
          animation: float-equation 20s linear infinite;
          pointer-events: none;
        }

        @keyframes float-equation {
          0%   { transform: translateY(100vh) rotate(0deg);   opacity: 0; }
          10%  { opacity: 0.3; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }

        /* ── Shape styles ── */
        .vignette {
          background: radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%);
        }
        .shape-container {
          position: absolute;
          transform-origin: center;
          opacity: 0.6;
          pointer-events: auto;
          transition: opacity 0.3s, filter 0.3s;
        }
        .shape-container:hover {
          opacity: 1;
          filter: drop-shadow(0 0 15px rgba(0, 220, 255, 0.8));
          z-index: 50;
        }
      `}</style>

            {/* Layer 0 – math-bg (exact from HeroSection) */}
            <div className="absolute inset-0 math-bg" style={{ zIndex: 0 }} />

            {/* Layer 1 – math symbols overlay */}
            <div className="math-symbols-overlay" style={{ zIndex: 1 }} />

            {/* Layer 2 – floating equation particles */}
            <div className="equation-particles" style={{ zIndex: 2 }}>
                {EQUATION_PARTICLES.map((eq, i) => (
                    <div
                        key={i}
                        className="equation-particle"
                        style={PARTICLE_STYLES[i]}
                    >
                        {eq}
                    </div>
                ))}
            </div>

            {/* Layer 3 – vignette */}
            <div className="absolute inset-0 pointer-events-none vignette" style={{ zIndex: 3 }} />

            {/* Layer 4 – floating 3-D shapes */}
            {mounted && activeShapeIndices.map((shapeIndex, orderIndex) => {
                const { Component, baseStyle } = SHAPES_CONFIG[shapeIndex];

                const durationY = 3 + (shapeIndex % 5);
                const delayY = shapeIndex % 3;

                const shapeStyle: React.CSSProperties = {
                    ...baseStyle,
                    transform: `${baseStyle.transform} scale(${responsiveScale})`,
                    zIndex: 4,
                };

                return (
                    <motion.div
                        key={shapeIndex}
                        className="shape-container"
                        style={shapeStyle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: orderIndex * 0.05, duration: 0.5 }}
                    >
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{
                                duration: durationY,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: delayY,
                            }}
                        >
                            <Component />
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>
    );
}