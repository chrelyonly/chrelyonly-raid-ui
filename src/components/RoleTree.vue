<script setup>
import { computed } from 'vue'
import RoleAvatar from './RoleAvatar.vue'

const props = defineProps({
  roles: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['start-drag', 'end-drag'])

const groups = computed(() => [
  {
    label: '阿拉德群',
    children: [
      {
        label: '团长·苍穹',
        children: props.roles.slice(0, 4).map(role => ({
          id: role.id,
          label: `${role.name} · ${role.job}`,
          role,
        })),
      },
      {
        label: '奶妈小队',
        children: props.roles.slice(4).map(role => ({
          id: role.id,
          label: `${role.name} · ${role.job}`,
          role,
        })),
      },
    ],
  },
  {
    label: '固定团二群',
    children: [
      {
        label: '晚间团',
        children: props.roles.slice(2, 6).map(role => ({
          id: role.id,
          label: `${role.name} · ${role.job}`,
          role,
        })),
      },
    ],
  },
])

function onDragStart(role) {
  emit('start-drag', role)
}
</script>

<template>
  <aside class="glass members">
    <div class="member-title">
      <div>
        <h2>角色库</h2>
        <span>从群分组获取角色</span>
      </div>
      <el-tag>{{ roles.length }} 人</el-tag>
    </div>

    <el-tree
      :data="groups"
      node-key="id"
      default-expand-all
      class="group-tree"
    >
      <template #default="{ node, data }">
        <!-- 角色节点 -->
        <div
          v-if="data.role"
          class="tree-role"
          draggable="true"
          @dragstart="onDragStart(data.role)"
          @dragend="$emit('end-drag')"
        >
          <RoleAvatar :role="data.role" size="small" />
        </div>

        <!-- 分组节点 -->
        <div v-else class="tree-group">
          <span>{{ node.label }}</span>
        </div>
      </template>
    </el-tree>
  </aside>
</template>

<style scoped>
.glass {
  background: #ffffffb8;
  border: 1px solid #ffffffd1;
  box-shadow: 0 14px 35px rgba(73, 96, 82, 0.09);
  backdrop-filter: blur(14px);
  border-radius: 12px;
}

.members {
  padding: 23px;
  min-height: 500px;
}

.member-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.member-title h2 {
  margin: 0;
  font-size: 22px;
  color: #143e33;
}

.member-title span {
  color: #8a958d;
  font-size: 13px;
}

.group-tree {
  background: transparent;
  color: #23332e;
}

.group-tree :deep(.el-tree-node__content) {
  height: 48px;
  border-radius: 10px;
  margin-bottom: 4px;
}

.group-tree :deep(.el-tree-node__content:hover) {
  background: #eaf2ed;
}

.tree-group {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #728078;
  font-weight: 600;
}

.tree-role {
  width: 100%;
  display: flex;
  align-items: center;
  cursor: grab;
  user-select: none;
}

.tree-role:active {
  cursor: grabbing;
}
</style>
