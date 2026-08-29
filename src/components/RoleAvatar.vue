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
    <img
      v-if="role.avatar"
      class="avatar-img"
      :src="role.avatar"
      alt="avatar"
    />
    <span
      v-else
      class="avatar"
      :style="{ background: role.color || '#ccc' }"
    >
      {{ (role.name || '?').slice(0, 1) }}
    </span>
    <div class="role-info">
      <b class="name">{{ role.name }}</b>
      <div class="detail-row" v-if="size !== 'small'">
        <small class="detail">{{ role.job }} · {{ role.damage }}</small>
        <el-tag size="small" :type="getRoleTagType(role.type)" class="mini-tag" v-if="role.type">
          {{ role.type }}
        </el-tag>
      </div>
      <div class="detail-row" v-else>
         <small class="detail">{{ role.damage }}</small>
      </div>
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

.avatar, .avatar-img {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 900;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.8);
  object-fit: cover;
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
  font-size: 16px;
  color: #081a15;
  font-weight: 900;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail {
  color: #3d4d44;
  font-size: 12px;
  font-weight: 800;
}

.mini-tag {
  height: 18px !important;
  line-height: 16px !important;
  font-size: 10px !important;
  padding: 0 4px !important;
}

/* Small size variant for compact wave grid */
.small .avatar, .small .avatar-img {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  font-size: 13px;
  border-width: 1.5px;
}

.small .name {
  font-size: 14px;
}

.small .detail {
  font-size: 10px;
}

.small .role-info {
  gap: 0;
}
</style>
