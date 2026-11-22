import '@revolist/ui/styles.css';
// src/examples/showcase/gantt.react.tsx
import './gantt.scss';
import React, { useEffect, useRef } from 'react';
import { mountShowcase } from './gantt';

function GanttShowcase() {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hostRef.current) return;
    return mountShowcase(hostRef.current);
  }, []);

  return <div ref={hostRef} className="gantt-showcase-host grow h-full" />;
}

export default GanttShowcase;
