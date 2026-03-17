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

// Slightly modified so they can float continuously
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
        .hero-bg {  
          background:
            radial-gradient(600px circle at 30% 35%, rgba(168, 85, 247, 0.22), transparent 60%),
            radial-gradient(500px circle at 70% 30%, rgba(59, 130, 246, 0.18), transparent 65%),
            radial-gradient(700px circle at 50% 75%, rgba(147, 51, 234, 0.18), transparent 70%),
            linear-gradient(135deg, #050914 0%, #07142a 35%, #0b1f3a 55%, #090f24 100%);
        }
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
            <div className="absolute inset-0 hero-bg" />
            <div className="absolute inset-0 pointer-events-none vignette" />

            {mounted && activeShapeIndices.map((shapeIndex, orderIndex) => {
                const { Component, baseStyle } = SHAPES_CONFIG[shapeIndex];

                // generate random consistent float animations based on index
                const durationY = 3 + (shapeIndex % 5);
                const delayY = (shapeIndex % 3);

                const shapeStyle: React.CSSProperties = {
                    ...baseStyle,
                    transform: `${baseStyle.transform} scale(${responsiveScale})`,
                };

                return (
                    <motion.div
                        key={shapeIndex}
                        className="shape-container"
                        style={shapeStyle}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        transition={{ delay: orderIndex * 0.05, duration: 0.5 }}
                    >
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{
                                duration: durationY,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: delayY
                            }}
                        >
                            <Component />
                        </motion.div>
                    </motion.div>
                )
            })}
        </div>
    );
}
