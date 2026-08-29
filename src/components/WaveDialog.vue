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
  time: '20:00',
  boss: '雾神·雨',
  place: '雾神尼'
})

watch(
  () => props.initialData,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      form.value = {
        mode: val.mode || '4人周本',
        time: val.time || '20:00',
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
  // Time Validation: Only future time allowed
  const now = new Date()
  const [hours, minutes] = form.value.time.split(':').map(Number)
  const selectedDate = new Date()
  selectedDate.setHours(hours, minutes, 0, 0)

  if (selectedDate <= now) {
    ElMessage.warning('⚠️ 只能选择以后的时间哦！请检查攻坚时间')
    return
  }

  emit('submit', { ...form.value })
  handleClose()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEdit ? '✏️ 编辑攻坚计划' : '🆕 创建新波次'"
    width="440px"
    custom-class="raid-dialog"
  >
    <div class="form-grid">
      <div class="form-item">
        <label><span class="emoji">🎮</span> 副本模式</label>
        <el-radio-group v-model="form.mode" class="ios-radio-group">
          <el-radio-button label="4人周本" />
          <el-radio-button label="12人团本" />
        </el-radio-group>
      </div>

      <div class="form-item">
        <label><span class="emoji">🕒</span> 攻坚时间</label>
        <div class="time-picker-row">
          <el-time-select
            v-model="form.time"
            start="00:00"
            step="00:15"
            end="23:45"
            placeholder="请选择开团时间"
            clearable
          />
          <div class="time-badge" v-if="form.time">
             <span class="emoji">🕙</span> {{ form.time }}
          </div>
        </div>
      </div>

      <div class="form-item">
        <label><span class="emoji">🗺️</span> 攻坚地点</label>
        <el-input v-model="form.place" placeholder="例如：雾神尼 / 1-3队" clearable />
      </div>

      <div class="form-item">
        <label><span class="emoji">👾</span> Boss 名称</label>
        <el-input v-model="form.boss" placeholder="例如：雾神·雨" clearable />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button class="footer-btn cancel" @click="handleClose">✖️ 取消</button>
        <button class="footer-btn confirm" @click="handleSubmit">
          {{ isEdit ? '✅ 更新队伍' : '✅ 创建队伍' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 10px 24px 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-badge {
  background: var(--primary-color);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(26, 77, 64, 0.2);
}

.form-grid :deep(.el-input__wrapper) {
  height: 46px;
  border-radius: 12px;
  background: #f8faf9;
  box-shadow: none !important;
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.form-grid :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: var(--primary-color);
}

.form-grid :deep(.el-radio-button__inner) {
  height: 38px;
  line-height: 36px;
  padding: 0 20px;
  border-radius: 10px !important;
  margin-right: 8px;
  font-weight: 700;
  font-size: 13px;
  border: 1px solid rgba(0,0,0,0.05) !important;
  background: #f8faf9;
  color: var(--text-sub);
}

.form-grid :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--primary-color) !important;
  color: #fff !important;
  border-color: var(--primary-color) !important;
  box-shadow: 0 4px 12px rgba(26, 77, 64, 0.15);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px 24px;
  background: #fcfdfd;
}

.footer-btn {
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-btn.cancel {
  background: transparent;
  color: var(--text-sub);
}

.footer-btn.cancel:hover {
  background: rgba(0,0,0,0.03);
}

.footer-btn.confirm {
  background: var(--primary-color);
  color: #fff;
}

.footer-btn.confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(26, 77, 64, 0.2);
}
</style>
