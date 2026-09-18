import { useEffect, useState } from "react";

export function usePanelReveal(ready: boolean) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!ready) return;

    const frame = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  return { expanded, setExpanded };
}
