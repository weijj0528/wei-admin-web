import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import WujieVue from 'wujie-vue3'
import App from './App.vue'
import router from './router'
import { vPermission } from './utils/permission'
import { reportError } from './utils/errorReport'
import './style.css'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(WujieVue)
app.directive('permission', vPermission)

// 全局错误处理（评审补强 CRITICAL 2：前端可观测）
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue Error]', err, info)
  reportError('vue', (err as Error)?.message || String(err), `${info}\n${(err as Error)?.stack || ''}`)
}

app.mount('#app')
