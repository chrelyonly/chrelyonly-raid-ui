<script setup>
import { computed } from 'vue'
import { Edit, Delete, CircleCheck, Bell } from '@element-plus/icons-vue'
import RoleAvatar from './RoleAvatar.vue'
import {ElMessage, ElMessageBox} from "element-plus";

const props = defineProps({
  wave: {
    type: Object,
    required: true
  },
  getRole: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'drop-role',
  'start-drag',
  'end-drag',
  'remove-role',
  'edit',
  'save',
  'notify',
  'delete'
])

const timeRemaining = computed(() => {
  if (!props.wave.time && !props.wave.date) return null
  const targetTime = props.wave.time || props.wave.date

  const now = new Date()
  const raidDate = new Date(targetTime.replace(/-/g, '/')) // 兼容性处理

  const diff = raidDate - now
  if (diff <= 0) return '🎉 正在开团中'

  const diffMinutes = Math.floor(diff / (1000 * 60))
  const minutes = diffMinutes % 60
  const totalHours = Math.floor(diffMinutes / 60)
  const hours = totalHours % 24
  const days = Math.floor(totalHours / 24)

  if (days > 0) {
    return `还有 ${days} 天 ${hours} 小时`
  } else if (hours > 0) {
    return `还有 ${hours} 小时 ${minutes} 分钟`
  } else {
    return `还有 ${minutes} 分钟`
  }
})

const modeName = computed(() => {
  const type = props.wave.type || props.wave.mode
  if (type === 1 || type === '1') return '4人周本'
  if (type === 2 || type === '2') return '12人团本'
  return type || '未知模式'
})

const gridStyle = computed(() => {
  const count = props.wave.teams?.length || 1
  return {
    '--team-count': count
  }
})

function onDrop(team, index) {
  emit('drop-role', team, index)
}

function onDragStart(roleId, team, index) {
  emit('start-drag', roleId, team, index)
}

function onRemoveRole(team, index) {
  emit('remove-role', team, index)
}


