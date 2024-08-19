// vite.config.mts
import { resolve } from "path";
import { makeEntryPointPlugin } from "file:///C:/Users/jsric/Code/devmap-pomodoro/packages/hmr/dist/index.js";
import { withPageConfig, isDev } from "file:///C:/Users/jsric/Code/devmap-pomodoro/packages/vite-config/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\jsric\\Code\\devmap-pomodoro\\pages\\content-ui";
var rootDir = resolve(__vite_injected_original_dirname);
var srcDir = resolve(rootDir, "src");
var vite_config_default = withPageConfig({
  resolve: {
    alias: {
      "@src": srcDir
    }
  },
  plugins: [isDev && makeEntryPointPlugin()],
  publicDir: resolve(rootDir, "public"),
  build: {
    lib: {
      entry: resolve(srcDir, "index.tsx"),
      name: "contentUI",
      formats: ["iife"],
      fileName: "index"
    },
    outDir: resolve(rootDir, "..", "..", "dist", "content-ui")
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcanNyaWNcXFxcQ29kZVxcXFxkZXZtYXAtcG9tb2Rvcm9cXFxccGFnZXNcXFxcY29udGVudC11aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcanNyaWNcXFxcQ29kZVxcXFxkZXZtYXAtcG9tb2Rvcm9cXFxccGFnZXNcXFxcY29udGVudC11aVxcXFx2aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2pzcmljL0NvZGUvZGV2bWFwLXBvbW9kb3JvL3BhZ2VzL2NvbnRlbnQtdWkvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgbWFrZUVudHJ5UG9pbnRQbHVnaW4gfSBmcm9tICdAZXh0ZW5zaW9uL2htcic7XG5pbXBvcnQgeyB3aXRoUGFnZUNvbmZpZywgaXNEZXYgfSBmcm9tICdAZXh0ZW5zaW9uL3ZpdGUtY29uZmlnJztcblxuY29uc3Qgcm9vdERpciA9IHJlc29sdmUoX19kaXJuYW1lKTtcbmNvbnN0IHNyY0RpciA9IHJlc29sdmUocm9vdERpciwgJ3NyYycpO1xuXG5leHBvcnQgZGVmYXVsdCB3aXRoUGFnZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0BzcmMnOiBzcmNEaXIsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW2lzRGV2ICYmIG1ha2VFbnRyeVBvaW50UGx1Z2luKCldLFxuICBwdWJsaWNEaXI6IHJlc29sdmUocm9vdERpciwgJ3B1YmxpYycpLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoc3JjRGlyLCAnaW5kZXgudHN4JyksXG4gICAgICBuYW1lOiAnY29udGVudFVJJyxcbiAgICAgIGZvcm1hdHM6IFsnaWlmZSddLFxuICAgICAgZmlsZU5hbWU6ICdpbmRleCcsXG4gICAgfSxcbiAgICBvdXREaXI6IHJlc29sdmUocm9vdERpciwgJy4uJywgJy4uJywgJ2Rpc3QnLCAnY29udGVudC11aScpLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThWLFNBQVMsZUFBZTtBQUN0WCxTQUFTLDRCQUE0QjtBQUNyQyxTQUFTLGdCQUFnQixhQUFhO0FBRnRDLElBQU0sbUNBQW1DO0FBSXpDLElBQU0sVUFBVSxRQUFRLGdDQUFTO0FBQ2pDLElBQU0sU0FBUyxRQUFRLFNBQVMsS0FBSztBQUVyQyxJQUFPLHNCQUFRLGVBQWU7QUFBQSxFQUM1QixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsQ0FBQyxTQUFTLHFCQUFxQixDQUFDO0FBQUEsRUFDekMsV0FBVyxRQUFRLFNBQVMsUUFBUTtBQUFBLEVBQ3BDLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILE9BQU8sUUFBUSxRQUFRLFdBQVc7QUFBQSxNQUNsQyxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsTUFBTTtBQUFBLE1BQ2hCLFVBQVU7QUFBQSxJQUNaO0FBQUEsSUFDQSxRQUFRLFFBQVEsU0FBUyxNQUFNLE1BQU0sUUFBUSxZQUFZO0FBQUEsRUFDM0Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
