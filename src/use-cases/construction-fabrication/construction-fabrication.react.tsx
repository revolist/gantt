import React, { useEffect, useRef } from 'react';
import { mountConstructionFabricationWorkspace } from './construction-fabrication.workspace';
export default function ConstructionFabricationGanttDemo() { const host = useRef<HTMLDivElement>(null); useEffect(() => host.current ? mountConstructionFabricationWorkspace(host.current) : undefined, []); return <div ref={host} />; }
