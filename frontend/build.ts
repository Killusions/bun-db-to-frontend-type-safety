await Bun.build({
  entrypoints: ['frontend/index.html'],
  outdir: 'dist/frontend',
  env: "inline"
});
