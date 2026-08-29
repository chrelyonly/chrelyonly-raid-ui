<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = reactive({
  ownerId: '',
  name: '',
  job: '',
  type: '大C',
  reputation: '',
  damage: '',
  healing: ''
})

const typeOptions = ['大C', '小C', '辅助', '混子']

function resetForm() {
  Object.assign(form, {
    ownerId: '',
    name: '',
    job: '',
    type: '大C',
    reputation: '',
    damage: '',
    healing: ''
  })
}

function handleSubmit() {
  if (!form.ownerId || !form.name) {
    return ElMessage.warning('请填写所属用户和角色名称')
  }

  // 组合展示文本
  const damageText = form.type === '辅助' ? (form.healing || '0') : `${form.damage}w`

  emit('submit', {
    ...form,
    damage: damageText,
    // 如果是辅助，damage 字段存奶量显示
  })
  emit('update:modelValue', false)
  resetForm()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="✨ 添加新角色"
    width="440px"
    destroy-on-close
    class="custom-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @update:model-value="val => $emit('update:modelValue', val)"
  >
    <el-form :model="form" label-width="100px" label-position="left">
      <el-form-item label="所属用户">
        <el-select v-model="form.ownerId" placeholder="从群成员中选择" filterable style="width: 100%">
          <el-option
            v-for="user in users"
            :key="user.userName"
            :label="user.displayName || user.nickName"
            :value="user.userName"
          >
            <div style="display: flex; align-items: center; gap: 8px">
              <el-avatar :size="24" :src="user.avatar" />
              <span>{{ user.displayName || user.nickName }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="角色名称">
        <el-input v-model="form.name" placeholder="请输入游戏内角色名" />
      </el-form-item>

      <el-form-item label="职业">
        <el-input v-model="form.job" placeholder="例如：吊机、红狗" />
      </el-form-item>

      <el-form-item label="角色定位">
        <el-radio-group v-model="form.type">
          <el-radio-button label="大C" :value="1" />
          <el-radio-button label="小C" :value="2"  />
          <el-radio-button label="辅助" :value="3"  />
          <el-radio-button label="混子" :value="4"  />
        </el-radio-group>
      </el-form-item>

      <el-form-item label="名望">
        <el-input v-model="form.reputation" placeholder="例如：12.5" type="number" step="0.1">
          <template #append>万</template>
        </el-input>
      </el-form-item>

      <el-form-item v-if="form.type !== '3'" label="伤害">
        <el-input v-model="form.damage" placeholder="模拟" type="number" step="0.1">
          <template #append>亿</template>
        </el-input>
      </el-form-item>

      <el-form-item v-else label="奶量(三攻)">
        <el-input v-model="form.healing" placeholder="例如：4.1w" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" @click="handleSubmit" class="save-btn">确认添加</el-button>
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
</style>
