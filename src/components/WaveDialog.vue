<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

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
  time: '',
  boss: '雾神·雨',
  place: '雾神尼'
})

watch(
  () => props.initialData,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      form.value = {
        mode: val.mode || '4人周本',
        time: val.time || '',
        boss: val.boss || '雾神·雨',
        place: val.place || '雾神尼'
      }
    } else {
      resetForm()
    }
  },
  { immediate: true, deep: true }
)

function resetForm() {
  form.value = {
    mode: '4人周本',
    time: '',
    boss: '雾神·雨',
    place: '雾神尼'
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!form.value.time) {
    ElMessage.warning('请选择攻坚时间')
    return
  }

  const now = new Date()
  const selectedDate = new Date(form.value.time)

  if (selectedDate <= now) {
    ElMessage.warning('只能选择以后的时间哦！请检查攻坚时间')
    return
  }

  emit('submit', { ...form.value })
  handleClose()
}

// 禁用今天之前的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 8.64e7 = 一天的毫秒数，允许选择今天
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '✨ 编辑攻坚计划' : '✨ 创建新波次'"
    width="440px"
    destroy-on-close
    class="custom-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @update:model-value="val => $emit('update:modelValue', val)"
  >
    <el-form :model="form" label-width="100px" label-position="left">
      <el-form-item label="副本模式">
        <el-radio-group v-model="form.mode">
          <el-radio-button label="4人周本" value="4人周本" />
          <el-radio-button label="12人团本" value="12人团本" />
        </el-radio-group>
      </el-form-item>

      <el-form-item label="攻坚时间">
        <el-date-picker
          v-model="form.time"
          type="datetime"
          placeholder="选择日期和时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
          :disabled-date="disabledDate"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="攻坚地点">
        <el-input v-model="form.place" placeholder="例如：雾神尼 / 1-3队" />
      </el-form-item>

      <el-form-item label="Boss 名称">
        <el-input v-model="form.boss" placeholder="例如：雾神·雨" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" class="save-btn">
          {{ isEdit ? '确认更新' : '确认创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.custom-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.custom-dialog :deep(.el-dialog__title) {
  font-weight: 800;
  color: var(--primary-color);
}

.save-btn {
  background: var(--primary-color);
  border-color: var(--primary-color);
  font-weight: 700;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 覆盖 Element Plus 默认样式以匹配项目风格 */
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}
</style>
