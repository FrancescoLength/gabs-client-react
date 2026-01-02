import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://192.168.1.108:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        css: false,
        testTimeout: 30000,
        hookTimeout: 30000,
        // CI Optimization: Disable parallelism for stability
        fileParallelism: !process.env.CI,
    },
});
