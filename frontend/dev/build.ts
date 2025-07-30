import VuePlugin from '../plugin/vue-plugin';

await Bun.build({
  entrypoints: ['frontend/index.html'],
  outdir: 'dist/frontend',
  plugins: [VuePlugin],
  env: "inline"
});
