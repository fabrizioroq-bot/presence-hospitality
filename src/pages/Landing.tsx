import { Suspense, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import Scene3D from '../components/Scene3D';
import Loader from '../components/Loader';
import StepOverlay from '../components/StepOverlay';
import FallbackStatic from '../components/FallbackStatic';
import { detectWebGL } from '../lib/detectWebGL';
import { useScrollProgress } from '../store/scrollProgress';

// Number of viewport-heights of scroll the walkthrough spans.
const SCROLL_LENGTH_VH = 500;
const MOBILE_BREAKPOINT = 768;

function shouldUseFallback() {
  if (typeof window === 'undefined') return true;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  return prefersReducedMotion || isMobile || !detectWebGL();
}

export default function Landing() {
  const [useFallback] = useState(shouldUseFallback);
  const setProgress = useScrollProgress((s) => s.setProgress);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (useFallback) return;

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    lenis.on('scroll', ({ progress }: { progress: number }) => {
      setProgress(progress);
    });

    function raf(time: number) {
      lenis.raf(time);
      rafId.current = requestAnimationFrame(raf);
    }
    rafId.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId.current);
      lenis.destroy();
    };
  }, [useFallback, setProgress]);

  if (useFallback) return <FallbackStatic />;

  return (
    <div className="relative w-full bg-ink">
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<Loader />}>
          <Scene3D />
        </Suspense>
      </div>

      <StepOverlay />

      {/* Scroll spacer — its height defines the total scrollable distance
          that maps to 0..1 walkthrough progress. */}
      <div style={{ height: `${SCROLL_LENGTH_VH}vh` }} aria-hidden />
    </div>
  );
}
