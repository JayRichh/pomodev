// vite.config.mts
import { resolve } from 'path';
import { withPageConfig } from 'file:///C:/Users/jsric/Code/devmap-pomodoro/packages/vite-config/index.mjs';
var __vite_injected_original_dirname = 'C:\\Users\\jsric\\Code\\devmap-pomodoro\\pages\\popup';
var rootDir = resolve(__vite_injected_original_dirname);
var srcDir = resolve(rootDir, 'src');
var vite_config_default = withPageConfig({
  resolve: {
    alias: {
      '@src': srcDir,
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  plugins: [],
  publicDir: resolve(rootDir, 'public'),
  build: {
    outDir: resolve(rootDir, '..', '..', 'dist', 'popup'),
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
      },
    },
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcanNyaWNcXFxcQ29kZVxcXFxkZXZtYXAtcG9tb2Rvcm9cXFxccGFnZXNcXFxccG9wdXBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGpzcmljXFxcXENvZGVcXFxcZGV2bWFwLXBvbW9kb3JvXFxcXHBhZ2VzXFxcXHBvcHVwXFxcXHZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvanNyaWMvQ29kZS9kZXZtYXAtcG9tb2Rvcm8vcGFnZXMvcG9wdXAvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgd2l0aFBhZ2VDb25maWcgfSBmcm9tICdAZXh0ZW5zaW9uL3ZpdGUtY29uZmlnJztcblxuY29uc3Qgcm9vdERpciA9IHJlc29sdmUoX19kaXJuYW1lKTtcbmNvbnN0IHNyY0RpciA9IHJlc29sdmUocm9vdERpciwgJ3NyYycpO1xuXG5leHBvcnQgZGVmYXVsdCB3aXRoUGFnZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0BzcmMnOiBzcmNEaXIsXG4gICAgfSxcbiAgfSxcbiAgY3NzOiB7XG4gICAgcG9zdGNzczogJy4vcG9zdGNzcy5jb25maWcuanMnLFxuICB9LFxuICBwbHVnaW5zOiBbXSxcbiAgcHVibGljRGlyOiByZXNvbHZlKHJvb3REaXIsICdwdWJsaWMnKSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6IHJlc29sdmUocm9vdERpciwgJy4uJywgJy4uJywgJ2Rpc3QnLCAncG9wdXAnKSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBtYWluOiByZXNvbHZlKHJvb3REaXIsICdpbmRleC5odG1sJyksXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQStVLFNBQVMsZUFBZTtBQUN2VyxTQUFTLHNCQUFzQjtBQUQvQixJQUFNLG1DQUFtQztBQUd6QyxJQUFNLFVBQVUsUUFBUSxnQ0FBUztBQUNqQyxJQUFNLFNBQVMsUUFBUSxTQUFTLEtBQUs7QUFFckMsSUFBTyxzQkFBUSxlQUFlO0FBQUEsRUFDNUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsRUFDWDtBQUFBLEVBQ0EsU0FBUyxDQUFDO0FBQUEsRUFDVixXQUFXLFFBQVEsU0FBUyxRQUFRO0FBQUEsRUFDcEMsT0FBTztBQUFBLElBQ0wsUUFBUSxRQUFRLFNBQVMsTUFBTSxNQUFNLFFBQVEsT0FBTztBQUFBLElBQ3BELGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxRQUNMLE1BQU0sUUFBUSxTQUFTLFlBQVk7QUFBQSxNQUNyQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
