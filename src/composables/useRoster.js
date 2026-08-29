import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export function useRoster() {
  const roles = ref([
    { id: 1, name: '云上长安', job: '剑魂', type: '大C', position: '输出', damage: '7.28w', color: '#4b8cff' },
    { id: 2, name: '阿拉德旅人', job: '旅人', type: '小C', position: '输出', damage: '6.92w', color: '#c78638' },
    { id: 3, name: '神启·奶爸', job: '圣骑士', type: '辅助', position: '辅助', damage: '2.15w', color: '#b57bdf' },
    { id: 4, name: '雾神的低语', job: '女气功', type: '大C', position: '输出', damage: '6.55w', color: '#d06577' },
    { id: 5, name: '月下独酌', job: '缪斯', type: '辅助', position: '辅助', damage: '2.08w', color: '#e29058' },
    { id: 6, name: '赤霄剑意', job: '剑帝', type: '小C', position: '输出', damage: '6.31w', color: '#e4573e' },
    { id: 7, name: '念气环绕', job: '男气功', type: '混子', position: '输出', damage: '6.72w', color: '#3ba888' },
    { id: 8, name: '炽天使', job: '女圣职', type: '辅助', position: '辅助', damage: '2.21w', color: '#cc74ba' },
  ])

  const waves = ref([
    {
      id: 1,
      name: '第一波',
      mode: '4人周本',
      time: '20:00',
      boss: '雾神·雨',
      place: '雾神尼',
      teams: [
        { id: '1-1', name: '小队 1', members: [1, 2, 7, 3] }
      ]
    },
    {
      id: 2,
      name: '第二波',
      mode: '4人周本',
      time: '21:30',
      boss: '雾神·雨',
      place: '雾神尼',
      teams: [
        { id: '2-1', name: '小队 1', members: [4, 6, null, 5] }
      ]
    },
  ])

  const roleMap = computed(() => new Map(roles.value.map(role => [role.id, role])))

  const getRole = (id) => roleMap.value.get(id)

  const assignedIds = computed(() => {
    const ids = new Set()
    waves.value.forEach(wave => {
      wave.teams.forEach(team => {
        team.members.forEach(memberId => {
          if (memberId) ids.add(memberId)
        })
      })
    })
    return ids
  })

  const assignedCount = computed(() => assignedIds.value.size)

  const removeRoleFromAllWaves = (roleId) => {
    waves.value.forEach(wave => {
      wave.teams.forEach(team => {
        team.members = team.members.map(id => (id === roleId ? null : id))
      })
    })
  }

  const deleteWave = (waveId) => {
    const index = waves.value.findIndex(item => item.id === waveId)
    if (index !== -1) {
      const waveName = waves.value[index].name
      waves.value.splice(index, 1)
      ElMessage.success(`${waveName} 已删除`)
    }
  }

  const addWave = (waveData) => {
    const maxId = waves.value.length ? Math.max(...waves.value.map(item => item.id)) : 0
    const newId = maxId + 1

    // Initialize teams based on mode
    const teamCount = waveData.mode === '12人团本' ? 3 : 1
    const teams = []
    for (let i = 1; i <= teamCount; i++) {
      teams.push({
        id: `${newId}-${i}`,
        name: `小队 ${i}`,
        members: [null, null, null, null]
      })
    }

    waves.value.push({
      id: newId,
      name: `第${waves.value.length + 1}波`,
      ...waveData,
      teams
    })
    ElMessage.success('攻坚队创建成功')
  }

  const updateWave = (waveId, waveData) => {
    const index = waves.value.findIndex(w => w.id === waveId)
    if (index !== -1) {
      const currentWave = waves.value[index]

      // If mode changed, we might need to reset teams
      if (currentWave.mode !== waveData.mode) {
        const teamCount = waveData.mode === '12人团本' ? 3 : 1
        const teams = []
        for (let i = 1; i <= teamCount; i++) {
          teams.push({
            id: `${waveId}-${i}`,
            name: `小队 ${i}`,
            members: [null, null, null, null]
          })
        }
        waves.value[index] = { ...currentWave, ...waveData, teams }
      } else {
        waves.value[index] = { ...currentWave, ...waveData }
      }

      ElMessage.success('更新成功')
    }
  }

  return {
    roles,
    waves,
    getRole,
    assignedCount,
    removeRoleFromAllWaves,
    deleteWave,
    addWave,
    updateWave
  }
}
