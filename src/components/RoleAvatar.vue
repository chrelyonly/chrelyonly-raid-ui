<script setup>
import { Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  role: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'medium' // 'small' | 'medium'
  },
  showDelete: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete'])

function getRoleTagType(type) {
  const map = {
    '辅助': 'success',
    '3': 'success',
    3: 'success',
    '大C': 'danger',
    '1': 'danger',
    1: 'danger',
    '小C': 'warning',
    '2': 'warning',
    2: 'warning',
    '混子': 'info',
    '4': 'info',
    4: 'info'
  }
  return map[type] || 'info'
}

function getRoleTypeName(type) {
  if (type == 1 || type == 2 || type == 4) return '输出'
  if (type == 3) return '辅助'
  return type
}

function handleDelete() {
  ElMessageBox.confirm(
    `确定要永久删除角色「${props.role.name}」吗？`,
    '风险操作确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '手滑了',
      type: 'warning',
      buttonSize: 'default',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    emit('delete')
  }).catch(() => {})
}
</script>

<template>
  <div class="role-avatar-wrapper" :class="size">
    <div class="avatar-container">
      <img
        v-if="role.jobImage"
        class="avatar-img job-icon"
        :src="`/image/jobs/${role.jobImage}`"
        alt="job"
      />
    </div>
    <div class="role-info">
      <b class="name">{{ role.name }}</b>
      <div class="detail-row" v-if="size !== 'small'">
        <small class="detail">
          <span v-if="role.reputation">🔪· {{ role.reputation }}w</span>
          🍼· {{ role.damage }}
        </small>
        <el-tag size="small" :type="getRoleTagType(role.type)" class="mini-tag" v-if="role.type">
          {{ getRoleTypeName(role.type) }}
        </el-tag>
      </div>
      <div class="detail-row" v-else>
         <small class="detail">
           <span >{{ role.reputation }}w · </span>
           <span v-if="role.type !== 3">🔪{{ role.damage }}E</span>
           <span v-else>🍼{{ role.damage }}</span>

         </small>
      </div>
    </div>
    <div v-if="showDelete" class="delete-action" @click.stop="handleDelete">
      <el-icon class="delete-btn-icon"><Delete /></el-icon>
    </div>
  </div>
</template>

<style scoped>
.role-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  width: 100%;
}

.avatar-container {
  position: relative;
  flex: 0 0 64px; /* 从 44px 增加到 64px */
  width: 64px;
  height: 64px;
}

.avatar, .avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 900;
  font-size: 24px; /* 增加字体 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.8);
  object-fit: cover;
}

.job-icon {
  border-radius: 12px;
  background: #1a1a1a;
  border-color: #d4af37;
}

.user-mini-overlay {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px; /* 增加小头像尺寸 */
  height: 24px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2;
}

.role-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 22px; /* 从 16px 增加 */
  color: #081a15;
  font-weight: 900;
}

@media (max-width: 480px) {
  .name {
    font-size: 18px;
  }
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail {
  color: #3d4d44;
  font-size: 16px; /* 从 12px 增加 */
  font-weight: 800;
}

@media (max-width: 480px) {
  .detail {
    font-size: 14px;
  }
}

.mini-tag {
  height: 24px !important;
  line-height: 22px !important;
  font-size: 14px !important;
  padding: 0 8px !important;
}

/* Small size variant for compact wave grid */
.small .avatar-container {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
}

.small .avatar, .small .avatar-img {
  font-size: 18px;
  border-width: 2px;
}

.small .name {
  font-size: 18px;
}

.small .detail {
  font-size: 14px;
}

.small .role-info {
  gap: 0;
}

.delete-action {
  padding: 8px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-avatar-wrapper:hover .delete-action {
  opacity: 1;
}

.delete-action:hover {
  color: #ff4d4f;
  transform: scale(1.2);
}

.delete-btn-icon {
  font-size: 18px;
}
</style>
