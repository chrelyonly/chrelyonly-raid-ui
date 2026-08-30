<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

// 角色基础与名望
const characterInfo = computed(() => props.data?.core?.jumpUrl?.param || {})
const fameInfo = computed(() => props.data?.fight || {})

// 核心属性列表（直接读取数据中的 list，不强行硬编码没有的属性）
const attrList = computed(() => props.data?.core?.list || [])

// 提取所有穿戴物品（包含基础装备与装扮/光环等）
const allWearList = computed(() => props.data?.wear || [])

// 匹配具体槽位的辅助函数
const getEquipByPos = (posNames) => {
  const names = Array.isArray(posNames) ? posNames : [posNames]
  return allWearList.value.find(item => names.includes(item.posName))
}

// 对应 DNF 布局槽位定义
// 左边：防具 5 件套
const leftEquipSlots = computed(() => [
  { pos: '头肩', data: getEquipByPos('头肩') },
  { pos: '上衣', data: getEquipByPos('上衣') },
  { pos: '下装', data: getEquipByPos('下装') },
  { pos: '腰带', data: getEquipByPos('腰带') },
  { pos: '鞋', data: getEquipByPos(['鞋', '鞋子']) }
])

// 右边：武器 + 首饰 3 + 特殊 3
const rightEquipSlots = computed(() => [
  { pos: '武器', data: getEquipByPos('武器') },
  { pos: '项链', data: getEquipByPos('项链') },
  { pos: '手镯', data: getEquipByPos('手镯') },
  { pos: '戒指', data: getEquipByPos('戒指') },
  { pos: '辅助装备', data: getEquipByPos('辅助装备') },
  { pos: '魔法石', data: getEquipByPos('魔法石') },
  { pos: '耳环', data: getEquipByPos('耳环') }
])

// 中间下方：称号、宠物、光环（包含“光环装扮”或“光环幻化装扮”）
const bottomEquipSlots = computed(() => [
  { pos: '称号', data: getEquipByPos('称号') },
  { pos: '宠物', data: getEquipByPos('宠物') },
  { pos: '光环', data: getEquipByPos(['光环装扮', '光环幻化装扮', '光环']) }
])

