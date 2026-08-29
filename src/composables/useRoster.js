import {computed, ref} from 'vue'
import {ElMessage} from 'element-plus'

export function useRoster() {
  const roles = ref([])
  const rawGroups = ref([]) // 原始群组数据
  const users = ref([])     // 所有用户列表

  const loadData = async () => {
    try {
      const res = await window.$https("/dnf-api/getGroupInfo", "get", {}, 1, {})
      // 兼容两种返回格式
      const data = res.data.data || res.data
      if (data) {
        rawGroups.value = data
        const allUsers = []
        data.forEach(g => {
          if (g.groupList) {
            g.groupList.forEach(m => {
              allUsers.push({
                userName: m.UserName,
                nickName: m.NickName,
                displayName: m.DisplayName,
                avatar: m.SmallHeadImgUrl,
                groupId: g.id,
                groupName: g.name
              })
            })
          }
        })
        users.value = allUsers
      }
    } catch (e) {
      console.error('Failed to load users', e)
    }
  }

  // 计算树形结构：群组 -> 用户 -> 角色
  const groups = computed(() => {
    return rawGroups.value.map(rg => {
      const groupRoles = []
      if (rg.groupList) {
        rg.groupList.forEach(user => {
          const userRoles = roles.value.filter(r => r.ownerId === user.UserName)
          if (userRoles.length > 0) {
            groupRoles.push({
              id: user.UserName,
              label: user.DisplayName || user.NickName,
              isUser: true,
              children: userRoles.map(r => ({
                id: r.id,
                label: r.name,
                role: r
              }))
            })
          }
        })
      }

      return {
        id: rg.id,
        label: rg.name,
        children: groupRoles
      }
    }).filter(g => g.children.length > 0)
  })

  // 初始化加载
  loadData()

  const waves = ref([
    {
      id: 1,
      name: '第 1 波',
      mode: '4人周本',
      time: '20:00',
      boss: '雾神·雨',
      place: '雾神尼',
      teams: [
        { id: '1-1', name: '红队', members: [null, null, null, null] }
      ]
    }
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

  const addRole = async (roleData) => {
    const res = await window.$https("/dnf-api/addRole", "post", roleData, 2, {})
    // 兼容两种返回格式
    const data = res.data
    roles.value.push(data)
    ElMessage.success(`✅ 角色「${data.userName}」已添加`)
  }

  return {
    roles,
    users,
    groups,
    waves,
    getRole,
    assignedCount,
    removeRoleFromAllWaves,
    deleteWave,
    addWave,
    updateWave,
    addRole
  }
}
