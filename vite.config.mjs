import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  base: '/lmsdemo-main/', // 修改為正確的 repository 名稱
  plugins: [
    vue({ 
      template: { transformAssetUrls } 
    }), 
    quasar()
  ],
})