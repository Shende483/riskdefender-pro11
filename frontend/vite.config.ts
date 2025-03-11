import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Load environment variables
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const PORT = Number(env.VITE_PORT) 
  const HOST = env.VITE_HOST 

  return {
    plugins: [
      react(),
      checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
          dev: { logLevel: ['error'] },
        },
        overlay: {
          position: 'tl',
          initialIsOpen: false,
        },
      }),
    ],
    resolve: {
      alias: [
        {
          find: /^~(.+)/,
          replacement: path.join(process.cwd(), 'node_modules/$1'),
        },
        {
          find: /^src(.+)/,
          replacement: path.join(process.cwd(), 'src/$1'),
        },
      ],
    },
    server: { port: PORT, host: HOST },
    preview: { port: PORT, host: HOST },
  };
});
