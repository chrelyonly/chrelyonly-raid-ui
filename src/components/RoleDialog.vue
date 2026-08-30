<script setup>
import {ref, reactive, onMounted} from 'vue'
import { ElMessage } from 'element-plus'
import JobDialog from './JobDialog.vue'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const jobPickerVisible = ref(false)

const form = reactive({
  ownerId: '',
  name: '',
  job: '',
  jobImage: '',
  type: 1,
  reputation: '',
  damage: '',
  healing: ''
})


function resetForm() {
  Object.assign(form, {
    ownerId: '',
    name: '',
    job: '',
    jobImage: '',
    type: 1,
    reputation: '',
    damage: '',
    healing: ''
  })
}

function handleSubmit() {
  if (!form.ownerId || !form.name || !form.job) {
    return ElMessage.warning('请填写所属用户、角色名称和职业')
  }
  return ElMessage.warning('已关闭手动添加')
  emit('submit', {
    ...form,
  })
  emit('update:modelValue', false)
  resetForm()
}

function handleJobSelect(subJob) {
  form.job = subJob.name
  form.jobImage = subJob.image
}



const users = ref([])
const loadData = () => {
  let params ={

  }

  window.$https("/dnf-api/getGroupInfo", "get", {}, 1, {}).then(res=>{
    // 兼容两种返回格式
    const data = res.data.data || res.data
    users.value = data[0]?.groupList || []
  })
}
onMounted(()=>{
  loadData()
})
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="✨ 添加新角色"
    width="90%"
    style="max-width: 600px"
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
            :key="user.UserName"
            :label="user.DisplayName || user.NickName"
            :value="user.UserName"
          >
            <div style="display: flex; align-items: center; gap: 8px">
              <el-avatar :size="24" :src="user.SmallHeadImgUrl" />
              <span>{{ user.DisplayName || user.NickName }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="角色名称">
        <el-input v-model="form.name" placeholder="请输入游戏内角色名" />
      </el-form-item>

      <el-form-item label="职业">
        <div class="job-selector-wrapper">
          <el-input
            v-model="form.job"
            placeholder="点击选择职业"
            readonly
            @click="jobPickerVisible = true"
            style="cursor: pointer"
          />
          <div v-if="form.jobImage" class="job-preview-card" @click="jobPickerVisible = true">
             <img :src="`/image/jobs/${form.jobImage}`" class="preview-img" />
             <div class="preview-overlay">
               <span>已选择: {{ form.job }}</span>
             </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="角色定位">
        <el-radio-group v-model="form.type">
          <el-radio-button :label="1">大C</el-radio-button>
          <el-radio-button :label="2">小C</el-radio-button>
          <el-radio-button :label="3">辅助</el-radio-button>
          <el-radio-button :label="4">混子</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="名望">
        <el-input v-model="form.reputation" placeholder="例如：12.5" type="number" step="0.1">
          <template #append>万</template>
        </el-input>
      </el-form-item>

      <el-form-item v-if="form.type !== 3" label="伤害">
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

    <JobDialog v-model="jobPickerVisible" @select="handleJobSelect" />
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

.job-selector-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-preview-card {
  width: 200px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 2px solid var(--primary-color);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.job-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: #fff;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 700;
  text-align: right;
}
</style>
