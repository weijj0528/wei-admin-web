import { defineAsyncComponent, type Component } from 'vue'

/**
 * 预加载 views 下所有 vue 组件，建立「相对路径 -> 动态 loader」映射。
 * key 形如 /src/views/home/index.vue
 */
const modules = import.meta.glob('@/views/**/*.vue')

/**
 * 判断 component 是否为子应用入口 URL（http/https 开头）。
 * 是则由 wujie 加载，否则按本地组件路径加载。
 */
export function isSubAppUrl(component?: string): boolean {
  return /^https?:\/\//i.test(component || '')
}

/**
 * 按 component 路径动态加载本地 vue 组件。
 * @param component 相对 views 的路径，如 'home/index' -> @/views/home/index.vue
 * @returns 异步组件；路径为空或找不到时返回 null
 */
export function loadComponent(component?: string): Component | null {
  if (!component) return null
  const key = `/src/views/${component}.vue`
  const loader = modules[key]
  return loader ? (defineAsyncComponent(loader as any) as Component) : null
}
