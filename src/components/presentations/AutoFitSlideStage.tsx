import React, { useRef, useState, useEffect, useLayoutEffect, ReactNode } from "react";

interface AutoFitSlideStageProps {
  children: ReactNode;
  className?: string;
  maxScale?: number;
  minScale?: number;
}

export default function AutoFitSlideStage({
  children,
  className = "",
  maxScale = 1,
  minScale = 0.2,
}: AutoFitSlideStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [scaledSize, setScaledSize] = useState<{ width: number; height: number } | null>(null);

  const calculateScale = () => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth <= 0 || containerHeight <= 0) return;

    // Reset transform temporarily to measure natural dimensions accurately
    content.style.transform = "none";
    const naturalWidth = content.offsetWidth || content.scrollWidth;
    const naturalHeight = content.offsetHeight || content.scrollHeight;

    if (naturalWidth <= 0 || naturalHeight <= 0) return;

    // Calculate scale factor to fit within container bounds with small safety margin (8px padding)
    const scaleX = (containerWidth - 12) / naturalWidth;
    const scaleY = (containerHeight - 12) / naturalHeight;
    const fitScale = Math.min(scaleX, scaleY, maxScale);
    const finalScale = Math.max(fitScale, minScale);

    setScale(finalScale);
    setScaledSize({
      width: Math.round(naturalWidth * finalScale),
      height: Math.round(naturalHeight * finalScale),
    });

    // Reapply transform
    content.style.transform = `scale(${finalScale})`;
  };

  useLayoutEffect(() => {
    calculateScale();
  }, [children]);

  useEffect(() => {
    const handleResize = () => {
      window.requestAnimationFrame(calculateScale);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(calculateScale);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    const timer1 = setTimeout(calculateScale, 60);
    const timer2 = setTimeout(calculateScale, 250);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ touchAction: "manipulation" }}
    >
      <div
        style={
          scaledSize
            ? {
                width: `${scaledSize.width}px`,
                height: `${scaledSize.height}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
              }
            : {
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }
        }
      >
        <div
          ref={contentRef}
          className="w-full max-w-5xl mx-auto transition-transform duration-150 ease-out origin-center shrink-0"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
