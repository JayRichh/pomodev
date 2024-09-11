// vite.config.mts
import { resolve } from 'path';
import { makeEntryPointPlugin } from 'file:///C:/Users/jsric/Code/devmap-pomodoro/packages/hmr/dist/index.js';
import { withPageConfig, isDev } from 'file:///C:/Users/jsric/Code/devmap-pomodoro/packages/vite-config/index.mjs';
var __vite_injected_original_dirname = 'C:\\Users\\jsric\\Code\\devmap-pomodoro\\pages\\content';
var rootDir = resolve(__vite_injected_original_dirname);
var libDir = resolve(rootDir, 'lib');
var vite_config_default = withPageConfig({
  resolve: {
    alias: {
      '@lib': libDir,
    },
  },
  publicDir: resolve(rootDir, 'public'),
  plugins: [isDev && makeEntryPointPlugin()],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, 'lib/index.ts'),
      formats: ['iife'],
      name: 'ContentScript',
      fileName: 'index',
    },
    outDir: resolve(rootDir, '..', '..', 'dist', 'content'),
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcanNyaWNcXFxcQ29kZVxcXFxkZXZtYXAtcG9tb2Rvcm9cXFxccGFnZXNcXFxcY29udGVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcanNyaWNcXFxcQ29kZVxcXFxkZXZtYXAtcG9tb2Rvcm9cXFxccGFnZXNcXFxcY29udGVudFxcXFx2aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2pzcmljL0NvZGUvZGV2bWFwLXBvbW9kb3JvL3BhZ2VzL2NvbnRlbnQvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgbWFrZUVudHJ5UG9pbnRQbHVnaW4gfSBmcm9tICdAZXh0ZW5zaW9uL2htcic7XG5pbXBvcnQgeyB3aXRoUGFnZUNvbmZpZywgaXNEZXYgfSBmcm9tICdAZXh0ZW5zaW9uL3ZpdGUtY29uZmlnJztcblxuY29uc3Qgcm9vdERpciA9IHJlc29sdmUoX19kaXJuYW1lKTtcbmNvbnN0IGxpYkRpciA9IHJlc29sdmUocm9vdERpciwgJ2xpYicpO1xuXG5leHBvcnQgZGVmYXVsdCB3aXRoUGFnZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0BsaWInOiBsaWJEaXIsXG4gICAgfSxcbiAgfSxcbiAgcHVibGljRGlyOiByZXNvbHZlKHJvb3REaXIsICdwdWJsaWMnKSxcbiAgcGx1Z2luczogW2lzRGV2ICYmIG1ha2VFbnRyeVBvaW50UGx1Z2luKCldLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnbGliL2luZGV4LnRzJyksXG4gICAgICBmb3JtYXRzOiBbJ2lpZmUnXSxcbiAgICAgIG5hbWU6ICdDb250ZW50U2NyaXB0JyxcbiAgICAgIGZpbGVOYW1lOiAnaW5kZXgnLFxuICAgIH0sXG4gICAgb3V0RGlyOiByZXNvbHZlKHJvb3REaXIsICcuLicsICcuLicsICdkaXN0JywgJ2NvbnRlbnQnKSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxVixTQUFTLGVBQWU7QUFDN1csU0FBUyw0QkFBNEI7QUFDckMsU0FBUyxnQkFBZ0IsYUFBYTtBQUZ0QyxJQUFNLG1DQUFtQztBQUl6QyxJQUFNLFVBQVUsUUFBUSxnQ0FBUztBQUNqQyxJQUFNLFNBQVMsUUFBUSxTQUFTLEtBQUs7QUFFckMsSUFBTyxzQkFBUSxlQUFlO0FBQUEsRUFDNUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxXQUFXLFFBQVEsU0FBUyxRQUFRO0FBQUEsRUFDcEMsU0FBUyxDQUFDLFNBQVMscUJBQXFCLENBQUM7QUFBQSxFQUN6QyxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQ3hDLFNBQVMsQ0FBQyxNQUFNO0FBQUEsTUFDaEIsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLElBQ1o7QUFBQSxJQUNBLFFBQVEsUUFBUSxTQUFTLE1BQU0sTUFBTSxRQUFRLFNBQVM7QUFBQSxFQUN4RDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
