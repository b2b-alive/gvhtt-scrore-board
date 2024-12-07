// https://vitejs.dev/config/

import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/',
    root: 'src/html',
    build: {
        outDir: '../../dist/html/',
    },
    server: {
        port: 5001,
        host: 'localhost',
        hmr: {
            port: 5101
        }
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly'
        }
    },
    resolve: {
        external: ["react", "react-dom"],
    },
    plugins: [
        react(),
    ],
})
