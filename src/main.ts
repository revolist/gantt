import '../demo-host.css';
import '@revolist/revogrid-pro/dist/revogrid-pro.css';
import '@revolist/revogrid-enterprise/dist/revogrid-enterprise.css';
import { resolveGanttEntry } from './entries';
import type { GanttEntryFramework } from './gantt-entry';

const framework: GanttEntryFramework = import.meta.env.MODE === 'development'
  ? 'ts'
  : import.meta.env.MODE as GanttEntryFramework;
const entry = resolveGanttEntry(window.location.search);

async function bootstrap() {
  switch (framework) {
    case 'react': {
      const [{ createElement }, { createRoot }, Demo] = await Promise.all([
        import('react'),
        import('react-dom/client'),
        entry.loadReact(),
      ]);
      createRoot(document.querySelector('#app')!).render(
        createElement(Demo as Parameters<typeof createElement>[0]),
      );
      break;
    }
    case 'vue': {
      const [{ createApp }, Demo] = await Promise.all([
        import('vue'),
        entry.loadVue(),
      ]);
      createApp(Demo as Parameters<typeof createApp>[0]).mount('#app');
      break;
    }
    case 'angular': {
      await import('zone.js');
      await import('@angular/compiler');
      document.querySelector('#app')!.innerHTML = `<${entry.angularSelector}></${entry.angularSelector}>`;
      const [{ bootstrapApplication }, Demo] = await Promise.all([
        import('@angular/platform-browser'),
        entry.loadAngular(),
      ]);
      await bootstrapApplication(Demo as Parameters<typeof bootstrapApplication>[0]);
      break;
    }
    default: {
      const load = await entry.loadTs();
      load('#app');
    }
  }
}

void bootstrap();
