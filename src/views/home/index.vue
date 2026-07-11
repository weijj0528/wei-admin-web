<template>
  <div class="home">
    <!-- 头部：问候 + 元信息 -->
    <header class="hero">
      <div class="hero-text">
        <p class="hero-eyebrow">
          <span class="pulse" />
          <span>{{ systemStatus }}</span>
          <span class="sep">·</span>
          <span>{{ nowLabel }}</span>
        </p>
        <h1 class="hero-title">
          {{ greeting }}，<em>{{ userStore.username }}</em>
        </h1>
        <p class="hero-sub">
          当前平台
          <span class="chip">{{ currentPlatformName }}</span>
          · 租户
          <span class="chip mono">{{ currentTenant || '0' }}</span>
        </p>
      </div>
      <div class="hero-side">
        <div class="brand-mark-sm" aria-hidden="true">
          <span class="bm-ring" />
          <span class="bm-dot" />
          <span class="bm-w">{ w }</span>
        </div>
      </div>
    </header>

    <!-- 统计卡：3px 色边 + 等宽数字 -->
    <section class="stats" aria-label="控制台指标">
      <article
        v-for="(s, i) in stats"
        :key="s.label"
        class="stat"
        :style="{ '--stat-accent': s.color }"
      >
        <span class="stat-bar" />
        <div class="stat-body">
          <div class="stat-value tabular-nums">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-desc">{{ s.desc }}</div>
        </div>
        <div class="stat-icon" :style="{ color: s.color }">
          <el-icon><component :is="s.icon" /></el-icon>
        </div>
        <span class="stat-idx">0{{ i + 1 }}</span>
      </article>
    </section>

    <!-- 两列：快捷入口 + 最近活动 -->
    <section class="grid-2">
      <div class="panel">
        <header class="panel-head">
          <h3 class="panel-title">快捷入口</h3>
          <span class="panel-meta">{{ quickLinks.length }} 项</span>
        </header>
        <div class="quick-grid">
          <button
            v-for="q in quickLinks"
            :key="q.path"
            class="quick-card"
            @click="router.push(q.path)"
          >
            <div class="quick-icon"><el-icon><component :is="q.icon" /></el-icon></div>
            <div class="quick-meta">
              <span class="quick-label">{{ q.label }}</span>
              <span class="quick-arrow"><el-icon><ArrowRight /></el-icon></span>
            </div>
          </button>
        </div>
      </div>

      <div class="panel">
        <header class="panel-head">
          <h3 class="panel-title">系统状态</h3>
          <span class="panel-meta">实时</span>
        </header>
        <ul class="status-list">
          <li class="status-item">
            <span class="status-dot ok" />
            <div class="status-body">
              <span class="status-title">网关服务</span>
              <span class="status-sub">wei-all-gateway · :8080</span>
            </div>
            <span class="status-tag ok">UP</span>
          </li>
          <li class="status-item">
            <span class="status-dot ok" />
            <div class="status-body">
              <span class="status-title">认证中心</span>
              <span class="status-sub">Token 有效时长 {{ tokenExpire }}</span>
            </div>
            <span class="status-tag ok">运行</span>
          </li>
          <li class="status-item">
            <span class="status-dot ok" />
            <div class="status-body">
              <span class="status-title">权限树</span>
              <span class="status-sub">已加载 {{ countMenus(userStore.menus) }} 个菜单节点</span>
            </div>
            <span class="status-tag ok">就绪</span>
          </li>
          <li class="status-item">
            <span class="status-dot warn" />
            <div class="status-body">
              <span class="status-title">微前端容器</span>
              <span class="status-sub">wujie 已挂载 · 等待子应用接入</span>
            </div>
            <span class="status-tag warn">待接入</span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Grid, Menu, Setting, Platform, ArrowRight,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const currentPlatformName = computed(() => {
  const p = appStore.platforms.find((x) => x.code === appStore.currentPlatform)
  return p?.name || appStore.currentPlatform || '—'
})
const currentTenant = ref('1')

function countMenus(menus: any[]): number {
  return menus.reduce((sum, m) => sum + 1 + countMenus(m.children || []), 0)
}

// 时间问候
const now = ref(new Date())
let timer: number | null = null
onMounted(() => { timer = window.setInterval(() => (now.value = new Date()), 30_000) })
onUnmounted(() => { if (timer) clearInterval(timer) })

const greeting = computed(() => {
  const h = now.value.getHours()
  if (h < 6) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 13) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})
const nowLabel = computed(() => {
  const d = now.value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})
const systemStatus = computed(() => {
  const h = now.value.getHours()
  if (h >= 0 && h < 6) return '系统夜间值守中'
  return '系统运行正常'
})
const tokenExpire = '2h'

const stats = computed(() => [
  {
    label: '顶部模块', value: userStore.menus.length,
    desc: 'Platform module', icon: Grid, color: 'var(--brand)',
  },
  {
    label: '菜单节点', value: countMenus(userStore.menus),
    desc: 'Menu tree total', icon: Menu, color: 'var(--success)',
  },
  {
    label: '按钮权限', value: userStore.buttons.length,
    desc: 'Button-level rules', icon: Setting, color: 'var(--warning)',
  },
  {
    label: '接入平台', value: appStore.platforms.length,
    desc: 'Registered platforms', icon: Platform, color: 'var(--accent)',
  },
])

