<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = ref({
  mode: '4人周本',
  time: '20:00 - 21:30',
  boss: '雾神·雨',
  place: '雾神尼'
})

watch(
  () => props.initialData,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      form.value = {
        mode: val.mode || '4人周本',
        time: val.time || '20:00 - 21:30',
        boss: val.boss || '雾神·雨',
        place: val.place || '雾神尼'
      }
    }
  },
  { immediate: true, deep: true }
)

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  emit('submit', { ...form.value })
  handleClose()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEdit ? '编辑攻坚队' : '新建攻坚队'"
    width="460px"
  >
    <div class="form-grid">
      <label>副本模式</label>
      <el-radio-group v-model="form.mode">
        <el-radio-button label="4人周本" />
        <el-radio-button label="12人团本" />
      </el-radio-group>

      <label>攻坚时间</label>
      <el-select v-model="form.time">
        <el-option label="20:00 - 21:30" value="20:00 - 21:30" />
        <el-option label="21:30 - 23:00" value="21:30 - 23:00" />
        <el-option label="23:00 - 00:30" value="23:00 - 00:30" />
      </el-select>

      <label>地点</label>
      <el-input v-model="form.place" clearable />

      <label>Boss 名称</label>
      <el-input v-model="form.boss" clearable />
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        {{ isEdit ? '更新队伍' : '创建队伍' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 16px 12px;
  align-items: center;
}

.form-grid label {
  color: #66746c;
  font-size: 14px;
  font-weight: 500;
}

.form-grid :deep(.el-radio-button__inner) {
  border-radius: 8px !important;
  margin-right: 8px;
  border: 1px solid #dce5df !important;
}

.form-grid :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #245044 !important;
  border-color: #245044 !important;
  box-shadow: none !important;
}
</style>
