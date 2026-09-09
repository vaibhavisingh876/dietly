import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedContent({
  children,
  distance = 25,
  direction = "vertical", // 'vertical' | 'horizontal'
  reverse = false,
  delay = 0,
  duration = 0.5,
  className = "",
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const axis = direction === "vertical" ? "y" : "x";
  const offset = reverse ? -distance : distance;

  return (
    <motion.div
      initial={{
        opacity: 0,
        [axis]: offset,
      }}
      whileInView={{
        opacity: 1,
        [axis]: 0,
      }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
