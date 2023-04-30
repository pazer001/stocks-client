import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         lodash: ["lodash"],
  //         "@mui/icons-material": ["@mui/icons-material"],
  //         "@mui/material": ["@mui/material"],
  //         "@mui/x-data-grid": ["@mui/x-data-grid"],
  //         highcharts: ["highcharts"],
  //         "highcharts-react-official": ["highcharts-react-official"],
  //         luxon: ["luxon"],
  //         "@fontsource/roboto": ["@fontsource/roboto"],
  //         recoil: ["recoil"],
  //         "the-new-css-reset": ["the-new-css-reset"],
  //         "react-window": ["react-window"],
  //         "@emotion/react": ["@emotion/react"],
  //         "@emotion/styled": ["@emotion/styled"],
  //       },
  //     },
  //   },
  // },
});