const deleteRow = (row) => {
  ElMessageBox.confirm(
    `确定要永久删除波次「${row.name}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('delete', row)
  }).catch(() => {})
}
</script>

<template>
  <div class="wave-container">
    <!-- 紧凑型波次头部 -->
    <div class="wave-header">
      <div class="wave-info">
        <div class="title-row">
           <span class="emoji">🌊</span>
           <span class="wave-name text-gradient-primary">{{ wave.name }}</span>
           <el-tag size="small" effect="plain" class="wave-badge mode-badge">
             <span class="emoji">👥</span> {{ modeName }}
           </el-tag>
           <el-tag size="small" type="danger" effect="dark" class="wave-badge boss-badge" v-if="wave.bossName || wave.boss">
             <span class="emoji">👾</span> {{ wave.bossName || wave.boss }}
           </el-tag>
        </div>
        <div class="meta-row">
          <span class="wave-meta">
            <span class="emoji">🕒</span> {{ wave.time || wave.date }}
          </span>
          <span class="wave-meta" v-if="wave.place || wave.address">
            <span class="emoji">📍</span> {{ wave.place || wave.address }}
          </span>
          <span class="countdown-hint" v-if="timeRemaining">{{ timeRemaining }}</span>
        </div>
      </div>

      <div class="wave-actions">
        <button type="button" class="mini-btn notify" title="发送通知" @click="$emit('notify', wave)"><Bell /></button>
        <button type="button" class="save-btn-prominent" @click="$emit('save', wave)">
          <CircleCheck class="btn-icon" /> 保存编队
        </button>
        <button type="button" class="mini-btn delete" title="删除波次" @click="deleteRow(wave)"><Delete /></button>
      </div>
    </div>

    <!-- 小队网格 -->
    <div class="teams-grid" :style="gridStyle">
      <div
        v-for="team in wave.teams"
        :key="team.id"
        class="team-card"
        :class="[
          team.name.includes('红') ? 'is-red' : '',
          team.name.includes('黄') ? 'is-yellow' : '',
          team.name.includes('绿') ? 'is-green' : ''
        ]"
      >
        <div class="team-header">
           <span class="team-dot"></span>
           <span class="team-name">🏹 {{ team.name }}</span>
        </div>

        <div class="slots">
          <div
            v-for="(roleId, index) in team.members"
            :key="`${team.id}-${index}`"
            class="slot-cell"
            :class="{
              empty: !roleId,
              output: index < 3,
              support: index === 3
            }"
            @dragover.prevent
            @drop="onDrop(team, index)"
          >
            <template v-if="roleId && getRole(roleId)">
              <div
                class="slot-owner-tag"
                :style="{ backgroundColor: getRole(roleId).ownerColor.bg }"
              >
                <span
                  class="owner-name"
                  :style="{ color: getRole(roleId).ownerColor.text }"
                >
                  @{{ getRole(roleId).ownerName }}
                </span>
              </div>
              <div
                class="assigned-role"
                draggable="true"
                @dragstart="onDragStart(roleId, team, index)"
                @dragend="$emit('end-drag')"
              >
                <RoleAvatar :role="getRole(roleId)" size="small" />
              </div>
              <button class="remove-btn" type="button" @click.stop="onRemoveRole(team, index)">×</button>
            </template>
            <template v-else>
              <div class="slot-placeholder">
                <span class="label"><span class="emoji">{{ index < 3 ? '⚔️' : '💉' }}</span> {{ index < 3 ? '输出' : '奶' }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wave-container {
  backdrop-filter: blur(20px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.wave-header {
  padding: 20px 28px;
  background: rgba(220, 235, 228, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .wave-header {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.title-row {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.wave-name {
  font-size: 26px;
  font-weight: 800;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .wave-name {
    font-size: 20px;
  }
}

.wave-badge {
  border-radius: 10px !important;
  font-weight: 800 !important;
  height: 34px !important;
  padding: 0 14px !important;
  font-size: 16px !important;
}

@media (max-width: 768px) {
  .wave-badge {
    height: 28px !important;
    font-size: 12px !important;
    padding: 0 8px !important;
  }
}

.mode-badge {
  border-color: rgba(26, 77, 64, 0.2) !important;
  color: var(--primary-color) !important;
  background: rgba(26, 77, 64, 0.05) !important;
}

.boss-badge {
  border: none !important;
  box-shadow: 0 4px 12px rgba(214, 64, 64, 0.2);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.wave-meta {
  color: var(--text-sub);
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 768px) {
  .wave-meta {
    font-size: 14px;
  }
}

.countdown-hint {
  font-size: 16px;
  color: #a87b2f;
  font-weight: 900;
}

.wave-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .wave-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

.mini-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: 0.2s;
}

@media (max-width: 768px) {
  .mini-btn {
    width: 36px;
    height: 36px;
  }
}

.mini-btn svg { width: 20px; height: 20px; }
.mini-btn:hover { background: var(--primary-color); color: #fff; transform: scale(1.1); }
.mini-btn.notify:hover { background: #6366f1; }
.mini-btn.delete:hover { background: #ff4d4f; }

.save-btn-prominent {
  padding: 0 20px;
  height: 44px;
  border-radius: 22px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  font-weight: 800;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

@media (max-width: 768px) {
  .save-btn-prominent {
    height: 36px;
    padding: 0 12px;
    font-size: 14px;
  }
}

.save-btn-prominent:hover {
  background: #ff7875;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 77, 79, 0.4);
}

.save-btn-prominent:active {
  transform: translateY(0) scale(1);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.teams-grid {
  padding: 24px 32px;
  display: grid;
  grid-template-columns: repeat(var(--team-count, 1), 1fr);
  gap: 12px;
}

@media (max-width: 1200px) {
  .teams-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }
}

.team-card {
  background: rgba(255, 255, 255, 0.4);
  padding: 5px 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
}

@media (max-width: 768px) {
  .team-card {
    padding: 16px;
  }
}

.team-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 5px;
  border-radius: 0 3px 3px 0;
}

.team-card.is-red::before { background: #ff4d4f; }
.team-card.is-yellow::before { background: #faad14; }
.team-card.is-green::before { background: #52c41a; }

.team-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
}

.team-name {
  font-size: 20px;
  font-weight: 900;
  color: var(--text-main);
}

.is-red .team-name { color: #cf1322; }
.is-yellow .team-name { color: #d48806; }
.is-green .team-name { color: #389e0d; }

.slots {
  width: 100%; /* 占满卡片宽度 */
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

@media (max-width: 600px) {
  .slots {
    grid-template-columns: repeat(2, 1fr);
  }
}

.slot-cell {
  position: relative;
  min-height: 86px; /* 进一步增加高度以容纳顶部标签 */
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column; /* 改为垂直布局 */
  align-items: flex-start;
  padding: 0; /* 移除默认内边距，交给内部元素 */
  transition: all 0.2s;
  overflow: hidden;
}

.slot-owner-tag {
  width: 100%;
  background: rgba(26, 77, 64, 0.08);
  padding: 4px 10px;
  border-bottom: 1px solid rgba(26, 77, 64, 0.05);
}

.owner-name {
  font-size: 11px;
  font-weight: 800;
  color: var(--primary-color);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assigned-role {
  width: 100%;
  padding: 8px 10px;
  flex: 1;
  display: flex;
  align-items: center;
}

.slot-cell.output {
  background: rgba(255, 77, 79, 0.02);
}

.slot-cell.support {
  background: rgba(82, 196, 26, 0.02);
}

.slot-cell.output.empty {
  border: 1px dashed rgba(255, 77, 79, 0.2);
}

.slot-cell.support.empty {
  border: 1px dashed rgba(82, 196, 26, 0.2);
}

.slot-cell:hover {
  border-color: var(--primary-color);
  transform: translateY(-1px);
  background: #fff;
}

.slot-cell.output:hover { border-color: #ff4d4f; }
.slot-cell.support:hover { border-color: #52c41a; }

.slot-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.slot-placeholder .label {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-sub);
  opacity: 0.8;
}

.output .slot-placeholder .label { color: #cf1322; }
.support .slot-placeholder .label { color: #389e0d; }

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff4d4f;
  color: #fff;
  border: 1px solid #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
}

.slot-cell:hover .remove-btn { opacity: 1; }

@media (max-width: 1200px) {
  .team-card { flex-direction: column; align-items: flex-start; }
  .team-header { flex: none; }
}
</style>
