<script setup>
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

function onDrop(team, index) {
  emit('drop-role', team, index)
}

function onDragStart(roleId, team, index) {
  emit('start-drag', roleId, team, index)
}

function onRemoveRole(team, index) {
  emit('remove-role', team, index)
}
</script>

<template>
  <div class="wave-container">
    <!-- 波次头部信息 -->
    <div class="wave-header">
      <div class="wave-info">
        <strong class="wave-name">{{ wave.name }}</strong>
        <span class="wave-meta">⏱ {{ wave.time }} 📍 {{ wave.place }}</span>
        <el-tag size="small" type="danger" effect="plain">Boss · {{ wave.boss }}</el-tag>
        <el-tag size="small" type="warning" effect="dark">{{ wave.mode }}</el-tag>
      </div>

      <div class="wave-actions">
        <button type="button" class="btn-icon" title="编辑" @click="$emit('edit', wave)">
          <Edit style="width: 14px; height: 14px;" />
        </button>
        <button type="button" class="btn-icon delete" title="删除" @click="$emit('delete', wave)">
          <Delete style="width: 14px; height: 14px;" />
        </button>
      </div>
    </div>

    <!-- 小队列表 -->
    <div class="teams-grid" :class="{ 'multi-team': wave.teams.length > 1 }">
      <div
        v-for="team in wave.teams"
        :key="team.id"
        class="team-card"
      >
        <div class="team-label">{{ team.name }}</div>

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
            <!-- 有角色 -->
            <template v-if="roleId && getRole(roleId)">
              <div
                class="assigned-role"
                draggable="true"
                @dragstart="onDragStart(roleId, team, index)"
                @dragend="$emit('end-drag')"
              >
                <RoleAvatar :role="getRole(roleId)" />
              </div>

              <button
                class="remove-btn"
                type="button"
                @click.stop="onRemoveRole(team, index)"
              >
                ×
              </button>
            </template>

            <!-- 空位置 -->
            <template v-else>
              <div class="slot-placeholder">
                <span class="plus">+</span>
                <span class="label">{{ index < 3 ? 'DPS' : 'Buff' }}</span>
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
  margin-bottom: 20px;
  background: #ffffff66;
  border-radius: 16px;
  border: 1px solid #dfe7e1;
  overflow: hidden;
  transition: all 0.3s;
}

.wave-container:hover {
  border-color: #c89c47;
  box-shadow: 0 8px 24px rgba(73, 96, 82, 0.08);
}

.wave-header {
  padding: 16px 24px;
  background: #eaf0ec88;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dfe7e1;
}

.wave-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.wave-name {
  font-size: 18px;
  color: #143e33;
}

.wave-meta {
  color: #63736a;
  font-size: 14px;
}

.wave-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: #fff;
  color: #89968e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: 0.2s;
}

.btn-icon:hover {
  color: #245044;
  transform: translateY(-1px);
}

.btn-icon.delete:hover {
  color: #ff7474;
}

.teams-grid {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.teams-grid.multi-team {
  display: grid;
  grid-template-columns: 1fr;
}

.team-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #ffffff99;
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid #ebf0ec;
}

.team-label {
  flex: 0 0 80px;
  font-weight: 700;
  color: #728078;
  font-size: 14px;
  text-align: center;
}

.slots {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.slot-cell {
  position: relative;
  height: 76px;
  background: #fff;
  border: 1px solid #dce5df;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 8px;
  transition: all 0.2s;
}

.slot-cell:hover {
  border-color: #c89c47;
}

.slot-cell.support {
  background: #fdfaff;
  border-color: #e2d4f5;
}

.slot-cell.empty {
  border-style: dashed;
  justify-content: center;
}

.slot-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #a0a8a3;
}

.slot-placeholder .plus {
  font-size: 18px;
  line-height: 1;
}

.slot-placeholder .label {
  font-size: 10px;
  font-weight: 700;
}

.assigned-role {
  width: 100%;
  cursor: grab;
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff7474;
  color: #fff;
  border: 0;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.slot-cell:hover .remove-btn {
  opacity: 1;
}

@media (max-width: 1200px) {
  .team-card {
    flex-direction: column;
    align-items: stretch;
  }
  .team-label {
    text-align: left;
    flex: none;
    margin-bottom: 5px;
  }
}
</style>
