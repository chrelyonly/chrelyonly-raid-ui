<script setup>
import { computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import RoleAvatar from './RoleAvatar.vue'

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
  'delete'
])

const timeRemaining = computed(() => {
  if (!props.wave.time) return null

  const now = new Date()
  const raidDate = new Date(props.wave.time.replace(/-/g, '/')) // Compatibility with some browsers

  const diff = raidDate - now
  if (diff <= 0) return '🎉 正在开团中'

  const diffMinutes = Math.floor(diff / (1000 * 60))
  if (diffMinutes < 60) {
    return `🔥 ${diffMinutes}m`
  } else {
    const diffHours = Math.floor(diffMinutes / 60)
    const hours = diffHours % 24
    const days = Math.floor(diffHours / 24)
    if (days > 0) {
      return `🕒 ${days}d ${hours}h`
    }
    return `🕒 ${diffHours}h`
  }
})

const gridStyle = computed(() => {
  const count = props.wave.teams?.length || 1
  return {
    gridTemplateColumns: `repeat(${count}, 1fr)`
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

const displayTime = computed(() => {
  if (!props.wave.time) return ''
  // 仅显示 MM-DD HH:mm 格式
  return props.wave.time.substring(5)
})
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
             <span class="emoji">👥</span> {{ wave.mode }}
           </el-tag>
           <el-tag size="small" type="danger" effect="dark" class="wave-badge boss-badge" v-if="wave.boss">
             <span class="emoji">👾</span> {{ wave.boss }}
           </el-tag>
        </div>
        <div class="meta-row">
          <span class="wave-meta">
            <span class="emoji">🕒</span> {{ wave.time }}
          </span>
          <span class="wave-meta" v-if="wave.place">
            <span class="emoji">📍</span> {{ wave.place }}
          </span>
          <span class="countdown-hint" v-if="timeRemaining">{{ timeRemaining }}</span>
        </div>
      </div>

      <div class="wave-actions">
        <button type="button" class="mini-btn" @click="$emit('edit', wave)"><Edit /></button>
        <button type="button" class="mini-btn delete" @click="$emit('delete', wave)"><Delete /></button>
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
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.wave-header {
  padding: 12px 16px;
  background: rgba(220, 235, 228, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wave-name {
  font-size: 18px;
  font-weight: 800;
  margin-right: 4px;
}

.wave-badge {
  border-radius: 6px !important;
  font-weight: 700 !important;
  height: 24px !important;
  padding: 0 8px !important;
}

.mode-badge {
  border-color: rgba(26, 77, 64, 0.2) !important;
  color: var(--primary-color) !important;
  background: rgba(26, 77, 64, 0.05) !important;
}

.boss-badge {
  border: none !important;
  box-shadow: 0 2px 8px rgba(214, 64, 64, 0.2);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 6px;
}

.wave-meta {
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.countdown-hint {
  font-size: 11px;
  color: #a87b2f;
  font-weight: 900;
}

.wave-actions {
  display: flex;
  gap: 6px;
}

.mini-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: 0.2s;
}

.mini-btn svg { width: 14px; height: 14px; }
.mini-btn:hover { background: var(--primary-color); color: #fff; transform: scale(1.1); }
.mini-btn.delete:hover { background: #ff4d4f; }

.teams-grid {
  padding: 16px 24px;
  display: grid;
  gap: 16px;
}

.team-card {
  background: rgba(255, 255, 255, 0.5);
  padding: 12px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.team-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 0 2px 2px 0;
}

.team-card.is-red::before { background: #ff4d4f; }
.team-card.is-yellow::before { background: #faad14; }
.team-card.is-green::before { background: #52c41a; }

.team-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.team-name {
  font-size: 14px;
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

.slot-cell {
  position: relative;
  height: 54px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  transition: all 0.2s;
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
