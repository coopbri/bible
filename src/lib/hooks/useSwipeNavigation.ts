import { useCallback, useEffect, useRef, useState } from "react";

import type { CSSProperties, RefObject } from "react";

interface UseSwipeNavigationOptions {
  containerRef: RefObject<HTMLElement | null>;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface UseSwipeNavigationResult {
  swipeStyle: CSSProperties;
}

/** Minimum horizontal distance (px) to trigger navigation. */
const SWIPE_THRESHOLD = 80;

/** Minimum velocity (px/ms) to trigger navigation even below distance threshold. */
const VELOCITY_THRESHOLD = 0.4;

/** Duration of the slide-out/snap-back animation (ms). */
const ANIMATION_DURATION = 300;

/**
 * Minimum initial movement (px) before locking to horizontal or vertical.
 * Prevents accidental swipe activation during normal scrolling.
 */
const DIRECTION_LOCK_THRESHOLD = 10;

/**
 * Hook for horizontal swipe navigation on touch devices.
 * Attaches touch listeners to the container, tracks horizontal swipes,
 * and returns a CSS style with translateX transform for the slide animation.
 */
export function useSwipeNavigation({
  containerRef,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: UseSwipeNavigationOptions): UseSwipeNavigationResult {
  const [offsetX, setOffsetX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mutable refs to avoid stale closures in touch listeners
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const directionLocked = useRef<"horizontal" | "vertical" | null>(null);
  const currentOffsetX = useRef(0);
  const hasPreviousRef = useRef(hasPrevious);
  const hasNextRef = useRef(hasNext);
  const onPreviousRef = useRef(onPrevious);
  const onNextRef = useRef(onNext);
  const isAnimatingRef = useRef(false);

  // Keep refs in sync with props
  hasPreviousRef.current = hasPrevious;
  hasNextRef.current = hasNext;
  onPreviousRef.current = onPrevious;
  onNextRef.current = onNext;

  const resetSwipe = useCallback(() => {
    setOffsetX(0);
    setIsAnimating(false);
    isAnimatingRef.current = false;
    currentOffsetX.current = 0;
    directionLocked.current = null;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;

      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      startTime.current = Date.now();
      directionLocked.current = null;
      currentOffsetX.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;

      // Determine direction lock on first significant movement
      if (!directionLocked.current) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (
          absDeltaX < DIRECTION_LOCK_THRESHOLD &&
          absDeltaY < DIRECTION_LOCK_THRESHOLD
        ) {
          return;
        }

        directionLocked.current =
          absDeltaX > absDeltaY ? "horizontal" : "vertical";
      }

      if (directionLocked.current !== "horizontal") return;

      // Block vertical scroll while swiping horizontally
      e.preventDefault();

      // Dampen swipe if no chapter available in that direction
      const canSwipeRight = deltaX > 0 && hasPreviousRef.current;
      const canSwipeLeft = deltaX < 0 && hasNextRef.current;

      if (!canSwipeRight && !canSwipeLeft) {
        // Apply strong resistance when swiping into a boundary
        currentOffsetX.current = deltaX * 0.15;
      } else {
        currentOffsetX.current = deltaX;
      }

      setOffsetX(currentOffsetX.current);
    };

    const handleTouchEnd = () => {
      if (isAnimatingRef.current || directionLocked.current !== "horizontal") {
        directionLocked.current = null;
        return;
      }

      const offset = currentOffsetX.current;
      const elapsed = Date.now() - startTime.current;
      const velocity = Math.abs(offset) / Math.max(elapsed, 1);

      const pastThreshold =
        Math.abs(offset) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD;

      const swipingToPrevious = offset > 0 && hasPreviousRef.current;
      const swipingToNext = offset < 0 && hasNextRef.current;

      if (pastThreshold && (swipingToPrevious || swipingToNext)) {
        // Animate off-screen in swipe direction
        const target = offset > 0 ? window.innerWidth : -window.innerWidth;
        setOffsetX(target);
        setIsAnimating(true);
        isAnimatingRef.current = true;

        setTimeout(() => {
          if (swipingToPrevious) {
            onPreviousRef.current();
          } else {
            onNextRef.current();
          }

          // Reset after navigation
          resetSwipe();
        }, ANIMATION_DURATION);
      } else {
        // Snap back
        setOffsetX(0);
        setIsAnimating(true);

        setTimeout(() => {
          setIsAnimating(false);
        }, ANIMATION_DURATION);
      }

      directionLocked.current = null;
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [containerRef, resetSwipe]);

  const swipeStyle: CSSProperties =
    offsetX !== 0 || isAnimating
      ? {
          transform: `translateX(${offsetX}px)`,
          transition: isAnimating
            ? `transform ${ANIMATION_DURATION}ms ease-out`
            : "none",
        }
      : {};

  return { swipeStyle };
}
