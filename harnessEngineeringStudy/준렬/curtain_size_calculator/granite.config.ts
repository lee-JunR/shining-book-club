import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'curtain-size-calculator',
  brand: {
    displayName: '커튼 사이즈 계산기',
    primaryColor: '#2f7d6d',
    icon: 'https://static.toss.im/icons/png/4x/icon-person-man.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host 0.0.0.0',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
});
