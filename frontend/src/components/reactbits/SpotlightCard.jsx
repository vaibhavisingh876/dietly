import React, { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(79, 115, 69, 0.14)", // subtle forest green accent
  borderColor = "rgba(79, 115, 69, 0.35)",
  size = 350,
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    if (prefersReducedMotion) return;
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 transition-all duration-300 hover:shadow-lg ${className}`}
    >
      {/* Background Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
        aria-hidden="true"
      />
      {/* Border Glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity,
          boxShadow: `inset 0 0 0 1px ${borderColor}`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
