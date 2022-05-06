export default {
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ReactComponentPackage',
      formats: ['es', 'cjs', 'umd'],
      fileName: 'index',
    },
    outDir: 'lib',
    rollupOptions: {
      external: [
        'react',
      ]
    },
  },
}
