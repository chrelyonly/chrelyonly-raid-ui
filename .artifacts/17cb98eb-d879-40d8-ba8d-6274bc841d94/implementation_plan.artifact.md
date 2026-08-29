# DNF 排班功能重构方案

目前 `home.vue` 文件过于臃肿（约 900 行），集成了数据处理、拖拽逻辑、多个 UI 模块以及大量样式。本次重构的目标是提高代码的可维护性、可扩展性，并优化组件结构。

## 用户评审确认

- [ ] **组件化**：将页面拆分为多个独立组件，降低 `home.vue` 的复杂度。
- [ ] **逻辑提取**：使用 Composition API (Composable) 提取核心逻辑，如拖拽处理和数据管理。
- [ ] **样式优化**：提取公共样式，减少重复。

## 提议的变更

### 1. 逻辑层提取 (Composable)

#### [NEW] [useRoster.js](file:///D:/dev/project/chrelyonly-raid/chrelyonly-raid-ui/src/composables/useRoster.js)
提取角色数据、波次数据以及相关的增删改查逻辑。

#### [NEW] [useDragAndDrop.js](file:///D:/dev/project/chrelyonly-raid/chrelyonly-raid-ui/src/composables/useDragAndDrop.js)
提取复杂的拖拽状态管理逻辑，使其与 UI 分离。

---

### 2. 组件层拆分 (Components)

#### [NEW] [RoleAvatar.vue](file:///D:/dev/project/chrelyonly-raid/chrelyonly-raid-ui/src/components/RoleAvatar.vue)
基础组件，用于显示角色头像、名称和职业信息。

#### [NEW] [WaveRow.vue](file:///D:/dev/project/chrelyonly-raid/chrelyonly-raid-ui/src/components/WaveRow.vue)
表示波次排班表中的一行，包含 4 个角色槽位和操作按钮。

#### [NEW] [RoleTree.vue](file:///D:/dev/project/chrelyonly-raid/chrelyonly-raid-ui/src/components/RoleTree.vue)
右侧角色库树形列表。

#### [NEW] [WaveDialog.vue](file:///D:/dev/project/chrelyonly-raid/chrelyonly-raid-ui/src/components/WaveDialog.vue)
新建/编辑波次的弹窗组件。

---

### 3. 主页面重构

#### [MODIFY] [home.vue](file:///D:/dev/project/chrelyonly-raid/chrelyonly-raid-ui/src/views/home.vue)
重构为布局容器，引用上述组件，代码量将显著减少。

---

## 验证计划

### 自动化测试
- 编写 Composable 的单元测试，验证波次创建、角色分配等逻辑。

### 手动验证
- 验证拖拽角色进入槽位的功能是否正常。
- 验证角色职能限制（输出/辅助位置限制）是否生效。
- 验证新建、编辑、删除波次功能。
- 验证拖拽删除功能。
