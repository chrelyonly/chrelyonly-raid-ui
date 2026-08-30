<script setup>
import { ref, computed } from 'vue'

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

const activeTab = ref('equip')

// 角色基础与名望
const characterInfo = computed(() => props.data?.core?.jumpUrl?.param || {})
const fameInfo = computed(() => props.data?.fight || {})

// 核心属性列表
const attrList = computed(() => props.data?.core?.list || [])

// 提取所有穿戴物品
const allWearList = computed(() => props.data?.wear || [])

// 誓约与星蕴石数据
const fogOathInfo = computed(() => props.data?.fogOath || {})
const oathInfo = computed(() => props.data?.oath?.oath || {})
const stoneSide = computed(() => props.data?.oath?.stone?.side || [])
const stoneCenter = computed(() => props.data?.oath?.stone?.center || [])

// 徽章与星盘数据
const badgeStarList = computed(() => props.data?.badge?.starList || [])

// 匹配具体槽位的辅助函数
const getEquipByPos = (posNames) => {
  const names = Array.isArray(posNames) ? posNames : [posNames]
  return allWearList.value.find(item => names.includes(item.posName))
}

// 左侧防具 5 件套
const leftEquipSlots = computed(() => [
  { pos: '头肩', data: getEquipByPos('头肩') },
  { pos: '上衣', data: getEquipByPos('上衣') },
  { pos: '下装', data: getEquipByPos('下装') },
  { pos: '腰带', data: getEquipByPos('腰带') },
  { pos: '鞋', data: getEquipByPos(['鞋', '鞋子']) }
])

// 右侧首饰 + 特殊 + 武器
const rightEquipSlots = computed(() => [
  { pos: '武器', data: getEquipByPos('武器') },
  { pos: '项链', data: getEquipByPos('项链') },
  { pos: '手镯', data: getEquipByPos('手镯') },
  { pos: '戒指', data: getEquipByPos('戒指') },
  { pos: '辅助装备', data: getEquipByPos('辅助装备') },
  { pos: '魔法石', data: getEquipByPos('魔法石') },
  { pos: '耳环', data: getEquipByPos('耳环') }
])

// 中间三槽
const bottomEquipSlots = computed(() => [
  { pos: '称号', data: getEquipByPos('称号') },
  { pos: '宠物', data: getEquipByPos('宠物') },
  { pos: '光环', data: getEquipByPos(['光环装扮', '光环幻化装扮', '光环']) }
])

// 外观/装扮槽
const avatarSlots = computed(() => {
  const usedPos = [
    '头肩', '上衣', '下装', '腰带', '鞋', '鞋子',
    '武器', '项链', '手镯', '戒指', '辅助装备', '魔法石', '耳环',
    '称号', '宠物', '光环装扮', '光环幻化装扮', '光环'
  ]
  return allWearList.value.filter(item => !usedPos.includes(item.posName))
})

