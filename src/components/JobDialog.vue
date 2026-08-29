<script setup>
import { JOBS_DATA } from '../constants/jobs'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'select'])

function handleSelect(subJob) {
  emit('select', subJob)
  emit('update:modelValue', false)
}

function getImageUrl(name, type) {
  return `/image/${type}/${name}`
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="选择职业"
    width="1200px"
    class="job-picker-dialog"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    @update:model-value="val => $emit('update:modelValue', val)"
  >
    <div class="job-picker-container">
      <div class="sub-jobs-content">
        <div v-for="baseJob in JOBS_DATA" :key="baseJob.name" class="base-job-group">
          <div class="base-job-header">
            <img :src="getImageUrl(baseJob.icon, 'sub')" class="base-job-header-icon" />
            <span class="base-job-header-name">{{ baseJob.name }}</span>
            <div class="header-line"></div>
          </div>
          <div class="sub-jobs-grid">
            <div
              v-for="subJob in baseJob.subJobs"
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
    </div>
  </el-dialog>
</template>

<style scoped>
.job-picker-container {
  display: flex;
  height: 70vh;
  background: #0f1112;
  color: #fff;
  overflow: hidden;
  font-family: "Microsoft YaHei", sans-serif;
}

.sub-jobs-content {
  flex: 1;
  padding: 20px 30px;
  overflow-y: auto;
  background: #0f1112;
}

.base-job-group {
  margin-bottom: 40px;
}

.base-job-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.base-job-header-icon {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.5));
}

.base-job-header-name {
  font-size: 18px;
  color: #d4af37;
  font-weight: bold;
  white-space: nowrap;
}

.header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.5), transparent);
}

.sub-jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

