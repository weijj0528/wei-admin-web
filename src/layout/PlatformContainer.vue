<template>
  <div class="platform-container">
    <!-- 加载失败兜底（评审补强 CRITICAL 1） -->
    <el-result v-if="loadError" icon="error" title="子应用加载失败" :sub-title="errorMsg">
      <template #extra>
        <el-button type="primary" @click="retry">重试</el-button>
        <el-button @click="$router.push('/home')">返回首页</el-button>
      </template>
    </el-result>

    <!-- 未配置入口 URL -->
    <el-empty v-else-if="!entryUrl" description="该平台未配置子应用入口URL，请在平台管理中设置 entryUrl" />

    <!-- WujieVue 必须始终挂载：beforeLoad 会置 loading=true，
         若用 v-if 在加载瞬间卸载组件，会导致子应用启动中断、iframe 0 资源加载而超时 -->
    <div v-else class="subapp-wrap">
      <div v-if="loading" class="loading-mask">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>子应用加载中...</p>
      </div>

      <!-- wujie 子应用挂载点 -->
      <WujieVue
        :key="remountKey"
        :name="platformCode"
        :url="entryUrl"
        :props="microProps"
        :sync="true"
        :afterMount="handleMounted"
        :beforeLoad="handleBeforeLoad"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import WujieVue from 'wujie-vue3'
import { useAppStore } from '@/store/app'
import { buildMicroProps } from '@/micro/props'
import { reportError } from '@/utils/errorReport'

const route = useRoute()
const appStore = useAppStore()

const platformCode = computed(() => route.params.platformCode as string)
const entryUrl = computed(() => {
  const platform = appStore.platforms.find((p) => p.code === platformCode.value)
  return platform?.entryUrl || ''
})

const loading = ref(false)
const loadError = ref(false)
const errorMsg = ref('')
const microProps = computed(() => buildMicroProps())

let timeoutHandle: ReturnType<typeof setTimeout> | null = null

function handleBeforeLoad() {
  loading.value = true
  loadError.value = false
  // 10s 超时
  timeoutHandle = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      loadError.value = true
      errorMsg.value = `子应用 ${platformCode.value} 加载超时（10s），入口：${entryUrl.value}`
      reportError('subapp-load-timeout', `${platformCode.value} timeout`, entryUrl.value)
    }
  }, 10000)
}

function handleMounted() {
  loading.value = false
  if (timeoutHandle) clearTimeout(timeoutHandle)
}

function retry() {
  loadError.value = false
  loading.value = false
  // 重新挂载：通过 key 变化触发重渲染
  remountKey.value++
}

const remountKey = ref(0)

onBeforeUnmount(() => {
  if (timeoutHandle) clearTimeout(timeoutHandle)
})
</script>

<style scoped>
.platform-container {
  height: 100%;
}
.subapp-wrap {
  position: relative;
  height: 100%;
  min-height: 400px;
}
.loading-mask {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #fff;
  color: #909399;
}
</style>
