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
import NUMERANO from "./components/NUMERANO";

type ShapeItem = {
  Component: () => React.JSX.Element;
  style: React.CSSProperties;
};

export default function HeroSection() {
  const shapes: ShapeItem[] = [
    { Component: ShapeCube, style: { left: "8%", top: "12%", transform: "rotate(18deg) scale(0.8)" } },
    { Component: ShapeCylinder, style: { left: "25%", top: "8%", transform: "rotate(-22deg) scale(0.7)" } },
    { Component: ShapeParaboloid, style: { left: "52%", top: "10%", transform: "rotate(-30deg) scale(0.75)" } },
    { Component: ShapeDonut, style: { left: "75%", top: "14%", transform: "rotate(15deg) scale(0.8)" } },

    { Component: ShapeHyperboloid, style: { left: "12%", top: "32%", transform: "rotate(28deg) scale(0.9)" } },
    { Component: ShapeSphere, style: { left: "35%", top: "28%", transform: "rotate(-20deg) scale(0.75)" } },
    { Component: ShapeOctahedron, style: { left: "65%", top: "30%", transform: "rotate(35deg) scale(0.8)" } },
    { Component: ShapeCone, style: { left: "85%", top: "34%", transform: "rotate(-25deg) scale(0.7)" } },

    { Component: ShapeTetrahedron, style: { left: "14%", top: "55%", transform: "rotate(-35deg) scale(0.85)" } },
    { Component: ShapeIcosahedron, style: { left: "42%", top: "58%", transform: "rotate(18deg) scale(0.75)" } },
    { Component: ShapeCube, style: { left: "75%", top: "56%", transform: "rotate(-12deg) scale(0.8)" } },

    { Component: ShapeEllipse2D, style: { left: "3%", top: "80%", transform: "rotate(30deg) scale(0.8)" } },
    { Component: ShapeEllipse2D, style: { left: "28%", top: "68%", transform: "rotate(-15deg) scale(0.75)" } },
    { Component: ShapeParabola2D, style: { left: "50%", top: "72%", transform: "rotate(20deg) scale(0.8)" } },
    { Component: ShapeParabola2D, style: { left: "80%", top: "68%", transform: "rotate(-22deg) scale(0.75)" } },

    { Component: ShapeHyperbola2D, style: { left: "88%", top: "50%", transform: "rotate(25deg) scale(0.8)" } },

    { Component: ShapeHyperbola2D, style: { left: "2%", top: "40%", transform: "rotate(-30deg) scale(0.75)" } },
    { Component: ShapeHelicoid, style: { left: "1%", top: "60%", transform: "rotate(30deg) scale(0.8)" } },

    { Component: ShapeCylinder, style: { left: "14%", top: "79%", transform: "rotate(22deg) scale(0.75)" } },
    { Component: ShapeDonut, style: { left: "32%", top: "78%", transform: "rotate(-28deg) scale(0.8)" } },
    { Component: ShapeSphere, style: { left: "60%", top: "80%", transform: "rotate(30deg) scale(0.75)" } },
    { Component: ShapeCone, style: { left: "85%", top: "82%", transform: "rotate(18deg) scale(0.7)" } },
  ];

  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center pointer-events-none">

      <div className="relative z-30 h-full flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <motion.div
          className="pointer-events-auto relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-[2px] h-[2px] bg-cyan-300/40 rounded-full"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animation: `float ${particle.duration}s ease-in-out infinite`,
                  animationDelay: `${particle.delay}s`,
                }}
              />
            ))}
          </div>

          <div className="pointer-events-auto">
            <NUMERANO />
          </div>

          <motion.div
            className="relative mb-12 max-w-[700px] mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="mx-auto text-gray-200 text-[1.2rem] md:text-[1.4rem] font-light leading-relaxed text-center">
              By{" "}
              <span className="relative inline-block">
                <span className="text-cyan-300 font-semibold bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-3 py-1 rounded-lg border border-cyan-500/30">
                  Department of Mathematics
                </span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              </span>
              {" "}of Dayananda Sagar College of Engineering
            </p>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400 flex-wrap">
              {HERO_FEATURES.map((feature, idx) => (
                <div key={feature.label} className="flex items-center gap-2">
                  {idx > 0 && <div className="w-1 h-1 bg-gray-600 rounded-full hidden sm:block" />}
                  <div className={`w-2 h-2 bg-${feature.color}-500 rounded-full animate-pulse`} />
                  <span>{feature.label}</span>
                </div>
              </div>

            </div>
        </div>
    </section>
  );
}
