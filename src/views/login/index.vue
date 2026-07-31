<template>
  <div class="login">
    <!-- 左侧品牌面板（控制台深空） -->
    <div class="brand-panel">
      <!-- 背景几何：网格 + 光晕 -->
      <div class="bg-grid" aria-hidden="true" />
      <div class="bg-glow" aria-hidden="true" />
      <div class="bg-orbit" aria-hidden="true" />

      <div class="brand-content">
        <!-- SVG 品牌标记 -->
        <div class="brand-mark" aria-hidden="true">
          <WMark />
        </div>

        <p class="brand-eyebrow">
          <span class="eyebrow-dot" />
          wei-saas · control console
        </p>
        <h1 class="brand-title">
          多租户平台的<br />
          <em>驾驶舱</em>。
        </h1>
        <p class="brand-sub">
          一个控制台，管理平台、租户、机构、角色与按钮级权限。<br />
          用最少的页面，覆盖最复杂的权限拓扑。
        </p>

        <div class="brand-specs" aria-label="能力规格">
          <div class="spec">
            <span class="spec-k">多租户</span>
            <span class="spec-v">三级隔离</span>
          </div>
          <div class="spec">
            <span class="spec-k">权限粒度</span>
            <span class="spec-v">按钮级 RBAC</span>
          </div>
          <div class="spec">
            <span class="spec-k">扩展</span>
            <span class="spec-v">微前端 wujie</span>
          </div>
        </div>
      </div>

      <footer class="brand-foot">
        <span>© wei-saas</span>
        <span class="foot-sep">·</span>
        <span>v2.0</span>
      </footer>
    </div>

    <!-- 右侧表单 -->
    <div class="form-panel">
      <div class="form-head">
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-hint">登录你的管理员账号，进入控制台</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0" size="large" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名 / 手机号"
            :prefix-icon="User"
            autocomplete="username"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            show-password
            :prefix-icon="Lock"
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            size="large"
            @click="handleLogin"
          >
            <span v-if="!loading">进入控制台</span>
            <span v-else>正在登录…</span>
          </el-button>
        </el-form-item>
      </el-form>

      <div class="form-meta">
        <span class="meta-k">提示</span>
        <span class="meta-v">首次使用请联系系统管理员开通账号</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import WMark from '@/components/WMark.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const loginInfo = {
        username: form.username,
        password: btoa(form.password),
      }
      const loginData: any = await userStore.login('userPwdLogin', loginInfo)
      // 同步当前平台为后端 token 平台，避免前端 currentPlatform 与 token 实际平台不同步
      if (loginData?.platform) appStore.currentPlatform = loginData.platform
      await userStore.fetchUserInfo()
      await userStore.fetchPermission()
      ElMessage.success('已进入控制台')
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } catch (e) {
      // request 拦截器已 toast
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login {
  display: flex;
  height: 100vh;
  background: var(--bg);
}

/* ========== 左侧品牌面板 ========== */
.brand-panel {
  flex: 1;
  background:
    radial-gradient(ellipse 90% 60% at 20% 10%, rgba(59, 91, 255, 0.25), transparent 60%),
    radial-gradient(ellipse 70% 50% at 80% 90%, rgba(245, 176, 66, 0.12), transparent 60%),
    linear-gradient(160deg, #070B1A 0%, #0F1530 55%, #131B3D 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-8) var(--space-9);
  position: relative;
  overflow: hidden;
  min-width: 480px;
}

/* 网格背景 */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 30% 40%, #000 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 30% 40%, #000 30%, transparent 80%);
}
/* 冷色光晕 */
.bg-glow {
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 91, 255, 0.35) 0%, rgba(59, 91, 255, 0) 70%);
  top: -120px;
  right: -120px;
  filter: blur(20px);
}
/* 琥珀轨道装饰环 */
.bg-orbit {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  border: 1px dashed rgba(245, 176, 66, 0.2);
  bottom: -80px;
  right: 8%;
  animation: orbit-spin 60s linear infinite;
}
.bg-orbit::after {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent), 0 0 30px rgba(245, 176, 66, 0.6);
  transform: translateX(-50%);
}
@keyframes orbit-spin {
  to { transform: rotate(360deg); }
}

.brand-content {
  position: relative;
  z-index: 2;
  max-width: 460px;
}

/* SVG 品牌标记 */
.brand-mark {
  width: 72px;
  height: 72px;
  margin-bottom: var(--space-7);
  color: #fff;
}

.brand-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--deep-text-dim);
  text-transform: lowercase;
  margin-bottom: var(--space-5);
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}
.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

