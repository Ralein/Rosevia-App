"use client";

import React, { useRef, useState, useEffect } from "react";

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt rotation in degrees
  scale?: number;    // Hover scale factor
}

export default function Interactive3DCard({
  children,
  className = "",
  maxTilt = 8,
  scale = 1.03
}: Interactive3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile/touch devices to disable tilt effects for performance and usability
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || 
        navigator.maxTouchPoints > 0 || 
        'ontouchstart' in window
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;

    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    
    // Mouse coordinates relative to target element bounding box
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized position from -0.5 to 0.5
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;
    
    // Calculate rotation angles (invert Y axis for correct visual rotation)
    const rotateX = -normalizedY * maxTilt;
    const rotateY = normalizedX * maxTilt;
    
    // Glow position coordinates (0% to 100%)
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;

    setCoords({ rotateX, rotateY, glowX, glowY });
  };

  const handleMouseEnter = () => {
    if (isMobile) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  };

  // Build the 3D transform style
  const cardStyle: React.CSSProperties = isMobile
    ? {}
    : {
        transform: isHovered
          ? `perspective(1000px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: isHovered ? "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
        transformStyle: "preserve-3d",
      };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
      className={`relative overflow-hidden group ${className}`}
    >
      {/* 3D Glassmorphic Glow Highlight Overlay */}
      {!isMobile && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 opacity-60 mix-blend-screen"
          style={{
            background: `radial-gradient(circle 180px at ${coords.glowX}% ${coords.glowY}%, rgba(212, 175, 55, 0.15), transparent 80%)`,
          }}
        />
      )}
      
      {/* Inner Content (Can be styled to float slightly above background via translateZ) */}
      <div 
        style={{ 
          transform: isHovered && !isMobile ? "translateZ(15px)" : "translateZ(0px)",
          transition: "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
        }}
        className="h-full w-full"
      >
        {children}
      </div>
    </div>
  );
}
