import {computed, ref} from 'vue'
import {ElMessage} from 'element-plus'

export function useRoster() {
  const roles = ref([])
  const groups = ref([])

  const loadRoles = async () => {
    try {
      const res = await window.$https("/dnf-api/getUserInfo", "get", {}, 1, {})

      if (res.data) {
        const allRoles = []
        groups.value = res.data.map(group => ({
          id: group.id,
          label: group.name,
          children: group.groupList.map(member => {
            const role = {
              id: member.UserName,
              name: member.DisplayName || member.NickName,
              avatar: member.SmallHeadImgUrl,
              job: '群成员',
              type: '',
              position: '输出',
              damage: member.NickName || 'DNF玩家',
              color: '#4b8cff'
            }
            allRoles.push(role)
            return {
              id: member.UserName,
              label: role.name,
              role: role
            }
          })
        }))
        roles.value = allRoles
      }
    } catch (e) {
      console.error('Failed to load roles', e)
    }
  }

  // Load initially
  loadRoles()

  const waves = ref([
    {
      id: 1,
      name: '第 1 波',
      mode: '4人周本',
      time: '20:00',
      boss: '雾神·雨',
      place: '雾神尼',
      teams: [
        { id: '1-1', name: '红队', members: [1, 2, 7, 3] }
      ]
    },
    {
      id: 2,
      name: '第 2 波',
      mode: '4人周本',
      time: '21:30',
      boss: '雾神·雨',
      place: '雾神尼',
      teams: [
        { id: '2-1', name: '红队', members: [4, 6, null, 5] }
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
      ElMessage.success(`${waveName} 🗑️ 已删除`)
    }
  }

  const addWave = (waveData) => {
    const maxId = waves.value.length ? Math.max(...waves.value.map(item => item.id)) : 0
    const newId = maxId + 1

    // Initialize teams based on mode
    const teamCount = waveData.mode === '12人团本' ? 3 : 1
    const teamNames = ['红队', '黄队', '绿队']
    const teams = []
    for (let i = 1; i <= teamCount; i++) {
      teams.push({
        id: `${newId}-${i}`,
        name: teamNames[i - 1],
        members: [null, null, null, null]
      })
    }

    waves.value.push({
      id: newId,
      name: `第 ${waves.value.length + 1} 波`,
      ...waveData,
      teams
    })
    ElMessage.success('🎉 攻坚队创建成功')
  }

  const updateWave = (waveId, waveData) => {
    const index = waves.value.findIndex(w => w.id === waveId)
    if (index !== -1) {
      const currentWave = waves.value[index]

      // If mode changed, we might need to reset teams
      if (currentWave.mode !== waveData.mode) {
        const teamCount = waveData.mode === '12人团本' ? 3 : 1
        const teamNames = ['红队', '黄队', '绿队']
        const teams = []
        for (let i = 1; i <= teamCount; i++) {
          teams.push({
            id: `${waveId}-${i}`,
            name: teamNames[i - 1],
            members: [null, null, null, null]
          })
        }
        waves.value[index] = { ...currentWave, ...waveData, teams }
      } else {
        waves.value[index] = { ...currentWave, ...waveData }
      }

      ElMessage.success('✅ 更新成功')
    }
  }

  return {
    roles,
    groups,
    waves,
    getRole,
    assignedCount,
    removeRoleFromAllWaves,
    deleteWave,
    addWave,
    updateWave
  }
}
