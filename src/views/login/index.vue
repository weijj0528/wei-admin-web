<template>
  <div class="login">
    <!-- 左侧品牌面板（控制台深空） -->
    <div class="brand-panel">
      <!-- 背景几何：网格 + 光晕 -->
      <div class="bg-grid" aria-hidden="true" />
      <div class="bg-glow" aria-hidden="true" />
      <div class="bg-orbit" aria-hidden="true" />

      <div class="brand-content">
        <!-- 纯 CSS 几何徽标：w 在方框里 + 琥珀点 -->
        <div class="brand-mark" aria-hidden="true">
          <span class="ring ring-outer" />
          <span class="ring ring-inner" />
          <span class="mark-dot" />
          <span class="mark-w">{ w }</span>
          <span class="mark-caret" />
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

        <div class="form-row">
          <el-form-item prop="tenant" class="tenant-item">
            <el-input v-model="form.tenant" placeholder="租户 ID" :prefix-icon="OfficeBuilding">
              <template #append>.ten</template>
            </el-input>
          </el-form-item>
        </div>

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
import { User, Lock, OfficeBuilding } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({ username: '', password: '', tenant: '1' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  tenant: [{ required: true, message: '请输入租户 ID', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const loginInfo = {
        tenant: form.tenant,
        username: form.username,
        password: btoa(form.password),
      }
      await userStore.login('userPwdLogin', loginInfo)
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

/* 几何徽标 */
.brand-mark {
  position: relative;
  width: 68px;
  height: 68px;
  margin-bottom: var(--space-7);
  font-family: var(--font-mono);
}
.ring {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  border: 1px solid rgba(59, 91, 255, 0.5);
}
.ring-outer {
  transform: rotate(0deg);
}
.ring-outer::before,
.ring-outer::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--brand);
  border-radius: 50%;
}
.ring-outer::before { top: -3px; left: 12px; box-shadow: 0 0 8px var(--brand); }
.ring-outer::after { bottom: -3px; right: 12px; box-shadow: 0 0 8px var(--brand); }
.ring-inner {
  inset: 10px;
  border-color: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(59, 91, 255, 0.12), rgba(245, 176, 66, 0.04));
}
.mark-dot {
  position: absolute;
  top: 18px;
  left: 18px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent), 0 0 24px rgba(245, 176, 66, 0.6);
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink {
  0%, 92%, 100% { opacity: 1; }
  95% { opacity: 0.3; }
}
.mark-w {
  position: absolute;
  inset: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  font-style: italic;
  color: #fff;
  letter-spacing: -1px;
  padding-left: 8px; /* 给点留位 */
}
.mark-caret {
  position: absolute;
  right: 14px;
  bottom: 18px;
  width: 2px;
  height: 14px;
  background: var(--accent);
  animation: caret 1.1s steps(2) infinite;
  box-shadow: 0 0 8px var(--accent);
}
@keyframes caret {
  50% { opacity: 0; }
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
}
.login-form :deep(.el-input__wrapper) {
  padding: 4px 14px;
  border-radius: var(--radius);
}
.login-form :deep(.el-input__inner) {
  height: 42px;
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
