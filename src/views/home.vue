<script setup>
import { ref } from 'vue'
import { Bell, CirclePlus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Composables
import { useRoster } from '../composables/useRoster'
import { useDragAndDrop } from '../composables/useDragAndDrop'

// Components
import WaveRow from '../components/WaveRow.vue'
import RoleTree from '../components/RoleTree.vue'
import WaveDialog from '../components/WaveDialog.vue'

/**
 * =========================
 * 初始化核心逻辑
 * =========================
 */
const {
  roles,
  waves,
  getRole,
  assignedCount,
  removeRoleFromAllWaves,
  deleteWave,
  addWave,
  updateWave
} = useRoster()

const {
  draggedRoleId,
  startDrag,
  startAssignedDrag,
  endDrag,
  dropRole,
  dropDelete
} = useDragAndDrop(getRole, removeRoleFromAllWaves)

/**
 * =========================
 * 弹窗逻辑
 * =========================
 */
const showWaveDialog = ref(false)
const isEditMode = ref(false)
const editingWaveId = ref(null)
const initialFormData = ref({})

function openCreateDialog() {
  isEditMode.value = false
  initialFormData.value = {}
  showWaveDialog.value = true
}

function openEditDialog(wave) {
  isEditMode.value = true
  editingWaveId.value = wave.id
  initialFormData.value = { ...wave }
  showWaveDialog.value = true
}

function handleWaveSubmit(formData) {
  if (isEditMode.value) {
    updateWave(editingWaveId.value, formData)
  } else {
    addWave(formData)
  }
}

/**
 * =========================
 * 其它交互
 * =========================
 */
function removeRoleFromWave(team, index) {
  const roleId = team.members[index]
  if (!roleId) return
  const role = getRole(roleId)
  team.members[index] = null
  if (role) {
    ElMessage.success(`「${role.name}」已从${team.name}中移出`)
  }
}

function notifySchedule() {
  ElMessage.success('排班通知已生成，可发送至群聊')
}
</script>

<template>
  <main class="app">
    <section class="main">
      <!-- ==================== Header ==================== -->
      <header class="header">
        <div>
          <div class="crumb">RAID SCHEDULE / 2026.08.29</div>
          <h1>团本排班表</h1>
        </div>
        <div class="header-right">
          <el-tag effect="dark" type="warning">本周 · 雾神攻坚战</el-tag>
          <button class="create" type="button" @click="openCreateDialog">
            <CirclePlus style="width: 16px; height: 16px;" /> 新建攻坚队
          </button>
          <button class="notify" type="button" @click="notifySchedule">
            <Bell style="width: 16px; height: 16px;" /> 发送通知
          </button>
        </div>
      </header>

      <!-- ==================== Summary ==================== -->
      <div class="glass summary">
        <div>
          <b>本周攻坚计划</b>
          <span>共 {{ waves.length }} 波 · {{ assignedCount }} / {{ roles.length }} 个角色已编排</span>
        </div>
        <div class="chips">
          <el-tag type="info">时间 20:00 起</el-tag>
          <el-tag type="success">地点 雾神尼</el-tag>
          <el-tag type="danger">Boss 雾神·雨</el-tag>
        </div>
      </div>

      <!-- ==================== Content ==================== -->
      <div class="layout">
        <!-- ==================== Schedule ==================== -->
        <section class="glass schedule">
          <div class="schedule-title">
            <div>
              <h2>波次排班</h2>
              <span>每波 4 人 · 拖动角色调整位置</span>
            </div>
          </div>

          <!-- 波次列表 -->
          <div class="waves-list">
            <WaveRow
              v-for="wave in waves"
              :key="wave.id"
              :wave="wave"
              :get-role="getRole"
              @drop-role="dropRole"
              @start-drag="startAssignedDrag"
              @end-drag="endDrag"
              @remove-role="removeRoleFromWave"
              @edit="openEditDialog"
              @delete="deleteWave(wave.id)"
            />
          </div>

          <!-- 添加波次 -->
          <button class="add-row" type="button" @click="openCreateDialog">＋ 添加下一波</button>

          <!-- 删除区域 -->
          <div class="trash-zone" @dragover.prevent @drop="dropDelete">
            <Delete style="width: 20px; height: 20px;" />
            <div>
              <b>拖到这里删除角色</b>
              <span>将已排班角色拖到此处即可移出排班</span>
            </div>
          </div>
        </section>

        <!-- ==================== Role Tree ==================== -->
        <RoleTree :roles="roles" @start-drag="startDrag" @end-drag="endDrag" />
      </div>

      <p class="foot-note">
        输出角色放入前两位，辅助角色放入后两位；已排班角色可直接拖到下方删除区域。
      </p>
    </section>

    <!-- ==================== Dialogs ==================== -->
    <WaveDialog
      v-model="showWaveDialog"
      :is-edit="isEditMode"
      :initial-data="initialFormData"
      @submit="handleWaveSubmit"
    />
  </main>
</template>

<style scoped>
.app {
  min-height: 100vh;
  padding: 28px;
  box-sizing: border-box;
}

.main {
  max-width: 1700px;
  margin: 0 auto;
}

.glass {
  background: #ffffffb8;
  border: 1px solid #ffffffd1;
  box-shadow: 0 14px 35px rgba(73, 96, 82, 0.09);
  backdrop-filter: blur(14px);
  border-radius: 12px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.crumb {
  font-size: 13px;
  letter-spacing: 2px;
  color: #9b8965;
  margin-bottom: 8px;
  font-weight: 600;
}

.header h1 {
  margin: 0;
  font-size: 42px;
  font-weight: 800;
  color: #143e33;
  letter-spacing: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right button {
  height: 44px;
  border: 0;
  border-radius: 8px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.create {
  background: #245044;
  color: #fff;
}

.create:hover {
  background: #2d6354;
  transform: translateY(-1px);
}

.notify {
  background: #d9aa4f;
  color: #25342f;
}

.notify:hover {
  background: #e5b965;
  transform: translateY(-1px);
}

.summary {
  min-height: 80px;
  padding: 24px 30px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
}

.summary > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary b {
  font-size: 20px;
  color: #18382f;
}

.summary span {
  color: #829087;
  font-size: 14px;
  margin-top: 4px;
}

.chips {
  display: flex;
  gap: 10px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 26px;
  align-items: start;
}

.schedule {
  padding: 0;
  overflow: hidden;
}

.schedule-title {
  padding: 22px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-title h2 {
  margin: 0;
  font-size: 24px;
  color: #143e33;
}

.schedule-title span {
  color: #8a958d;
  font-size: 13px;
}

.waves-list {
  padding: 20px;
}

.add-row {
  width: calc(100% - 48px);
  height: 55px;
  margin: 15px 24px;
  border: 2px dashed #dce5df;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.4);
  color: #a08048;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.add-row:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: #c7ad79;
  color: #8a6d3b;
}

.trash-zone {
  margin: 10px 24px 24px;
  height: 80px;
  border: 2px dashed #f8dcd8;
  border-radius: 12px;
  background: #fff8f7;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #8b2d27;
  transition: all 0.3s;
}

.trash-zone:hover {
  border-color: #e6a2a2;
  background: #fef0f0;
}

.trash-zone div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trash-zone b {
  font-size: 14px;
}

.trash-zone span {
  font-size: 12px;
  opacity: 0.8;
}

.foot-note {
  margin: 24px 4px 0;
  color: #839087;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 1250px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}

@media (max-width: 1050px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
