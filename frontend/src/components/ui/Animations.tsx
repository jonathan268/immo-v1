'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export function useInView(threshold = 0.15, triggerOnce = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.unobserve(el);
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return { ref, inView };
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  from?: 'up' | 'left' | 'right' | 'scale';
}

export function Reveal({ children, className = '', delay = 0, threshold = 0.15, from = 'up' }: RevealProps) {
  const { ref, inView } = useInView(threshold);

  const animations: Record<string, string> = {
    up: 'translate-y-10',
    left: '-translate-x-10',
    right: 'translate-x-10',
    scale: 'scale-95',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${animations[from]} ${inView ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : 'opacity-0'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface StaggerProps {
  children: ReactNode[];
  className?: string;
  baseDelay?: number;
  stepDelay?: number;
  from?: 'up' | 'left' | 'right' | 'scale';
  threshold?: number;
}

export function Stagger({ children, className = '', baseDelay = 100, stepDelay = 100, from = 'up', threshold = 0.1 }: StaggerProps) {
  const { ref, inView } = useInView(threshold);

  const animations: Record<string, string> = {
    up: 'translate-y-10',
    left: '-translate-x-10',
    right: 'translate-x-10',
    scale: 'scale-95',
  };

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className={`transition-all duration-700 ease-out ${animations[from]} ${inView ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : 'opacity-0'}`}
          style={{ transitionDelay: `${baseDelay + i * stepDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
  inView: boolean;
}

export function CountUp({ end, suffix = '', duration = 2000, className = '', inView }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) { setCount(0); return; }

    let start = 0;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span className={className}>
      {count.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}
