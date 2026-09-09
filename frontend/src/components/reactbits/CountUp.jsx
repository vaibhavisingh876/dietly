import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 1.5,
  className = "",
  startWhen = true,
  separator = ",",
  decimals = 0,
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);
  const prefersReducedMotion = useReducedMotion();

  const damping = 20 + 40 * (1 / (duration || 1));
  const stiffness = 100 * (1 / (duration || 1));

  const springValue = useSpring(motionValue, {
    damping,
    stiffness,
  });

  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (prefersReducedMotion) {
      if (ref.current) {
        ref.current.textContent = Number(to).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }
      return;
    }

    if (isInView && startWhen) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? from : to);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, startWhen, motionValue, direction, from, to, delay, prefersReducedMotion, decimals]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        const formatted = Number(latest).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        ref.current.textContent = separator ? formatted : formatted.replace(/,/g, "");
      }
    });

    return () => unsubscribe();
  }, [springValue, separator, decimals, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {Number(from).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
