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
import RoleDialog from '../components/RoleDialog.vue'
import {Refresh} from "@element-plus/icons-vue";

/**
 * =========================
 * 初始化核心逻辑
 * =========================
 */
const {
  roles,
  users,
  groups,
  waves,
  getRole,
  assignedCount,
  removeRoleFromAllWaves,
  autoAssignRole,
  addWave,
  saveWaveTeams,
  sendWaveNotification,
  delWave,
  addRole,
  delRole,
  refreshData
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
const showRoleDialog = ref(false)
const isEditMode = ref(false)
const editingWaveId = ref(null)
const initialFormData = ref({})
const isRefreshing = ref(false)

const handleRefresh = async () => {
  isRefreshing.value = true
  await refreshData()
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

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
    addWave(formData)
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
    ElMessage.success(`👋 「${role.name}」已从 ${team.name} 中移出`)
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
        <div class="title-group">
          <h1 class="main-title">
             <span class="text-gradient-primary">团本排班表</span>
             <span class="emoji">⚔️</span>
          </h1>
        </div>
      </header>

      <!-- ==================== Summary ==================== -->
      <div class="glass summary">
        <div class="summary-info">
          <div class="summary-title">
            <span class="emoji">📋</span>
            <b class="text-gradient-primary">本周攻坚计划</b>
          </div>
          <span class="summary-sub">
            <span class="emoji">🚀</span> 共 {{ waves.length }} 波 ·
            <span class="emoji">👤</span> {{ assignedCount }} / {{ roles.length }} 角色
          </span>
        </div>
      </div>

      <!-- ==================== Content ==================== -->
      <div class="layout">
        <!-- ==================== Schedule ==================== -->
        <section class="glass schedule">
          <div class="schedule-title">
            <div class="title-with-emoji">
              <span class="emoji">🛡️</span>
              <h2>波次排班</h2>
              <span class="sub-hint"><span class="emoji">👥</span> 拖动角色调整位置</span>
            </div>
            <div class="schedule-actions">
              <el-tooltip content="刷新波次" placement="top">
                <el-button
                    circle
                    :icon="Refresh"
                    class="refresh-btn"
                    :class="{ 'is-loading': isRefreshing }"
                    @click="handleRefresh"
                />
              </el-tooltip>
              <button class="add-mini-btn" @click="openCreateDialog">
                <span class="emoji">➕</span> 添加波次
              </button>
            </div>
          </div>

          <!-- 波次列表：紧凑网格布局 -->
          <div class="waves-grid">
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
              @save="saveWaveTeams"
              @notify="sendWaveNotification"
              @delete="delWave"
            />
          </div>

          <!-- 删除区域 -->
          <div class="trash-zone" @dragover.prevent @drop="dropDelete">
             <Delete class="trash-icon" />
             <span><span class="emoji">💡</span> 拖到此处移出排班</span>
          </div>
        </section>

        <!-- ==================== Role Tree ==================== -->
        <RoleTree
          :roles="roles"
          :groups="groups"
          @start-drag="startDrag"
          @end-drag="endDrag"
          @add-role="showRoleDialog = true"
          @role-click="autoAssignRole"
          @delete-role="delRole"
          @refresh="refreshData"
        />
      </div>

      <p class="foot-note">
        <span class="emoji">📝</span> 输出前三，辅助最后；角色可跨队交换。
      </p>
    </section>

    <!-- ==================== Dialogs ==================== -->
    <WaveDialog
      v-model="showWaveDialog"
      :is-edit="isEditMode"
      :initial-data="initialFormData"
      @submit="handleWaveSubmit"
    />

    <RoleDialog
      v-model="showRoleDialog"
      @submit="addRole"
    />
  </main>
</template>

<style scoped>
<style scoped>
.app {
  min-height: 100vh;
  padding: 48px;
}

@media (max-width: 768px) {
  .app {
    padding: 16px;
  }
}

.main {
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.main-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0;
  font-size: 52px;
  line-height: 1;
}

@media (max-width: 768px) {
  .main-title {
    font-size: 32px;
  }
}

.summary {
  padding: 24px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .summary {
    padding: 16px 20px;
    flex-direction: column;
    align-items: center; /* Center for mobile */
    text-align: center;
    gap: 12px;
    margin-bottom: 20px;
  }
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

@media (max-width: 768px) {
  .summary-info {
    align-items: center;
  }
}

.summary b { font-size: 32px; }
@media (max-width: 768px) {
  .summary b { font-size: 24px; }
}

.summary-sub { font-size: 20px; font-weight: 800; color: var(--text-sub); display: flex; align-items: center; gap: 10px; }
@media (max-width: 768px) {
  .summary-sub { font-size: 16px; }
}

.layout {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 32px;
}

@media (max-width: 1200px) {
  .layout { grid-template-columns: 1fr; }
}

.schedule {
  background: rgba(255, 255, 255, 0);
  border-radius: 32px;
  overflow: hidden;
}

.schedule-title {
  padding: 28px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .schedule-title {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.schedule-title h2 { margin: 0; font-size: 30px; font-weight: 900; }
.schedule-title span { font-size: 18px; color: var(--text-sub); font-weight: 700; }

.schedule-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .schedule-actions {
    width: 100%;
    justify-content: space-between;
  }
}

.refresh-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  background: #fff;
  color: var(--text-sub);
  transition: all 0.3s;
}

.refresh-btn:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.refresh-btn.is-loading :deep(.el-icon) {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.add-mini-btn {
  padding: 10px 24px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.06);
  background: #fff;
  color: var(--primary-color);
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-mini-btn:hover {
  background: var(--primary-color);
  color: #fff;
}

.sub-hint {
  font-size: 18px;
  color: var(--text-sub);
  font-weight: 800;
  margin-left: 15px;
}

@media (max-width: 768px) {
  .sub-hint {
    margin-left: 0;
    display: block;
    margin-top: 4px;
  }
}

.waves-grid {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 768px) {
  .waves-grid {
    padding: 0;
  }
}

.trash-zone {
  margin: 32px;
  height: 80px;
  border: 2px dashed rgba(214, 64, 64, 0.2);
  border-radius: 20px;
  background: rgba(214, 64, 64, 0.01);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #d64040;
  font-weight: 800;
  font-size: 20px;
  transition: all 0.3s;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .trash-zone {
    margin: 16px 0;
    font-size: 16px;
  }
}

.trash-icon { width: 32px; height: 32px; }

.foot-note {
  margin: 48px 0;
  text-align: center;
  font-weight: 900;
  font-size: 20px;
  color: var(--text-sub);
}

@media (max-width: 1000px) {
  .layout { grid-template-columns: 1fr; }
  .waves-grid { grid-template-columns: 1fr; }
}
</style>
