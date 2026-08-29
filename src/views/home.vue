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
          <div class="crumb">
             <span class="emoji">📅</span>
             <span class="text-gradient-gold">RAID SCHEDULE / 2026.08.29</span>
          </div>
          <h1 class="main-title">
             <span class="text-gradient-primary">团本排班表</span>
             <span class="emoji">⚔️</span>
          </h1>
        </div>
        <div class="header-right">
          <button class="action-btn" type="button" @click="openCreateDialog">
            <span class="emoji">✨</span>
            <span>新建波次</span>
          </button>
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
            <button class="add-mini-btn" @click="openCreateDialog">
               <span class="emoji">➕</span> 添加波次
            </button>
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
              @delete="deleteWave(wave.id)"
            />
          </div>

          <!-- 删除区域 -->
          <div class="trash-zone" @dragover.prevent @drop="dropDelete">
             <Delete class="trash-icon" />
             <span><span class="emoji">💡</span> 拖到此处移出排班</span>
          </div>
        </section>

        <!-- ==================== Role Tree ==================== -->
        <RoleTree :roles="roles" @start-drag="startDrag" @end-drag="endDrag" />
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
  </main>
</template>

<style scoped>
.app {
  min-height: 100vh;
  padding: 24px;
}

.main {
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 800;
}

.main-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 36px;
  line-height: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  height: 44px;
  padding: 0 24px;
  border-radius: 22px;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 800;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(26, 77, 64, 0.15);
  background: var(--primary-color);
  color: #fff;
}

.action-btn:hover {
  transform: translateY(-2px);
  background: var(--primary-light);
  box-shadow: 0 8px 25px rgba(26, 77, 64, 0.25);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn .emoji {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.action-btn:hover .emoji {
  transform: scale(1.2) rotate(10deg);
}

.summary {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary b { font-size: 24px; }
.summary-sub { font-size: 16px; font-weight: 800; color: var(--text-sub); display: flex; align-items: center; gap: 6px; }

.title-with-emoji {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sub-hint {
  font-size: 14px;
  color: var(--text-sub);
  font-weight: 800;
  margin-left: 10px;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.schedule {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  overflow: hidden;
}

.schedule-title {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-title h2 { margin: 0; font-size: 22px; font-weight: 900; }
.schedule-title span { font-size: 13px; color: var(--text-sub); font-weight: 700; }

.add-mini-btn {
  padding: 6px 16px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.06);
  background: #fff;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-mini-btn:hover {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.waves-grid {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.trash-zone {
  margin: 20px 24px;
  height: 56px;
  border: 1px dashed rgba(214, 64, 64, 0.2);
  border-radius: 12px;
  background: rgba(214, 64, 64, 0.01);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #d64040;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s;
  opacity: 0.6;
}

.trash-zone:hover {
  opacity: 1;
  background: rgba(214, 64, 64, 0.05);
}

.trash-icon { width: 20px; height: 20px; }

.foot-note {
  margin: 24px 0;
  text-align: center;
  font-weight: 800;
  font-size: 14px;
  color: var(--text-sub);
}

@media (max-width: 1000px) {
  .layout { grid-template-columns: 1fr; }
  .waves-grid { grid-template-columns: 1fr; }
}
</style>
