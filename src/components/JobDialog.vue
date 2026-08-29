<script setup>
import { ref, computed } from 'vue'
import { JOBS_DATA } from '../constants/jobs'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'select'])

const activeBaseJobIndex = ref(0)
const activeBaseJob = computed(() => JOBS_DATA[activeBaseJobIndex.value])

function handleSelect(subJob) {
  emit('select', subJob)
  emit('update:modelValue', false)
}

function getImageUrl(name, type) {
  return `/src/asset/image/${type}/${name}`
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="选择职业"
    width="1100px"
    class="job-picker-dialog"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    @update:model-value="val => $emit('update:modelValue', val)"
  >
    <div class="job-picker-container">
      <!-- Left: Base Jobs -->
      <div class="base-jobs-list">
        <div
          v-for="(baseJob, index) in JOBS_DATA"
          :key="baseJob.name"
          class="base-job-item"
          :class="{ active: activeBaseJobIndex === index }"
          @click="activeBaseJobIndex = index"
        >
          <div class="icon-wrapper">
            <img :src="getImageUrl(baseJob.icon, 'sub')" class="base-job-icon" />
          </div>
          <span class="base-job-name">{{ baseJob.name }}</span>
        </div>
      </div>

      <!-- Right: Sub Jobs Grid -->
      <div class="sub-jobs-content">
        <div class="sub-jobs-grid">
          <div
            v-for="subJob in activeBaseJob.subJobs"
            :key="subJob.name"
            class="sub-job-card"
            @click="handleSelect(subJob)"
          >
            <div class="sub-job-image-wrapper">
              <img :src="getImageUrl(subJob.image, 'jobs')" class="sub-job-image" />
              <div class="sub-job-overlay">
                <span class="sub-job-name">{{ subJob.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.job-picker-container {
  display: flex;
  height: 650px;
  background: #0f1112;
  color: #fff;
  overflow: hidden;
  font-family: "Microsoft YaHei", sans-serif;
}

.base-jobs-list {
  width: 180px;
  border-right: 1px solid #2d2f31;
  overflow-y: auto;
  padding: 10px 0;
  background: #15181a;
}

.base-job-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 5px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.base-job-item::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: #d4af37;
  transition: height 0.3s;
}

.base-job-item.active {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0.15) 100%);
}

.base-job-item.active::after {
  height: 70%;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  margin-bottom: 4px;
  transition: transform 0.3s;
}

.base-job-item.active .icon-wrapper {
  transform: scale(1.1);
  background: radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%);
}

.base-job-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.5));
}

.base-job-name {
  font-size: 13px;
  color: #a0a0a0;
  margin-top: 4px;
}

.base-job-item.active .base-job-name {
  color: #d4af37;
  font-weight: bold;
}

.sub-jobs-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #0f1112;
}

.sub-jobs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.sub-job-card {
  aspect-ratio: 2 / 1;
  position: relative;
  cursor: pointer;
  border: 1px solid #36393d;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.sub-job-card:hover {
  transform: translateY(-5px);
  border-color: #d4af37;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
}

.sub-job-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.sub-job-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.sub-job-card:hover .sub-job-image {
  transform: scale(1.1);
}

.sub-job-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  padding: 8px 4px;
  text-align: center;
}

.sub-job-name {
  font-size: 13px;
  color: #e0e0e0;
  text-shadow: 1px 1px 2px #000;
  letter-spacing: 1px;
}

.sub-job-card:hover .sub-job-name {
  color: #d4af37;
}

/* Dialog overrides */
.job-picker-dialog :deep(.el-dialog) {
  background: #0f1112;
  border: 1px solid #d4af37;
}

.job-picker-dialog :deep(.el-dialog__header) {
  padding: 15px 20px;
  margin-right: 0;
  border-bottom: 1px solid #2d2f31;
}

.job-picker-dialog :deep(.el-dialog__title) {
  color: #d4af37;
  font-size: 18px;
  font-weight: bold;
}

.job-picker-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.job-picker-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #d4af37;
}
</style>
