<template>
  <div class="tags-bar">
    <el-scrollbar>
      <div class="tags-track" role="tablist">
        <button
          v-for="tab in tags.tabs"
          :key="tab.path"
          role="tab"
          :aria-selected="route.path === tab.path"
          class="tag-item"
          :class="{ active: route.path === tab.path, affix: !!tab.affix }"
          @click="go(tab.path)"
        >
          <span class="tag-indicator" aria-hidden="true" />
          <span class="tag-title">{{ tab.title }}</span>
          <span v-if="!tab.affix" class="tag-close" role="button" aria-label="关闭" @click.stop="close(tab.path)">
            <el-icon><Close /></el-icon>
          </span>
        </button>
        <span class="track-spacer" />
      </div>
    </el-scrollbar>
    <!-- 右侧操作：关闭其他 / 关闭所有 -->
    <div class="tags-ops" v-if="tags.tabs.length > 1">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="tags-ops-btn" title="标签操作">
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="closeOthers">关闭其他标签</el-dropdown-item>
            <el-dropdown-item command="closeAll">关闭所有标签</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Close, ArrowDown } from '@element-plus/icons-vue'
import { useTagsStore } from '@/store/tags'

const route = useRoute()
const router = useRouter()
const tags = useTagsStore()

function go(path: string) {
  if (path !== route.path) router.push(path)
}

function close(path: string) {
  const isActive = path === route.path
  const next = tags.removeTab(path)
  if (isActive && next) router.push(next)
}

function handleCommand(cmd: string) {
  const curPath = route.path
  if (cmd === 'closeOthers') {
    tags.tabs
      .filter((t) => t.path !== curPath && !t.affix)
      .slice()
      .forEach((t) => tags.removeTab(t.path))
  } else if (cmd === 'closeAll') {
    const firstAffix = tags.tabs.find((t) => t.affix)
    tags.tabs
      .filter((t) => !t.affix)
      .slice()
      .forEach((t) => tags.removeTab(t.path))
    if (firstAffix && curPath !== firstAffix.path) router.push(firstAffix.path)
    else if (!firstAffix) router.push('/home')
  }
}
</script>

<style scoped>
/* ========== Tabs 标签条（IDE/浏览器风格） ========== */
.tags-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  height: var(--tagsbar-h);
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  position: relative;
  padding: 0;
}
.tags-bar :deep(.el-scrollbar) {
  flex: 1;
  min-width: 0;
  height: 100%;
}
.tags-bar :deep(.el-scrollbar__wrap) {
  overflow-y: hidden;
}
.tags-bar :deep(.el-scrollbar__view) {
  height: 100%;
  display: flex;
  align-items: stretch;
}

.tags-track {
  display: inline-flex;
  align-items: stretch;
  height: 100%;
  padding: 0 var(--space-3);
  gap: 2px;
  position: relative;
}

/* 单个 tab */
.tag-item {
  --tab-h: 30px;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: var(--tab-h);
  margin-top: calc(var(--tagsbar-h) - var(--tab-h) - 1px); /* 底部贴齐 border */
  padding: 0 10px 0 12px;
  background: transparent;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap;
  max-width: 180px;
  flex-shrink: 0;
  user-select: none;
}
.tag-item:hover {
  background: var(--gray-50);
  color: var(--text);
}

/* 激活态：白底"凸起"卡片，下方压出一条品牌色指示线，盖住父级 border-bottom */
.tag-item.active {
  background: var(--surface);
  color: var(--brand);
  border-color: var(--border);
  font-weight: 500;
  /* 用 box-shadow 在底部画一条品牌色线，盖掉父容器 border-bottom */
  box-shadow:
    inset 0 2px 0 -1px var(--brand),
    0 -1px 0 0 var(--border);
  z-index: 2;
}
/* 激活 tab 左右两侧用伪元素做"缺口"效果，视觉上更像浏览器 tab */
.tag-item.active::before,
.tag-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 6px;
  height: 6px;
  pointer-events: none;
}

/* 左侧小竖条指示（保留但弱化：激活时用琥珀色点亮，非激活透明） */
.tag-indicator {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
  flex-shrink: 0;
  transition: all 0.2s;
}
.tag-item.active .tag-indicator {
  background: var(--accent);
  opacity: 1;
  box-shadow: 0 0 6px rgba(245, 176, 66, 0.6);
}

.tag-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
}

/* 关闭按钮：默认半透明缩小，hover/激活时显现 */
.tag-close {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 11px;
  flex-shrink: 0;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.15s;
  margin-left: 2px;
}
.tag-item:hover .tag-close,
.tag-item.active .tag-close {
  opacity: 1;
  transform: scale(1);
}
.tag-close:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--text);
}
.tag-item.active .tag-close:hover {
  background: var(--brand-light);
  color: var(--brand);
}
.affix .tag-close { display: none; }

/* 尾部占位：吸收剩余空间让 track 不贴边 */
.track-spacer {
  flex: 1;
  min-width: 4px;
  height: 1px;
}

/* 右侧操作 */
.tags-ops {
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  border-left: 1px solid var(--border-light);
  flex-shrink: 0;
}
.tags-ops-btn {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s;
  font-size: 12px;
}
.tags-ops-btn:hover {
  background: var(--gray-100);
  color: var(--text);
}

/* 紧凑模式下隐藏"关闭所有"等溢出菜单文字，只保留图标 — 这里保持默认即可 */
</style>