// 品质颜色映射（根据 colorName / colorType）
const getColorStyle = (item) => {
  if (!item) return {}
  const name = item.colorName || ''
  if (name.includes('太初')) return { color: '#ff3d00', borderColor: '#ff3d00', background: 'rgba(255, 61, 0, 0.2)' }
  if (name.includes('史诗')) return { color: '#ffb400', borderColor: '#ffb400', background: 'rgba(255, 180, 0, 0.2)' }
  if (name.includes('神器')) return { color: '#e600ff', borderColor: '#e600ff', background: 'rgba(230, 0, 255, 0.2)' }
  if (name.includes('稀有')) return { color: '#b000ff', borderColor: '#b000ff', background: 'rgba(176, 0, 255, 0.2)' }
  return { color: '#a0a0a0', borderColor: '#555', background: 'rgba(255,255,255,0.05)' }
}

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
      :model-value="modelValue"
      title="角色详情"
      width="820px"
      destroy-on-close
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      class="dnf-dialog-wrapper"
      @close="handleClose"
  >
    <div class="dnf-board" v-if="data && data.core">
      <div class="header-bar">
        <div class="role-meta">
          <span class="role-name">{{ characterInfo.roleName }}</span>
          <span class="server">{{ characterInfo.serverName }}</span>
          <span class="level">Lv.{{ characterInfo.level }}</span>
        </div>
        <div class="fame-meta">
          <img :src="fameInfo.icon" class="fame-icon" alt="fame" />
          <span class="fame-tag">{{ fameInfo.tag }}</span>
          <span class="fame-val">{{ fameInfo.value }}</span>
        </div>
      </div>

      <div class="equip-main-layout">
        <div class="equip-column left-col">
          <div
              v-for="(slot, idx) in leftEquipSlots"
              :key="idx"
              class="equip-item-slot"
              :class="{ empty: !slot.data }"
          >
            <template v-if="slot.data">
              <div class="icon-box" :style="getColorStyle(slot.data)">
                <img :src="slot.data.icon" :alt="slot.data.name" />
                <span v-if="slot.data.attr1" class="badge" :style="{ color: `#${slot.data.attr1Color || '00f0ff'}` }">
                  {{ slot.data.attr1 }}
                </span>
              </div>
              <div class="equip-detail">
                <span class="equip-name" :style="{ color: getColorStyle(slot.data).color }">
                  {{ slot.data.name }}
                </span>
                <span class="pos-label">{{ slot.pos }}</span>
              </div>
            </template>
            <template v-else>
              <div class="icon-box empty-box"></div>
              <div class="equip-detail"><span class="pos-label">{{ slot.pos }}</span></div>
            </template>
          </div>
        </div>

        <div class="center-col">
          <div class="character-preview">
            <img :src="characterInfo.roleIcon" class="large-avatar" alt="role" />
          </div>
          <div class="bottom-slots">
            <div
                v-for="(slot, idx) in bottomEquipSlots"
                :key="idx"
                class="bottom-slot-item"
                :title="slot.data ? slot.data.name : slot.pos"
            >
              <div class="icon-box" :style="getColorStyle(slot.data)" v-if="slot.data">
                <img :src="slot.data.icon" :alt="slot.data.name" />
              </div>
              <div class="icon-box empty-box" v-else></div>
              <span class="bottom-pos-label">{{ slot.pos }}</span>
            </div>
          </div>
        </div>

        <div class="equip-column right-col">
          <div
              v-for="(slot, idx) in rightEquipSlots"
              :key="idx"
              class="equip-item-slot reverse"
              :class="{ empty: !slot.data }"
          >
            <template v-if="slot.data">
              <div class="equip-detail align-right">
                <span class="equip-name" :style="{ color: getColorStyle(slot.data).color }">
                  {{ slot.data.name }}
                </span>
                <span class="pos-label">{{ slot.pos }}</span>
              </div>
              <div class="icon-box" :style="getColorStyle(slot.data)">
                <img :src="slot.data.icon" :alt="slot.data.name" />
                <span v-if="slot.data.attr1" class="badge" :style="{ color: `#${slot.data.attr1Color || '00f0ff'}` }">
                  {{ slot.data.attr1 }}
                </span>
              </div>
            </template>
            <template v-else>
              <div class="equip-detail align-right"><span class="pos-label">{{ slot.pos }}</span></div>
              <div class="icon-box empty-box"></div>
            </template>
          </div>
        </div>
      </div>


      {{attrList}}
      <div class="bottom-attr-panel" v-if="attrList.length">
        <div class="panel-header">核心属性</div>
        <div class="attr-grid">
          <div v-for="(attr, index) in attrList" :key="index" class="attr-cell">
            <span class="attr-label">{{ attr.name }}</span>
            <span class="attr-val">{{ attr.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.dnf-board {
  background: #11151c;
  border: 1px solid #2c3648;
  padding: 16px;
  border-radius: 6px;
  color: #d1d5db;
  font-family: Arial, sans-serif;
  user-select: none;
}

/* 顶部信息栏 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #182030 0%, #11151c 100%);
  padding: 10px 16px;
  border-radius: 4px;
  border-bottom: 1px solid #232c3d;
  margin-bottom: 16px;
}
.role-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.role-name { font-size: 18px; font-weight: bold; color: #fff; }
.server, .level { font-size: 12px; background: #222d42; color: #8da4c4; padding: 2px 8px; border-radius: 4px; }
.fame-meta { display: flex; align-items: center; gap: 6px; }
.fame-icon { width: 20px; height: 20px; }
.fame-tag { color: #9ca3af; font-size: 13px; }
.fame-val { color: #ffb400; font-size: 16px; font-weight: bold; }

/* 主装备区域布局 */
.equip-main-layout {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 12px;
}

.equip-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 装备槽位结构 */
.equip-item-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #171d27;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #232c3d;
  height: 48px;
  box-sizing: border-box;
}
.equip-item-slot.reverse {
  justify-content: flex-end;
}

/* 图标样式 */
.icon-box {
  position: relative;
  width: 36px;
  height: 36px;
  border: 1px solid #444;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-box img { width: 28px; height: 28px; }
.empty-box { background: #0e1218; border-color: #222a38; }

.badge {
  position: absolute;
  top: -4px;
  right: -2px;
  font-size: 11px;
  font-weight: bold;
  text-shadow: 0 0 4px #000;
}

/* 装备文案 */
.equip-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}
.equip-detail.align-right { text-align: right; }
.equip-name {
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pos-label { font-size: 11px; color: #6b7280; }

/* 中间区域（立绘 + 称号宠物光环） */
.center-col {
  width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: #151a23;
  border: 1px solid #232c3d;
  border-radius: 4px;
  padding: 12px 8px;
}
.character-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}
.large-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #ffb400;
  box-shadow: 0 0 15px rgba(255, 180, 0, 0.2);
}
.bottom-slots {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
}
.bottom-slot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.bottom-pos-label { font-size: 10px; color: #6b7280; }

/* 底部面板：属性展示 */
.bottom-attr-panel {
  margin-top: 16px;
  background: #171d27;
  border: 1px solid #232c3d;
  border-radius: 4px;
  padding: 12px;
}
.panel-header {
  font-size: 13px;
  font-weight: bold;
  color: #ffb400;
  margin-bottom: 8px;
  border-left: 3px solid #ffb400;
  padding-left: 6px;
}
.attr-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 16px;
}
.attr-cell {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
.attr-label { color: #8da4c4; }
.attr-val { color: #00f0ff; font-weight: bold; }
</style>

<style>
/* Element Plus 弹窗主题重置 */
.dnf-dialog-wrapper .el-dialog {
  background-color: #11151c !important;
  border: 1px solid #2a354b;
}
.dnf-dialog-wrapper .el-dialog__title {
  color: #ffffff !important;
}
.dnf-dialog-wrapper .el-dialog__header {
  border-bottom: 1px solid #222d42;
  margin-right: 0;
}
</style>