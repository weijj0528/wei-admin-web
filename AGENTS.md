# AGENTS.md — wei-admin-web（前端底座）

wei-saas 管理后台**主应用**。Vue 3 + Vite + Element Plus + Pinia + vue-router + wujie-vue3 微前端底座，负责登录鉴权、菜单/平台/权限、加载业务子应用。被主仓 `wei-saas` 以 git submodule 引入。

> 后端约定见主仓 `../AGENTS.md`；子应用模板见 `../wei-admin-app/AGENTS.md`。

## 技术栈与命令

- Vue 3.5（`<script setup lang="ts">`）、Vite 8、TypeScript 6、Pinia 3、vue-router 5、Element Plus 2.14（中文 `zh-cn`）、wujie-vue3 2、axios
- 路径别名 `@` → `src`
- 命令：
  ```bash
  npm install
  npm run dev        # http://localhost:8000（被占递增 8001…）
  npm run build      # vue-tsc -b 类型检查 + vite build
  npx vue-tsc -b     # 仅类型检查
  npm run preview
  ```
- dev 代理：`/admin`、`/api` → `http://localhost:8080`，`stripOrigin` 在 `proxyReq` 时移除 `origin` 头，避免后端 CORS 过滤器返回 "Invalid CORS request"
- WSL 场景开启 `server.watch.usePolling`（drvfs 无 inotify）

## 目录结构

```
src/
├── api/             后端接口封装（按模块：system/、org/、auth.ts、dict.ts、user.ts、operationLog.ts）
├── components/      通用组件：ListLayout / SearchBar / IconPicker / WMark / JsonSchemaBuilder / JsonSchemaForm
├── composables/     useCrud（列表页搜索/分页/增删改）
├── layout/          index / Header / Sidebar / SidebarItem / TagsBar / PlatformContainer(子应用容器)
├── micro/props.ts   buildMicroProps() 构建下发给 wujie 子应用的 props
├── router/          静态路由 + 全局守卫（token、拉取用户/权限/平台）
├── store/           Pinia：user（token/buttons/menus/模块）、app（侧边栏/平台）、tags（多标签）
├── utils/           request / auth / permission / dynamicComponent / errorReport / jsonSchema
├── views/           页面：home/ login/ system/ org/ user/ dict/ operationLog/
├── App.vue  main.ts  style.css
```

## 后端联调约定

- **请求双头**：拦截器对每个请求同时带
  - `Authorization: Bearer <token>`（后端 `WeiTokenFilter` 读取）
  - `token: <token>`（Controller `@RequestHeader String token` 读取）
- **token 存储**：`localStorage['wei_admin_token']`（见 `utils/auth.ts`）
- **统一响应**：后端 `Result<T>`，成功码为字符串 `"20000"`，错误码 `"50000"`；响应拦截器判断 `String(res.code) !== '20000'` 即 `ElMessage.error` 并 reject，成功时返回 `res.data`（有 `data` 字段）或整个 `res`
- **401 刷新**：响应拦截器用 `refreshing` 标志单飞调用 `/admin/auth/refresh`，成功后 `setToken` 并重放原请求；失败清 token 跳 `/login?redirect=`
- **数组参数**：`paramsSerializer: { indexes: null }`，序列化为重复键 `types=SYS&types=TENANT` 供 Spring 绑定 `String[]`
- **平台切换取消在途**：`cancelAllPendingRequests()` 取消所有未完成请求（axios CancelToken），避免旧平台数据回灌

## 认证与权限

