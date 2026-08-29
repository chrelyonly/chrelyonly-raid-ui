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
  type: '4人周本',
  date: '',
  bossName: '米歇尔',
  name: '干翻米歇尔',
  masterName: '小黑子',
  address: '讨伐米歇尔'
})

watch(
  () => props.initialData,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      form.value = {
        type: val.type || '4人周本',
        date: val.date || '',
        bossName: val.bossName || '米歇尔',
        name: val.name || '干翻米歇尔',
        masterName: val.masterName || '小黑子',
        address: val.address || '讨伐米歇尔'
      }
    } else {
      resetForm()
    }
  },
  { immediate: true, deep: true }
)

function resetForm() {
  form.value = {
    name: '干翻米歇尔',
    type: '4人周本',
    date: '',
    bossName: '米歇尔',
    masterName: '小黑子',
    address: '讨伐米歇尔'
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!form.value.date) {
    ElMessage.warning('请选择攻坚时间')
    return
  }

  const now = new Date()
  const selectedDate = new Date(form.value.date)

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
    width="600px"
    destroy-on-close
    class="custom-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @update:model-value="val => $emit('update:modelValue', val)"
  >
    <el-form :model="form" label-width="100px" label-position="left">

      <el-form-item label="攻坚名称">
        <el-input v-model="form.name" placeholder="例如：讨伐米歇尔" />
      </el-form-item>

      <el-form-item label="时间">
        <el-date-picker
          v-model="form.date"
          type="datetime"
          placeholder="选择日期和时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
          :disabled-date="disabledDate"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="副本模式">
        <el-radio-group v-model="form.type">
          <el-radio-button label="4人周本" value="4人周本" />
          <el-radio-button label="12人团本" value="12人团本" />
        </el-radio-group>
      </el-form-item>

      <el-form-item label="讨伐地点">
        <el-input v-model="form.address" placeholder="例如：野猪频道" />
      </el-form-item>

      <el-form-item label="Boss 名称">
        <el-input v-model="form.bossName" placeholder="例如：野猪" />
      </el-form-item>
      <el-form-item label="副本发起人">
        <el-input v-model="form.masterName" placeholder="例如：小黑子" />
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
