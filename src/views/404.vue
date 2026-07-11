<template>
  <div class="nf">
    <div class="nf-mark" aria-hidden="true">
      <span class="nf-ring" />
      <span class="nf-dot" />
      <span class="nf-code">404</span>
    </div>
    <h1 class="nf-title">路由不存在</h1>
    <p class="nf-sub">控制台没有这个页面的入口，可能是地址输错或权限未开通。</p>
    <div class="nf-actions">
      <el-button type="primary" @click="$router.push('/')">返回控制台</el-button>
      <el-button @click="$router.back()">返回上一页</el-button>
    </div>
  </div>
</template>

<style scoped>
.nf {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  text-align: center;
}
.nf-mark {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: var(--space-4);
  font-family: var(--font-mono);
}
.nf-ring {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  transform: rotate(-6deg);
}
.nf-dot {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--danger);
  box-shadow: 0 0 12px var(--danger);
  animation: blink 2s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.nf-code {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.02em;
  font-style: italic;
}
.nf-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}
.nf-sub {
  color: var(--text-secondary);
  max-width: 420px;
  line-height: 1.6;
}
.nf-actions {
  margin-top: var(--space-4);
  display: flex;
  gap: var(--space-3);
}
</style>
