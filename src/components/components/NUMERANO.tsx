import { useEffect, useState, useRef } from "react";

type ImageTypewriterProps = {
  text: string;
  letterPath?: string;
};

const ImageTypewriter = ({
  text,
  letterPath = "/letters",
}: ImageTypewriterProps) => {
  const [index, setIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const letters = text.split("");
    let currentIndex = 0;
    
    const revealNextLetter = () => {
      if (currentIndex < letters.length) {
        setIndex(currentIndex + 1);
        currentIndex++;
        
        const delay = 180 + Math.sin(currentIndex / letters.length * Math.PI) * 80;
        setTimeout(revealNextLetter, delay);
      }
    };
    
    setTimeout(revealNextLetter, 400);
    
    return () => {
      currentIndex = letters.length;
    };
  }, [text]);

  useEffect(() => {
    const letters = containerRef.current?.children;
    if (!letters) return;

    const animate = () => {
      const time = Date.now() * 0.001;
      
      Array.from(letters).forEach((letter, i) => {
        if (i < index) {
          const letterEl = letter.firstChild as HTMLElement;
          if (letterEl) {
            const breathScale = 1 + Math.sin(time * 1.5 + i * 0.3) * 0.02;
            const glowOpacity = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.15;
            
            letterEl.style.transform = `scale(${breathScale})`;
            letterEl.style.filter = `drop-shadow(0 6px 14px rgba(0,0,0,0.45)) 
                                     drop-shadow(0 0 20px rgba(59, 130, 246, ${glowOpacity}))`;
          }
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [index]);

  return (
    <div ref={containerRef} className="flex items-center justify-center">
      {text.split("").map((char, i) => (
        <div
          key={i}
          className={`relative transition-all duration-500 ease-out ${i === 0 ? '' : 'letter-spacing'}`}
          style={{
            opacity: i < index ? 1 : 0,
            transform: i < index 
              ? `translateY(${Math.sin(i * 0.3) * 2}px)` 
              : "translateY(20px)",
            transitionDelay: `${i * 60}ms`,
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <img
            src={`${letterPath}/${char.toLowerCase()}.png`}
            alt={char}
            draggable={false}
            className="h-[4rem] md:h-[10rem] object-contain select-none 
                       transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
            style={{
              zIndex: 20,
              transform: hoveredIndex === i ? "scale(1.05) translateY(-5px)" : "scale(1)",
              filter: hoveredIndex === i 
                ? "drop-shadow(0 8px 20px rgba(0,0,0,0.6)) drop-shadow(0 0 30px rgba(59, 130, 246, 0.7))"
                : "drop-shadow(0 6px 14px rgba(0,0,0,0.45))",
              transformOrigin: "center bottom",
            }}
          />
          
          {hoveredIndex === i && (
            <div className="absolute inset-0 -z-10">
              {[...Array(3)].map((_, ring) => (
                <div
                  key={ring}
                  className="absolute inset-0 rounded-full border border-cyan-400/30"
                  style={{
                    animation: `ripple 1.5s ease-out ${ring * 0.3}s infinite`,
                    transform: "scale(0.8)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
      
      <style>{`
        .letter-spacing {
          margin-left: -1.7rem;
        }
        @media (min-width: 768px) {
          .letter-spacing {
            margin-left: -4.8rem;
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};


export default function NUMERANO() {
  const sigmaRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (sigmaRef.current) {
      const sigma = sigmaRef.current;
      let animationId: number;
      
      const animate = () => {
        const time = Date.now() * 0.001;
        const pulse = 0.7 + Math.sin(time * 0.8) * 0.15;
        
        sigma.style.opacity = pulse.toString();
        animationId = requestAnimationFrame(animate);
      };
      
      animate();
      return () => cancelAnimationFrame(animationId);
    }
  }, []);

  return (
    <div className="relative mb-16 flex justify-center pointer-events-none">
      <div className="relative px-14 py-12">

        <div className="absolute left-1/2 -top-8 md:-top-3 w-10 md:w-14 -translate-x-1/2 z-10">
          <img
            src="/infinity.png"
            alt="infinity"
            className="opacity-90 animate-float"
            style={{
              animation: "float 6s ease-in-out infinite",
            }}
          />
        </div>

        <img
          ref={sigmaRef}
          src="/sigma.png"
          alt="Sigma"
          className="absolute left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            w-[14rem] md:w-[20rem]
            z-0
            drop-shadow-[0_0_40px_rgba(59,130,246,0.45)]
            transition-opacity duration-2000 ease-in-out"
        />

        <div className="relative z-20 flex justify-center py-8 md:py-16 pointer-events-auto">
          <ImageTypewriter text="NUMERANO" />
        </div>

        <div className="absolute left-1/2 top-full -mt-4 -translate-x-1/2 z-20">
          <span className="text-[0.7rem] md:text-sm tracking-[0.3em] font-semibold text-yellow-300 animate-pulse-slow">
            SINCE 2014
          </span>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="w-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          {/* <span className="w-2 h-2 rounded-full bg-cyan-400/70 animate-ping-slow" /> */}
          <span className="w-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        </div>

        <div className="absolute left-1/2 top-full mt-5 -translate-x-1/2 text-cyan-300/80  text-sm md:text-base font-mono flex justify-center gap-2">
          <span>Innovate</span>
          <span className="text-white/60">|</span>
          <span className="text-white">Explore</span>
          <span className="text-white/60">|</span>
          <span>Create</span>
          <span className="text-white/60">|</span>
          <span className="text-white">Integrate</span>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