const quickLinks = [
  { label: '菜单管理', path: '/system/menu', icon: Menu },
  { label: '角色管理', path: '/system/role', icon: Setting },
  { label: '租户管理', path: '/system/tenant', icon: Platform },
  { label: '员工管理', path: '/org/employee', icon: Grid },
  { label: '机构管理', path: '/org/info', icon: Grid },
  { label: '平台管理', path: '/system/platform', icon: Platform },
  { label: '接口管理', path: '/system/api', icon: Setting },
  { label: '操作日志', path: '/operationLog', icon: Menu },
]
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: 1440px;
}

/* ========== Hero ========== */
.hero {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0% 0%, rgba(59, 91, 255, 0.06) 0%, transparent 40%),
    radial-gradient(circle at 100% 100%, rgba(245, 176, 66, 0.08) 0%, transparent 45%);
  pointer-events: none;
}
.hero::after {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--brand) 0%, var(--accent) 100%);
  border-radius: 0 3px 3px 0;
}
.hero-text { position: relative; z-index: 1; }
.hero-side { position: relative; z-index: 1; }

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}
.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 0 rgba(24, 169, 87, 0.5);
  animation: pulse-ring 2s infinite;
}
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(24, 169, 87, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(24, 169, 87, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 169, 87, 0); }
}
.sep { opacity: 0.4; }

.hero-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text);
  line-height: 1.25;
  margin-bottom: 8px;
}
.hero-title em {
  font-style: normal;
  color: var(--brand);
  font-weight: 800;
}
.hero-sub {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: var(--gray-50);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text);
  font-weight: 500;
}
.chip.mono { font-family: var(--font-mono); color: var(--brand); }

/* 小徽标（hero 右侧） */
.brand-mark-sm {
  position: relative;
  width: 64px;
  height: 64px;
  font-family: var(--font-mono);
}
.bm-ring {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--surface) 0%, var(--gray-50) 100%);
}
.bm-dot {
  position: absolute;
  top: 10px; left: 10px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}
.bm-w {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800;
  font-style: italic;
  font-size: 22px;
  color: var(--brand);
  letter-spacing: -1px;
}

/* ========== Stats ========== */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.stat {
  --stat-accent: var(--brand);
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  overflow: hidden;
  transition: all 0.2s ease;
}
.stat:hover {
  border-color: var(--stat-accent);
  box-shadow: var(--shadow);
  transform: translateY(-1px);
}
.stat-bar {
  position: absolute;
  left: 0; top: 12px; bottom: 12px;
  width: 3px;
  background: var(--stat-accent);
  border-radius: 0 3px 3px 0;
}
.stat-body {
  flex: 1;
  padding-left: var(--space-2);
  min-width: 0;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.stat-label {
  margin-top: 6px;
  font-size: var(--text-sm);
  color: var(--text);
  font-weight: 500;
}
.stat-desc {
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}
.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--stat-accent) 8%, transparent);
}
.stat-idx {
  position: absolute;
  right: 12px;
  top: 10px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-tertiary);
  opacity: 0.5;
  font-weight: 600;
}

/* ========== Two-col grid ========== */
.grid-2 {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: var(--space-4);
}
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-light);
}
.panel-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0;
}
.panel-meta {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Quick links */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.quick-card {
  background: var(--gray-50);
  border: 1px solid transparent;
  border-radius: var(--radius);
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;
  font-family: inherit;
}
.quick-card:hover {
  background: var(--surface);
  border-color: var(--brand);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}
.quick-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--brand);
  background: var(--brand-light);
  transition: all 0.18s;
}
.quick-card:hover .quick-icon {
  background: var(--brand);
  color: #fff;
}
.quick-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.quick-label {
  font-size: var(--text-sm);
  color: var(--text);
  font-weight: 500;
}
.quick-arrow {
  font-size: 12px;
  color: var(--text-tertiary);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.18s;
}
.quick-card:hover .quick-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--brand);
}

/* Status list */
.status-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}
.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px dashed var(--border-light);
}
.status-item:last-child { border-bottom: none; }
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot.ok {
  background: var(--success);
  box-shadow: 0 0 0 3px var(--success-light);
}
.status-dot.warn {
  background: var(--warning);
  box-shadow: 0 0 0 3px var(--warning-light);
}
.status-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.status-title {
  font-size: var(--text-sm);
  color: var(--text);
  font-weight: 500;
}
.status-sub {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 500;
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}
.status-tag.ok {
  background: var(--success-light);
  color: #0E7A3E;
}
.status-tag.warn {
  background: var(--warning-light);
  color: #8C5F00;
}

/* ========== Responsive ========== */
@media (max-width: 1200px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .grid-2 { grid-template-columns: 1fr; }
  .quick-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 720px) {
  .hero { flex-direction: column; align-items: flex-start; gap: var(--space-4); }
  .stats { grid-template-columns: 1fr; }
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
