import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Applies a 3D tilt effect to the referenced element on mousemove.
 * On mouse leave, smoothly resets to flat.
 *
 * Usage:
 *   const tiltRef = useTilt();
 *   <div ref={tiltRef} className="some-card">...</div>
 *
 * The parent element should have `perspective: 800px` in CSS for the effect.
 */
const useTilt = ({ maxRotation = 8, scale = 1.02 } = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check for touch device
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize mouse position to -1...1 from center
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);

      // rotateY corresponds to horizontal movement, rotateX to vertical (inverted)
      const rotateY = percentX * maxRotation;
      const rotateX = -percentY * maxRotation;

      gsap.to(el, {
        rotateX,
        rotateY,
        scale,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [maxRotation, scale]);

  return ref;
};

export default useTilt;
