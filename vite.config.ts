import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default ({ mode }) => {
    //process.env = {...process.env, ...loadEnv(mode, process.cwd())};
    process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
    return defineConfig({
        server: {
            port: parseInt(process.env.VITE_PORT),
            host: process.env.VITE_HOST,
        },
        plugins: [vue(), vueJsx()],
        // base: './',           //..................... http://localhost:5173/
        base: '/wiremock',   //...........................http://localhost:5173/wiremock
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    })
}