.brand-title {
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-4);
}
.brand-title em {
  font-style: normal;
  background: linear-gradient(120deg, var(--accent-hover) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand-sub {
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--deep-text-dim);
  margin-bottom: var(--space-7);
  max-width: 420px;
}

/* 三格规格卡 */
.brand-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 440px;
}
.spec {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius);
  padding: 12px 14px;
  backdrop-filter: blur(8px);
}
.spec-k {
  display: block;
  font-size: 11px;
  color: var(--deep-text-mute);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
  font-family: var(--font-mono);
}
.spec-v {
  display: block;
  font-size: var(--text-base);
  color: #fff;
  font-weight: 500;
}

.brand-foot {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--deep-text-mute);
  font-family: var(--font-mono);
}
.foot-sep { opacity: 0.4; }

/* ========== 右侧表单 ========== */
.form-panel {
  width: 520px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-8) var(--space-8);
  background: var(--surface);
  position: relative;
}
.form-head {
  margin-bottom: var(--space-6);
}
.form-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
  margin-bottom: var(--space-2);
}
.form-hint {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.login-form {
  margin-top: var(--space-2);
  /* 局部对齐 EP 输入框背景变量：默认/hover 均白底，与表单面板一致 */
  --el-fill-color-blank: var(--surface);
  --el-fill-color-light: var(--surface);
  --el-input-bg-color: var(--surface);
  --el-input-hover-bg-color: var(--surface);
}
.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

/* 输入框容器：白底 + 内描边 + 过渡。
   padding 上下 1px：为 autofill 盖白留出 wrapper 描边空间，
   否则 inner 的 inset 阴影会遮住上下描边。 */
.login-form :deep(.el-input__wrapper) {
  padding: 1px 16px;
  height: 48px;
  border-radius: var(--radius-md);
  background-color: var(--surface);
  box-shadow: 0 0 0 1px var(--border) inset;
  transition: box-shadow 0.2s ease;
}
.login-form :deep(.el-input__wrapper:hover) {
  background-color: var(--surface);
  box-shadow: 0 0 0 1px var(--border-strong) inset;
}
/* 聚焦：白底 + 品牌色描边 + 光晕（覆盖全局 is-focus） */
.login-form :deep(.el-input__wrapper.is-focus) {
  background-color: var(--surface);
  box-shadow: 0 0 0 1px var(--brand) inset, var(--shadow-glow) !important;
}
.login-form :deep(.el-input__inner) {
  font-size: var(--text-lg);
  color: var(--text);
  background-color: transparent;
}
.login-form :deep(.el-input__inner::placeholder) {
  color: var(--gray-400);
}
/* Chrome 自动填充会给 input 强加淡蓝背景(#E8F0FE)，且用 !important 无法用
   background-color 覆盖。用超大 inset box-shadow 把背景盖成面板同色，
   配合 5000s transition 冻结 autofill 背景变化，避免输入区域与外部色差。 */
.login-form :deep(.el-input__inner:-webkit-autofill),
.login-form :deep(.el-input__inner:-webkit-autofill:hover),
.login-form :deep(.el-input__inner:-webkit-autofill:focus) {
  -webkit-text-fill-color: var(--text);
  caret-color: var(--text);
  -webkit-box-shadow: 0 0 0 1000px var(--surface) inset;
  box-shadow: 0 0 0 1000px var(--surface) inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* 前缀图标：聚焦时跟随品牌色，强化交互反馈 */
.login-form :deep(.el-input__prefix) {
  color: var(--text-tertiary);
  transition: color 0.2s ease;
}
.login-form :deep(.el-input__prefix-inner) {
  margin-right: 4px;
  font-size: 18px;
}
.login-form :deep(.el-input__wrapper.is-focus .el-input__prefix) {
  color: var(--brand);
}

/* 密码显示按钮：hover 跟随品牌色 */
.login-form :deep(.el-input__password) {
  color: var(--text-tertiary);
  transition: color 0.2s ease;
}
.login-form :deep(.el-input__password:hover) {
  color: var(--brand);
}

.form-row { display: flex; gap: var(--space-3); }
.tenant-item { flex: 1; }
.tenant-item :deep(.el-input-group__append) {
  background: var(--gray-50);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.submit-btn {
  width: 100%;
  height: 46px;
  font-size: var(--text-base);
  font-weight: 600;
  letter-spacing: 0.02em;
  margin-top: var(--space-2);
  position: relative;
  overflow: hidden;
}
.submit-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left 0.6s ease;
}
.submit-btn:hover::after { left: 120%; }

.form-meta {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px dashed var(--border-light);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}
.meta-k {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 6px;
  background: var(--accent-soft);
  color: #A6700F;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
