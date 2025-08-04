import TailwindPlugin from 'bun-plugin-tailwind';
import VuePlugin from '../plugin/vue-plugin';

await Bun.build({
  entrypoints: ['frontend/index.html'],
  outdir: 'dist/frontend',
  plugins: [VuePlugin, TailwindPlugin],
  env: "inline"
});