- 路由守卫（`router/index.ts`）：有 token 且 `userStore.username` 为空时拉 `fetchUserInfo()` + `fetchPermission()`；同时预拉 `appStore.fetchPlatforms()`（不阻塞导航，但保证子应用 props 就绪）
- `userStore.fetchUserInfo()` 取 `GET /admin/auth/userInfo`，写入 `userId/username/buttons`，并把 `buttons` 备份到 `localStorage['wei_admin_buttons']`
- `userStore.fetchPermission()` 取 `GET /admin/auth/permission` 菜单树（MODULE→GROUP→PAGE）
- **按钮权限指令** `v-permission="['user:save']"`（`utils/permission.ts`）：mounted 时取 buttons，任一命中则保留，否则 `parentNode.removeChild(el)`。buttons 来源优先级：`window.$wujie.props.buttons`（在子应用内）> `localStorage['wei_admin_buttons']`（底座）
- 后端按钮权限标识为菜单 FUNC 的 `routePath`（如 `system:api:scan`、`user:save`），与 `@OpLog`/Controller 路径对应；所有业务按钮应绑 `v-permission`

## 菜单驱动与动态组件

- 顶部 MODULE → 左侧 GROUP/PAGE 两级侧边栏；`userStore.syncModuleFromRoute(path)` 按当前路由反查选中 MODULE
- **动态组件**（`utils/dynamicComponent.ts`）：
  - `import.meta.glob('@/views/**/*.vue')` 预建映射
  - `loadComponent(component)`：菜单 `component` 为相对 `views` 的路径（如 `system/platform/index`）→ 异步组件
  - `isSubAppUrl(component)`：`http(s)://` 开头视为子应用入口，交 wujie 加载
- **首页菜单驱动**（`views/home/HomeContainer.vue`）：
  - 首页 = 顶层 `routePath==='/home'` 的 MODULE → 其下 GROUP → PAGE（均已按权限过滤）
  - 多个首页 PAGE 渲染为 tab 切换；`component` 为本地路径动态加载，为 URL 则 wujie 加载
  - 平台切换后首页列表变化自动重选第一个
  - 旧的 `views/home/index.vue` 为内置欢迎页组件，可作为本地首页 component 使用

## 微前端（wujie）

- `main.ts` `app.use(WujieVue)` 注册
- **平台维度子应用**：路由 `platform/:platformCode/:pathMatch(.*)*` → `layout/PlatformContainer.vue`。入口 URL 取自 `appStore.platforms` 中对应平台的 `entryUrl`；未配置显示空状态
- **首页维度子应用**：`HomeContainer.vue` 用菜单 PAGE.component（http URL）作为 wujie url
- **下发 props**（`micro/props.ts` `buildMicroProps()`）：`{ token, userInfo:{userId,username}, buttons, currentPlatform }`；子应用经 `window.$wujie.props` 读取
- **bus 事件**：`Header.vue` 平台切换时 `WujieVue.bus.$emit('platform-change', platform)`，子应用订阅后同步平台
- **加载健壮性**：
  - `WujieVue` 必须**始终挂载**（不能用 `v-if` 在加载瞬间卸载），否则 iframe 0 资源加载导致超时；用 loading 遮罩覆盖
  - `beforeLoad` 启动 10s 超时计时器，`afterMounted` 清除；超时显示错误结果 + 重试（`remountKey++` 重挂载）+ 返回首页
  - 失败/超时调 `reportError` 上报
  - `:sync="true"` 同步子应用路由

## 平台切换流程（Header.vue）

1. `switching` 防重入，相同平台直接返回
2. `cancelAllPendingRequests()` 取消在途请求
3. `await switchPlatform(platform)` → `POST /admin/auth/switchPlatform?platform=`（后端改 token 平台并重算 apiPerm）
4. `appStore.currentPlatform = platform`，`WujieVue.bus.$emit('platform-change', platform)`
5. `await userStore.fetchPermission()` 重拉菜单（平台不同菜单不同）

## 错误上报（utils/errorReport.ts）

- 使用**独立 axios 实例**（8s 超时，不走业务拦截器），避免上报失败触发响应拦截器里的 `reportError` 造成无限重试
- POST `/admin/operationLog/report`（后端在 open-apis 白名单，不鉴权），仅附带 token 头便于记录操作人
- payload：`operation` = `[前端-<type>] <message>`；`method` 传 `window.location.pathname`（列 varchar(128)，**勿传长堆栈**，防截断）；`errorMsg` 存详情/堆栈；`status=1`
- 上报静默、失败即丢弃、绝不重试
- 触发点：`app.config.errorHandler`（Vue 错误）、响应拦截器（API 业务错误/网络错误）、子应用加载超时

