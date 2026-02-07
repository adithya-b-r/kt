import { useRef, useCallback, useState, useEffect } from 'react';

export interface ZoomPanState {
  scale: number;
  translateX: number;
  translateY: number;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;
const ZOOM_STEP = 0.1;

export const useZoomPan = (containerRef: React.RefObject<SVGSVGElement>) => {
  const [state, setState] = useState<ZoomPanState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTranslateRef = useRef({ x: 0, y: 0 });

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!containerRef.current) return;

      e.preventDefault();
      const svg = containerRef.current;
      const rect = svg.getBoundingClientRect();

      // Get mouse position relative to SVG
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Determine zoom direction
      const direction = e.deltaY > 0 ? -1 : 1;
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, state.scale + direction * ZOOM_STEP)
      );

      // Calculate new translate to zoom towards mouse position
      const scaleDiff = newScale - state.scale;
      const newTranslateX =
        state.translateX - (mouseX * scaleDiff) / newScale;
      const newTranslateY =
        state.translateY - (mouseY * scaleDiff) / newScale;

      setState({
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      });
    },
    [state.scale, state.translateX, state.translateY]
  );

  // Handle mouse down for pan
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 1 && e.button !== 2) return; // Middle or right click

    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastTranslateRef.current = {
      x: state.translateX,
      y: state.translateY,
    };
  }, [state.translateX, state.translateY]);

  // Handle mouse move for pan
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setState((prev) => ({
      ...prev,
      translateX: lastTranslateRef.current.x + deltaX,
      translateY: lastTranslateRef.current.y + deltaY,
    }));
  }, []);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Reset zoom and pan
  const reset = useCallback(() => {
    setState({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  // Fit to bounds
  const fitToBounds = useCallback(
    (boundingBox: { x: number; y: number; width: number; height: number }) => {
      if (!containerRef.current) return;

      const svg = containerRef.current;
      const rect = svg.getBoundingClientRect();
      const padding = 50;

      const availableWidth = rect.width - padding * 2;
      const availableHeight = rect.height - padding * 2;

      const scaleX = availableWidth / boundingBox.width;
      const scaleY = availableHeight / boundingBox.height;
      const newScale = Math.min(scaleX, scaleY, MAX_SCALE);

      const newTranslateX =
        padding - boundingBox.x * newScale + (availableWidth - boundingBox.width * newScale) / 2;
      const newTranslateY =
        padding - boundingBox.y * newScale + (availableHeight - boundingBox.height * newScale) / 2;

      setState({
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      });
    },
    []
  );

  // --- TOUCH HANDLING ---

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartDistanceRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);
  const touchStartMidpointRef = useRef<{ x: number; y: number } | null>(null);

  const getDistance = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getMidpoint = (t1: Touch, t2: Touch) => {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch -> Pan
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      lastTranslateRef.current = { x: state.translateX, y: state.translateY };
      isDraggingRef.current = true;
    } else if (e.touches.length === 2) {
      // Two touches -> Zoom
      e.preventDefault(); // Prevent default pinch-zoom of the page
      const dist = getDistance(e.touches[0], e.touches[1]);
      touchStartDistanceRef.current = dist;
      touchStartScaleRef.current = state.scale;

      // Calculate midpoint relative to SVG for zoom centering
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mid = getMidpoint(e.touches[0], e.touches[1]);
        touchStartMidpointRef.current = {
          x: mid.x - rect.left,
          y: mid.y - rect.top
        };
        lastTranslateRef.current = { x: state.translateX, y: state.translateY };
      }
    }
  }, [state.translateX, state.translateY, state.scale]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current && touchStartRef.current) {
      // Pan
      // e.preventDefault(); // Often better to allow scrolling if just 1 finger, but for map/canvas apps usually prevent.
      // Let's prevent default to stop page scrolling while dragging the tree
      e.preventDefault();

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      setState(prev => ({
        ...prev,
        translateX: lastTranslateRef.current.x + deltaX,
        translateY: lastTranslateRef.current.y + deltaY,
      }));
    } else if (e.touches.length === 2 && touchStartDistanceRef.current && touchStartMidpointRef.current) {
      // Zoom
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const scaleFactor = dist / touchStartDistanceRef.current;

      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, touchStartScaleRef.current * scaleFactor)
      );

      // Calculate translation to keep midpoint stable
      // Current world pos of midpoint = (screenMid - translate) / scale
      // We want (screenMid - newTranslate) / newScale = same world pos
      // => newTranslate = screenMid - (screenMid - translate) * (newScale / scale)

      // Let's use a simpler approximation if exact math helps:
      // Works similar to wheel zoom but with explicit start points

      const mid = touchStartMidpointRef.current; // Relative to SVG
      const oldScale = touchStartScaleRef.current;

      // Calculate how much the scale changed relative to start
      // Actually simpler:
      // The point 'mid' corresponds to some world coordinate.
      // worldX = (mid.x - lastTranslateRef.current.x) / oldScale
      // We want the new translate such that:
      // mid.x = worldX * newScale + newTranslateX
      // => newTranslateX = mid.x - worldX * newScale
      // => newTranslateX = mid.x - ((mid.x - lastTranslateRef.current.x) / oldScale) * newScale

      const newTranslateX = mid.x - ((mid.x - lastTranslateRef.current.x) / oldScale) * newScale;
      const newTranslateY = mid.y - ((mid.y - lastTranslateRef.current.y) / oldScale) * newScale;

      setState({
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    touchStartRef.current = null;
    touchStartDistanceRef.current = null;
    touchStartMidpointRef.current = null;
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const svg = containerRef.current;

    // Mouse events
    svg.addEventListener('wheel', handleWheel, { passive: false });
    svg.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch events
    svg.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);


    return () => {
      svg.removeEventListener('wheel', handleWheel);
      svg.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      svg.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    state,
    reset,
    fitToBounds,
  };
};
