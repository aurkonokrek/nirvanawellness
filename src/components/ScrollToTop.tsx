import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after roughly one viewport (past the hero) of scrolling.
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--gold-soft)]/40 bg-background/95 text-[color:var(--navy)] shadow-lg backdrop-blur transition-transform hover:-translate-y-0.5"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