// 品质颜色映射 (太初设为绿色)
const getColorStyle = (item) => {
  if (!item) return {}
  const name = item.colorName || item.rarity || item.gradeName || item.name || ''
  const grade = Number(item.grade)

  // 太初 (绿色)
  if (name.includes('太初') || grade === 8) {
    return { color: '#00ff66', borderColor: '#00ff66', background: 'rgba(0, 255, 102, 0.15)' }
  }
  // 史诗 (金/黄)
  if (name.includes('史诗') || grade === 4) {
    return { color: '#ffb400', borderColor: '#ffb400', background: 'rgba(255, 180, 0, 0.15)' }
  }
  // 传说 (橙)
  if (name.includes('传说') || grade === 6) {
    return { color: '#ff7900', borderColor: '#ff7900', background: 'rgba(255, 121, 0, 0.15)' }
  }
  // 神器 (紫)
  if (name.includes('神器') || grade === 7) {
    return { color: '#e600ff', borderColor: '#e600ff', background: 'rgba(230, 0, 255, 0.15)' }
  }
  // 稀有 (粉/紫红)
  if (name.includes('稀有') || grade === 3) {
    return { color: '#b66aff', borderColor: '#b66aff', background: 'rgba(182, 106, 255, 0.15)' }
  }
  // 高级 (蓝)
  if (name.includes('高级') || grade === 2) {
    return { color: '#00aaff', borderColor: '#00aaff', background: 'rgba(0, 170, 255, 0.15)' }
  }

  // 普通 / 默认 (灰)
  return { color: '#d1d5db', borderColor: '#374151', background: 'rgba(255,255,255,0.03)' }
}

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
      :model-value="modelValue"
      title="DNF 角色全维度数据详情"
      width="1280px"
      destroy-on-close
      :close-on-click-modal="false"
      append-to-body
      class="dnf-dialog-wrapper"
      @close="handleClose"
  >
    <div class="dnf-board" v-if="data">
      <!-- 头部角色基础信息 -->
      <div class="header-bar">
        <div class="role-meta">
          <span class="role-name">{{ characterInfo.roleName || '未知角色' }}</span>
          <span class="server" v-if="characterInfo.serverName">{{ characterInfo.serverName }}</span>
          <span class="level" v-if="characterInfo.level">Lv.{{ characterInfo.level }}</span>
        </div>
        <div class="fame-meta" v-if="fameInfo.value">
          <img v-if="fameInfo.icon" :src="fameInfo.icon" class="fame-icon" alt="fame" />
          <span class="fame-tag">{{ fameInfo.tag || '冒险家名望' }}</span>
          <span class="fame-val">{{ fameInfo.value }}</span>
        </div>
      </div>

      <!-- 导航 Tab 页签 -->
      <el-tabs v-model="activeTab" class="dnf-tabs">
        <el-tab-pane label="装备与打造" name="equip">
          <div class="equip-main-layout">
            <!-- 左侧防具栏 -->
            <div class="equip-column left-col">
              <div v-for="(slot, idx) in leftEquipSlots" :key="idx" class="equip-item-slot" :class="{ empty: !slot.data }">
                <template v-if="slot.data">
                  <div class="icon-box" :style="getColorStyle(slot.data)">
                    <img :src="slot.data.icon" :alt="slot.data.name" />
                    <span v-if="slot.data.attr1" class="badge" :style="{ color: `#${slot.data.attr1Color || '00f0ff'}` }">
                      {{ slot.data.attr1 }}
                    </span>
                  </div>
                  <div class="equip-detail">
                    <div class="equip-name-row">
                      <span class="equip-name" :style="{ color: getColorStyle(slot.data).color }">{{ slot.data.name }}</span>
                    </div>
                    <!-- 增幅/附魔/贴膜等扩展属性 -->
                    <div class="equip-sub-info">
                      <span class="enchant" v-if="slot.data.enchantName || slot.data.attr2">
                        {{ slot.data.enchantName || slot.data.attr2 }}
                      </span>
                      <span class="fusion-tag" v-if="slot.data.fusionName">[融合: {{ slot.data.fusionName }}]</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="icon-box empty-box"></div>
                  <div class="equip-detail"><span class="pos-label">{{ slot.pos }}</span></div>
                </template>
              </div>
            </div>

            <!-- 中间立绘 + 称号宠物光环 + 时装 -->
            <div class="center-col">
              <div class="character-preview">
                <img :src="characterInfo.roleIcon" class="large-avatar" alt="role" v-if="characterInfo.roleIcon" />
                <div class="no-avatar" v-else>暂无立绘</div>
              </div>

              <div class="bottom-slots">
                <div v-for="(slot, idx) in bottomEquipSlots" :key="idx" class="bottom-slot-item" :title="slot.data ? slot.data.name : slot.pos">
                  <div class="icon-box" :style="getColorStyle(slot.data)" v-if="slot.data">
                    <img :src="slot.data.icon" :alt="slot.data.name" />
                  </div>
                  <div class="icon-box empty-box" v-else></div>
                  <span class="bottom-pos-label">{{ slot.pos }}</span>
                </div>
              </div>

              <div class="avatar-section" v-if="avatarSlots.length">
                <div class="avatar-title">外观/时装/幻化</div>
                <div class="avatar-grid">
                  <div v-for="(item, idx) in avatarSlots" :key="idx" class="avatar-slot-item" :title="`${item.posName}: ${item.name}`">
                    <div class="icon-box mini" :style="getColorStyle(item)">
                      <img :src="item.icon" :alt="item.name" />
                    </div>
                    <span class="avatar-pos-label">{{ item.posName }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧首饰/特殊/武器 -->
            <div class="equip-column right-col">
              <div v-for="(slot, idx) in rightEquipSlots" :key="idx" class="equip-item-slot reverse" :class="{ empty: !slot.data }">
                <template v-if="slot.data">
                  <div class="equip-detail align-right">
                    <div class="equip-name-row">
                      <span class="equip-name" :style="{ color: getColorStyle(slot.data).color }">{{ slot.data.name }}</span>
                    </div>
                    <div class="equip-sub-info">
                      <span class="enchant" v-if="slot.data.enchantName || slot.data.attr2">
                        {{ slot.data.enchantName || slot.data.attr2 }}
                      </span>
                      <span class="fusion-tag" v-if="slot.data.fusionName">[融合: {{ slot.data.fusionName }}]</span>
                    </div>
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

          <!-- 底部面板：面板基础属性 -->
          <div class="bottom-attr-panel" v-if="attrList.length">
            <div class="panel-header">角色核心属性</div>
            <div class="attr-grid">
              <div v-for="(attr, index) in attrList" :key="index" class="attr-cell">
                <span class="attr-label">{{ attr.name }}</span>
                <span class="attr-val">{{ attr.value }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 星蕴石 / 魂之誓约 Tab -->
        <el-tab-pane label="魂之誓约 / 星蕴石" name="oath" v-if="oathInfo.name || fogOathInfo.level">
          <div class="oath-container">
            <div class="oath-header-card">
              <div class="oath-main-info">
                <img :src="oathInfo.suitIcon || oathInfo.icon" class="oath-suit-icon" alt="oath" />
                <div>
                  <div class="oath-title" :style="{ color: getColorStyle(oathInfo).color }">{{ oathInfo.name || '雾之誓约' }}</div>
                  <div class="oath-sub">
                    <span>得分: <strong class="highlight-gold">{{ oathInfo.points || 0 }}</strong></span>
                    <span v-if="fogOathInfo.level" class="ml-15">誓约等级: Lv.{{ fogOathInfo.level }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="stone-section">
              <div class="stone-group">
                <div class="stone-title">中央核心星蕴石 ({{ stoneCenter.length }})</div>
                <div class="stone-grid">
                  <div class="stone-card" v-for="(s, idx) in stoneCenter" :key="idx" :style="getColorStyle(s)">
                    <img :src="s.icon" class="stone-img" />
                    <div class="stone-info">
                      <div class="stone-name" :style="{ color: getColorStyle(s).color }">{{ s.name }}</div>
                      <div class="stone-grade">品级: {{ s.grade }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="stone-group mt-20">
                <div class="stone-title">边缘阵列星蕴石 ({{ stoneSide.length }})</div>
                <div class="stone-grid side-grid">
                  <div class="stone-card compact" v-for="(s, idx) in stoneSide" :key="idx" :style="getColorStyle(s)">
                    <img :src="s.icon" class="stone-img-sm" />
                    <span class="stone-name-sm" :style="{ color: getColorStyle(s).color }">{{ s.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 徽章 / 星盘栏位 Tab -->
        <el-tab-pane label="星盘与徽章栏位" name="badge" v-if="badgeStarList.length">
          <div class="badge-container">
            <div class="badge-star-row" v-for="(star, sIdx) in badgeStarList" :key="sIdx">
              <div class="star-header">
                <img :src="star.starBorder" class="star-border-icon" v-if="star.starBorder" />
                <span class="star-name">{{ star.starName }}</span>
                <span class="star-resonance" v-if="star.resonanceLevel">共鸣: {{ star.resonanceLevel }}</span>
              </div>
              <div class="emblem-list">
                <div class="emblem-card" v-for="(e, eIdx) in star.emblemList" :key="eIdx" :class="{ empty: !e.itemName }">
                  <template v-if="e.itemName">
                    <span class="emblem-dot" :style="{ backgroundColor: e.colorCode || '#ff7900' }"></span>
                    <span class="emblem-name" :style="{ color: e.colorCode || '#fff' }">{{ e.itemName }}</span>
                  </template>
                  <span class="emblem-empty-text" v-else>未镶嵌</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<style scoped>
.dnf-board {
  background: #11151c;
  border: 1px solid #2a354b;
  padding: 20px;
  border-radius: 8px;
  color: #d1d5db;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
}

/* 顶部信息栏 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #182030 0%, #11151c 100%);
  padding: 12px 20px;
  border-radius: 6px;
  border: 1px solid #232c3d;
  margin-bottom: 15px;
}
.role-meta { display: flex; align-items: center; gap: 12px; }
.role-name { font-size: 22px; font-weight: bold; color: #fff; }
.server, .level { font-size: 14px; background: #222d42; color: #8da4c4; padding: 2px 8px; border-radius: 4px; }
.fame-meta { display: flex; align-items: center; gap: 8px; }
.fame-icon { width: 24px; height: 24px; }
.fame-tag { color: #9ca3af; font-size: 15px; }
.fame-val { color: #ffb400; font-size: 20px; font-weight: bold; }

/* 装备主区域 */
.equip-main-layout { display: flex; justify-content: space-between; gap: 16px; }
.equip-column { flex: 1; display: flex; flex-direction: column; gap: 12px; }

.equip-item-slot {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #171d27;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #232c3d;
  height: 68px;
  box-sizing: border-box;
}
.equip-item-slot.reverse { justify-content: flex-end; }

.icon-box {
  position: relative;
  width: 48px;
  height: 48px;
  border: 1px solid #444;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease-in-out;
}
.icon-box img { width: 38px; height: 38px; }
.icon-box.mini { width: 36px; height: 36px; }
.icon-box.mini img { width: 28px; height: 28px; }
.empty-box { background: #0e1218; border-color: #222a38; }

.badge {
  position: absolute;
  top: -6px;
  right: -3px;
  font-size: 13px;
  font-weight: bold;
  text-shadow: 0 0 4px #000;
}

.equip-detail { display: flex; flex-direction: column; overflow: hidden; flex: 1; }
.equip-detail.align-right { text-align: right; }
.equip-name { font-size: 15px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.equip-sub-info { font-size: 12px; display: flex; flex-direction: column; gap: 2px; }
.enchant { color: #00f0ff; }
.fusion-tag { color: #ffb400; }
.pos-label { font-size: 14px; color: #6b7280; }

/* 中间立绘栏 */
.center-col {
  width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: #151a23;
  border: 1px solid #232c3d;
  border-radius: 6px;
  padding: 16px 10px;
}
.large-avatar { width: 130px; height: 130px; border-radius: 50%; border: 3px solid #ffb400; box-shadow: 0 0 16px rgba(255, 180, 0, 0.2); }
.no-avatar { width: 130px; height: 130px; border-radius: 50%; border: 1px dashed #444; display: flex; align-items: center; justify-content: center; color: #555; }
.bottom-slots { display: flex; gap: 14px; justify-content: center; width: 100%; margin-top: 12px; }
.bottom-slot-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bottom-pos-label { font-size: 12px; color: #6b7280; }

/* 时装栏 */
.avatar-section { width: 100%; margin-top: 12px; border-top: 1px dashed #232c3d; padding-top: 10px; }
.avatar-title { font-size: 13px; color: #ffb400; text-align: center; margin-bottom: 8px; font-weight: bold; }
.avatar-grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.avatar-slot-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.avatar-pos-label { font-size: 11px; color: #6b7280; max-width: 50px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 属性面板 */
.bottom-attr-panel { margin-top: 16px; background: #171d27; border: 1px solid #232c3d; border-radius: 6px; padding: 14px; }
.panel-header { font-size: 16px; font-weight: bold; color: #ffb400; margin-bottom: 10px; border-left: 3px solid #ffb400; padding-left: 8px; }
.attr-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 20px; }
.attr-cell { display: flex; justify-content: space-between; font-size: 14px; }
.attr-label { color: #8da4c4; }
.attr-val { color: #00f0ff; font-weight: bold; }

/* 誓约与星蕴石面板 */
.oath-container { padding: 8px; }
.oath-header-card { background: #171d27; border: 1px solid #232c3d; padding: 16px; border-radius: 6px; margin-bottom: 16px; }
.oath-main-info { display: flex; align-items: center; gap: 16px; }
.oath-suit-icon { width: 56px; height: 56px; }
.oath-title { font-size: 20px; font-weight: bold; }
.oath-sub { font-size: 14px; color: #9ca3af; margin-top: 4px; }
.highlight-gold { color: #ffb400; }
.ml-15 { margin-left: 15px; }

.stone-title { font-size: 15px; font-weight: bold; color: #ffb400; margin-bottom: 10px; }
.stone-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stone-grid.side-grid { grid-template-columns: repeat(4, 1fr); }
.stone-card { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 6px; border: 1px solid; background: rgba(0,0,0,0.2); }
.stone-card.compact { padding: 6px 10px; gap: 8px; }
.stone-img { width: 40px; height: 40px; }
.stone-img-sm { width: 28px; height: 28px; }
.stone-name { font-size: 14px; font-weight: bold; }
.stone-name-sm { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stone-grade { font-size: 12px; color: #6b7280; }
.mt-20 { margin-top: 20px; }

/* 徽章与星盘面板 */
.badge-container { display: flex; flex-direction: column; gap: 12px; }
.badge-star-row { background: #171d27; border: 1px solid #232c3d; border-radius: 6px; padding: 12px; display: flex; align-items: center; gap: 16px; }
.star-header { width: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border-right: 1px dashed #232c3d; padding-right: 12px; }
.star-border-icon { width: 32px; height: 32px; }
.star-name { font-size: 14px; font-weight: bold; color: #fff; }
.star-resonance { font-size: 12px; color: #ffb400; }
.emblem-list { flex: 1; display: flex; flex-wrap: wrap; gap: 8px; }
.emblem-card { display: flex; align-items: center; gap: 6px; background: #11151c; border: 1px solid #222d42; padding: 6px 10px; border-radius: 4px; font-size: 13px; }
.emblem-card.empty { border-style: dashed; }
.emblem-dot { width: 8px; height: 8px; border-radius: 50%; }
.emblem-empty-text { color: #4b5563; font-size: 12px; }
</style>

<style>
/* 深度重置 Element Plus 样式 */
.dnf-dialog-wrapper .el-dialog { background-color: #11151c !important; border: 1px solid #2a354b; }
.dnf-dialog-wrapper .el-dialog__title { font-size: 20px !important; color: #ffb400 !important; font-weight: bold; }
.dnf-dialog-wrapper .el-dialog__header { border-bottom: 1px solid #222d42; margin-right: 0; padding: 16px 20px 12px !important; }
.dnf-tabs .el-tabs__item { color: #9ca3af !important; font-size: 15px !important; }
.dnf-tabs .el-tabs__item.is-active { color: #ffb400 !important; font-weight: bold; }
.dnf-tabs .el-tabs__active-bar { background-color: #ffb400 !important; }
.dnf-tabs .el-tabs__nav-wrap::after { background-color: #222d42 !important; }
</style>