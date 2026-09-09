import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function FadeContent({
  children,
  blur = true,
  duration = 0.6,
  delay = 0,
  easing = [0.25, 0.1, 0.25, 1.0],
  threshold = 0.1,
  initialOpacity = 0,
  yOffset = 20,
  className = "",
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{
        opacity: initialOpacity,
        y: yOffset,
        filter: blur ? "blur(6px)" : "none",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: easing,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
