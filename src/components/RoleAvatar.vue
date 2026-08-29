<script setup>
defineProps({
  role: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'medium' // 'small' | 'medium'
  }
})

function getRoleTagType(type) {
  const map = {
    辅助: 'success',
    大C: 'danger',
    小C: 'warning',
    混子: 'info',
  }
  return map[type] || 'info'
}
</script>

<template>
  <div class="role-avatar-wrapper" :class="size">
    <span
      class="avatar"
      :style="{ background: role.color }"
    >
      {{ role.name.slice(0, 1) }}
    </span>
    <div class="role-info">
      <b class="name">{{ role.name }}</b>
      <small class="detail">{{ role.job }} · {{ role.damage }}</small>
      <el-tag size="small" :type="getRoleTagType(role.type)">
        {{ role.type }}
      </el-tag>
    </div>
  </div>
</template>

<style scoped>
.role-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  width: 100%;
}

.avatar {
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border-radius: 50%; /* 圆形更可爱 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.role-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #18382f; /* 同步 style.css 的文字颜色 */
}

.detail {
  color: #839087;
  font-size: 11px;
}

/* Small size variant for tree */
.small .avatar {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  font-size: 12px;
}

.small .name {
  font-size: 13px;
}

.small .detail {
  font-size: 10px;
}
</style>
