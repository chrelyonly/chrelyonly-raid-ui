<script setup>
import { Delete } from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import UserDetailInfoDialog from "@/components/UserDetailInfoDialog.vue";
import {ref} from "vue";

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

// 控制弹窗显隐
const visible = ref(false)

// 你的接口返回数据 (直接传入你的 res.data)
const roleData = ref({})

const openModal = () => {
  visible.value = true
}
// 打开详情弹窗
const openDetail = (data) => {
  if (data.detailInfo || data.detailV2Info) {
    try {
      // 1. 安全解析两个 JSON 字符串
      const detailObj = data.detailInfo ? JSON.parse(data.detailInfo) : {}
      const detailV2Obj = data.detailV2Info ? JSON.parse(data.detailV2Info) : {}

      // 2. 合并对象（优先保留 V2 里的同名新字段，若 V2 属性覆盖了 V1 的对象，可使用深合并）
      roleData.value = {
        ...detailObj,
        ...detailV2Obj
      }

      debugger
      openModal()
    } catch (error) {
      console.error("解析装备数据失败:", error)
      ElMessage.error("数据格式异常，无法解析")
    }
  } else {
    ElMessage.error("缺少装备信息")
  }
}


function getRoleTagType(type) {
  const map = {
    '3': 'success',
    '1': 'danger',
    '2': 'warning',
    '4': 'info',
  }
  return map[type] || 'info'
}

function getRoleTypeName(type) {
  const map = {
    '1': '大C',
    '2': '小C',
    '3': '辅助',
    '4': '混子',
  }
  return map[type] || '未知'
}

function handleDelete() {
  console.log(props.role)
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
    <div @click.stop="openDetail(role)">
      <el-icon class="delete-btn-icon"><View /></el-icon>
    </div>
    <div class="avatar-container">
      <img
          v-if="role.jobImage"
          class="avatar-img job-icon"
          :src="`/image/jobs/${role.jobImage}`"
          alt="job"
      />
    </div>
    <div class="role-info">

      <b class="name" style="font-size: 15px;">{{ role.name }}</b>
      <b style="font-size: 12px">{{role.job}}</b>
      <div class="detail-row">
        <small class="detail">
          <span v-if="role.reputation" style="font-size: 10px">名望：{{ role.reputation }}</span>
          <span v-if="role.damage && role.damage !=='--'" style="font-size: 10px">伤害：{{ role.damage }}</span>
          <span v-if="role.healing && role.healing !=='--'" style="font-size: 10px">奶量：{{ role.healing }}</span>
        </small>
        <el-tag size="small" :type="getRoleTagType(role.type)" class="mini-tag" v-if="role.type">
          {{ getRoleTypeName(role.type) }}
        </el-tag>
      </div>
      <!--      <div class="detail-row" >-->
      <!--         <small class="detail">-->
      <!--           <span >{{ role.reputation }} </span>-->
      <!--           <span v-if="role.type !== 3">🔪{{ role.damage }}E</span>-->
      <!--           <span v-else>🍼{{ role.damage }}</span>-->

      <!--         </small>-->
      <!--      </div>-->
    </div>
    <div v-if="showDelete" class="delete-action" @click.stop="handleDelete">
      <el-icon class="delete-btn-icon"><Delete /></el-icon>
    </div>
  </div>
  <UserDetailInfoDialog
      v-model="visible"
      :data="roleData"
  />
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