## 列表页范式

- `composables/useCrud.ts`：封装 `loading/submitting/tableData/dialogVisible/editForm/search/pagination` 与 `fetchData/handleSearch/handleReset/handlePageChange/handleSizeChange/handleAdd/handleEdit/handleDelete/handleSubmit`
  - `api` 需实现 `{ list, create, update, delete }`
  - 支持服务端分页（`{list,total}` 或 `{records,total}`）与数组返回（客户端分页，树表设 `clientSidePagination:false`）
  - 删除走 `ElMessageBox.confirm`
- `components/ListLayout.vue`：列表壳，props `title/page/pageSizes/hidePagination`，slots `search/actions/default(表格)/dialog`；全局 `.page/.el-card` 样式固定表格高度、表体滚动、分页吸底
- `components/SearchBar.vue`：配置式搜索栏（fields 定义字段）
- 参考实现：`views/system/api/index.vue`、`views/system/platform/index.vue`

## 字典 OBJECT 类型（JSON Schema）

- `utils/jsonSchema.ts`：JSON Schema 子集工具。可视化字段类型 `FieldType`（string/number/integer/boolean/date/time/datetime/enum/enumMulti/array），与 schema 关键字映射
- `components/JsonSchemaBuilder.vue`：字典类型 `dataType=OBJECT` 时可视化编辑 properties/required/校验规则，产出 schema 存入 `validation_rule`
- `components/JsonSchemaForm.vue`：按 schema 动态渲染字典值表单
- 支持的关键字：顶层 `type/properties/required`；property `type/format/title/description/enum/enumNames/default/minLength/maxLength/minimum/maximum/pattern/items`（基础平铺，不含嵌套对象）

## 品牌与样式

- `components/WMark.vue`：WMark SVG 品牌徽标，登录页/首页/侧边栏统一使用
- `style.css` 定义设计 token（`--brand`、`--surface`、`--radius`、`--space-*`、`--text-*` 等），组件优先引用变量而非硬编码
- Element Plus 全局注册所有 `@element-plus/icons-vue` 图标，模板中直接 `<component :is="iconName" />`

## 关键约定与陷阱

1. **路由 name 与后端菜单 routeName 对齐**：静态路由 `name`（如 `Platform`/`Menu`/`Api`/`Employee`）必须与后端 `sys_menu.route_name` 一致，权限高亮、按钮 `v-permission`、`syncModuleFromRoute` 依赖此对应
2. **新增页面**：在 `router/index.ts` 注册路由（name 对齐菜单）+ `views/` 建页面；后端通过 `/admin/sys/api/scan` 注册接口并关联菜单，前端按钮加 `v-permission`
3. **子应用挂载点不要 v-if**：见微前端章节，瞬时卸载会致 wujie iframe 加载 0 资源而超时
4. **错误上报 method 字段短**：varchar(128)，传页面路径，堆栈放 `errorMsg`
5. **401 刷新单飞**：已有 `refreshing` 标志，勿在业务代码里再并发刷新
6. **独立运行子应用调试**：子应用 dev 端口默认 8100，需 `server.cors:true`；平台 `entryUrl` 填 `http://localhost:8100/`
7. **构建必须过类型检查**：`npm run build` 含 `vue-tsc -b`，提交前确保无类型错误
8. **改动后用 Playwright 测试**（项目本地约定）：至少覆盖登录、菜单/平台切换、关键列表页与子应用加载
9. **本仓为 submodule**：常在 detached HEAD，提交后需 `git branch -f main HEAD && git checkout main` 关联到 main 分支，再到主仓 `git add wei-admin-web` 更新指针；不要把 node_modules/dist 纳入提交
