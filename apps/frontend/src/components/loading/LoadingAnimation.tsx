"use client";

import { useEffect, useState, useRef } from 'react';
import { Icons } from '../icons/icons';

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ message = 'Loading...' }) => {
  // Animation canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  
  // Animation state
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Set up particle animation
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const createParticles = () => {
      particlesRef.current = [];
      const numParticles = 100;
      
      for (let i = 0; i < numParticles; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          color: `rgba(${30 + Math.random() * 40}, ${100 + Math.random() * 50}, ${180 + Math.random() * 75}, ${0.5 + Math.random() * 0.5})`,
        });
      }
    };

    createParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particlesRef.current.forEach((particle, i) => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Update particle position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // If particle goes off screen, bring it back from the other side
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
        
        // Connect particles with lines if they're close
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[j].x - particle.x;
          const dy = particlesRef.current[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(68, 138, 255, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      });
      
      // Continue animation
      frameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();
    
    // Database icon rotation loop
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 10) % 360);
    }, 50);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      clearInterval(rotationInterval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#121212] z-50">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div 
          className="text-blue-500 mb-4 transform transition-transform duration-300"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <Icons.FiDatabase size={64} />
        </div>
        
        <div className="animate-pulse">
          <div className="h-2 w-24 bg-blue-500 rounded-full mb-3"></div>
          <div className="h-2 w-20 bg-blue-500 rounded-full opacity-75 mb-3"></div>
          <div className="h-2 w-16 bg-blue-500 rounded-full opacity-50"></div>
        </div>
        
        <p className="text-white font-medium mt-6">{message}</p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
