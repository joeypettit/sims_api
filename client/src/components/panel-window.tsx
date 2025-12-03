import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function PanelWindow({ children }: { children: React.ReactNode }) {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const scrollKey = `scrollPosition_${location.pathname}`;

  // Restore scroll position when component mounts or location changes
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(scrollKey);
    if (savedScrollPosition && scrollContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = parseInt(savedScrollPosition, 10);
        }
      });
    }
  }, [location.pathname, scrollKey]);

  // Save scroll position before navigating away
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      sessionStorage.setItem(scrollKey, scrollContainer.scrollTop.toString());
    };

    // Throttle scroll events for performance
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    scrollContainer.addEventListener("scroll", throttledHandleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [scrollKey]);

  return (
    <div className="p-1 flex h-full w-full">
      <section 
        ref={scrollContainerRef}
        className="bg-white rounded-md shadow-xl border border-slate-200 p-4 overflow-auto h-full w-full"
      >
        {children}
      </section>
    </div>
  );
}

export default PanelWindow;
