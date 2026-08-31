import React, { useRef, useState, useEffect } from "react";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = "",
  delayMs = 0,
  direction = "up",
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return "translate-x-0 translate-y-0 opacity-100 filter-none";
    switch (direction) {
      case "up":
        return "translate-y-10 opacity-0 filter blur-[4px]";
      case "down":
        return "-translate-y-10 opacity-0 filter blur-[4px]";
      case "left":
        return "-translate-x-10 opacity-0 filter blur-[4px]";
      case "right":
        return "translate-x-10 opacity-0 filter blur-[4px]";
      default:
        return "opacity-0 filter blur-[4px]";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delayMs}ms`,
      }}
      className={`transition-all duration-700 ease-out transform ${getTransform()} ${className}`}
    >
      {children}
    </div>
  );
};
export default RevealOnScroll;
