import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

export default function BlurText({
  text = "",
  delay = 50,
  className = "",
  animateBy = "words", // 'words' or 'letters'
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  onAnimationComplete,
}) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold, margin: rootMargin });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const defaultFrom =
    direction === "top"
      ? { filter: "blur(10px)", opacity: 0, transform: "translate3d(0,-20px,0)" }
      : { filter: "blur(10px)", opacity: 0, transform: "translate3d(0,20px,0)" };

  const defaultTo = {
    filter: "blur(0px)",
    opacity: 1,
    transform: "translate3d(0,0,0)",
  };

  return (
    <p ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {elements.map((element, i) => (
        <motion.span
          key={i}
          initial={defaultFrom}
          animate={inView ? defaultTo : defaultFrom}
          transition={{
            duration: 0.5,
            delay: (i * delay) / 1000,
            ease: [0.25, 0.1, 0.25, 1.0],
          }}
          onAnimationComplete={i === elements.length - 1 ? onAnimationComplete : undefined}
          className="inline-block"
        >
          {element}
          {animateBy === "words" && i < elements.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </p>
  );
}
