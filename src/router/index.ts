import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/home',
    children: [
      { path: 'home', name: 'Home', component: () => import('@/views/home/index.vue'), meta: { title: '首页' } },
      // P0 系统管理
      { path: 'system/platform', name: 'Platform', component: () => import('@/views/system/platform/index.vue'), meta: { title: '平台管理' } },
      { path: 'system/tenant', name: 'Tenant', component: () => import('@/views/system/tenant/index.vue'), meta: { title: '租户管理' } },
      { path: 'system/menu', name: 'Menu', component: () => import('@/views/system/menu/index.vue'), meta: { title: '菜单管理' } },
      { path: 'system/role', name: 'Role', component: () => import('@/views/system/role/index.vue'), meta: { title: '角色管理' } },
      { path: 'system/api', name: 'Api', component: () => import('@/views/system/api/index.vue'), meta: { title: '接口管理' } },
      // P1 组织管理
      { path: 'org/info', name: 'OrgInfo', component: () => import('@/views/org/info/index.vue'), meta: { title: '机构管理' } },
      { path: 'org/department', name: 'Department', component: () => import('@/views/org/department/index.vue'), meta: { title: '部门管理' } },
      { path: 'org/employee', name: 'Employee', component: () => import('@/views/org/employee/index.vue'), meta: { title: '员工管理' } },
      { path: 'org/role', name: 'OrgRole', component: () => import('@/views/org/role/index.vue'), meta: { title: '角色管理' } },
      // P1 用户管理
      { path: 'user', name: 'User', component: () => import('@/views/user/index.vue'), meta: { title: '用户管理' } },
      // P2 字典与日志
      { path: 'dict/type', name: 'DictType', component: () => import('@/views/dict/type.vue'), meta: { title: '字典类型' } },
      { path: 'dict/item', name: 'DictItem', component: () => import('@/views/dict/item.vue'), meta: { title: '字典项' } },
      { path: 'operationLog', name: 'OperationLog', component: () => import('@/views/operationLog/index.vue'), meta: { title: '操作日志' } },
      // 子应用路由（wujie 容器）：/platform/{code}/* → PlatformContainer 加载对应子应用
      { path: 'platform/:platformCode/:pathMatch(.*)*', name: 'PlatformContainer', component: () => import('@/layout/PlatformContainer.vue'), meta: { title: '子应用' } }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫（Vue Router 4 推荐返回值式导航，避免 next() deprecated 警告）
const whiteList = ['/login']
router.beforeEach(async (to) => {
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      return { path: '/' }
    }
    const userStore = useUserStore()
    if (!userStore.username) {
      try {
        await userStore.fetchUserInfo()
        await userStore.fetchPermission()
      } catch (e) {
        userStore.logout()
        return { path: '/login', query: { redirect: to.path } }
      }
    }
    return true
  } else {
    if (whiteList.includes(to.path)) return true
    return { path: '/login', query: { redirect: to.path } }
  }
})

export default router
