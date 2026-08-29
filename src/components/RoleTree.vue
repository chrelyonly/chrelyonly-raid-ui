<script setup>
import {ref, watch, computed, onMounted} from 'vue'
import RoleAvatar from './RoleAvatar.vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  roles: {
    type: Array,
    required: true
  },
  groups: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['start-drag', 'end-drag', 'add-role', 'role-click'])

const filterText = ref('')
const treeRef = ref(null)

watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

const totalRoles = computed(() => {
  return props.roles.length
})

function onDragStart(role) {
  emit('start-drag', role)
}

function onRoleClick(role) {
  emit('role-click', role.id)
}
</script>

<template>
  <aside class="glass role-library">
    <div class="library-header">
      <div class="header-main">
        <h2>角色库</h2>
        <el-tag size="small" effect="plain" class="count-tag">{{ totalRoles }}</el-tag>
        <el-button size="small" type="primary" plain @click="$emit('add-role')">添加角色</el-button>
      </div>
      <el-input
        v-model="filterText"
        placeholder="搜索角色名或职业..."
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
    </div>

    <div class="tree-container">
      <el-tree
        ref="treeRef"
        :data="groups"
        node-key="id"
        default-expand-all
        :filter-node-method="filterNode"
        class="group-tree"
      >
        <template #default="{ node, data }">
          <!-- 角色节点 -->
          <div
            v-if="data.role"
            class="role-card"
            :class="{
              'is-c': data.role.type == 1 || data.role.type == 2 || data.role.type == 4,
              'is-support': data.role.type == 3
            }"
            draggable="true"
            @dragstart="onDragStart(data.role)"
            @dragend="$emit('end-drag')"
            @click="onRoleClick(data.role)"
          >
            <RoleAvatar :role="data.role" size="small" />
          </div>

          <!-- 用户节点 -->
          <div v-else-if="data.isUser" class="user-label">
            <el-avatar :size="20" :src="data.avatar" class="user-mini-avatar" />
            <span>{{ node.label }}</span>
          </div>

          <!-- 分组节点 -->
          <div v-else class="group-label">
            <span class="dot"></span>
            <span>{{ node.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>
  </aside>
</template>

<style scoped>
.role-library {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 48px);
  position: sticky;
  top: 24px;
}

.library-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-main h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--primary-color);
}

.count-tag {
  border-radius: 6px !important;
  font-weight: 700 !important;
}

.search-input :deep(.el-input__wrapper) {
  background: rgba(0,0,0,0.03);
  box-shadow: none !important;
  border: 1px solid transparent;
  border-radius: 10px;
  height: 36px;
  transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: var(--primary-color);
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  margin-right: -10px;
  padding-right: 10px;
}

.group-tree {
  background: transparent !important;
}

.group-tree :deep(.el-tree-node__content) {
  height: auto !important;
  padding: 0 !important;
  background: transparent !important;
}

.group-tree :deep(.el-tree-node__content:hover) {
  background: transparent !important;
}

/* 分组样式 */
.group-label {
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-sub);
  font-weight: 700;
}

.group-label .dot {
  width: 4px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 50%;
  opacity: 0.5;
}

/* 用户标签 */
.user-label {
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-main);
  font-weight: 600;
}

.user-mini-avatar {
  border: 1px solid rgba(0,0,0,0.05);
}

/* 角色卡片：小型化 */
.role-card {
  width: 100%;
  height: 48px;
  margin: 2px 0;
  padding: 0 10px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  cursor: grab;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.role-card.is-c {
  background: rgba(255, 77, 79, 0.02);
  border-left: 3px solid #ff4d4f;
}

.role-card.is-support {
  background: rgba(82, 196, 26, 0.02);
  border-left: 3px solid #52c41a;
}

.role-card:hover {
  border-color: var(--primary-color);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.role-card.is-c:hover { border-color: #ff4d4f; }
.role-card.is-support:hover { border-color: #52c41a; }

.role-card:active {
  cursor: grabbing;
}

/* 隐藏树的默认缩进线条或增加间距 */
.group-tree :deep(.el-tree-node__children) {
  padding-left: 16px;
}
</style>
