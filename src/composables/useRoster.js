import {computed, ref} from 'vue'
import {ElMessage} from 'element-plus'

export function useRoster() {
  const roles = ref([])
  const rawGroups = ref([]) // 原始群组数据
  const users = ref([])     // 所有用户列表

  const loadData = async () => {
    try {
      const res = await window.$https("/dnf-api/getUserInfo", "get", {}, 1, {})
      // 兼容两种返回格式
      const data = res.data.data || res.data
      if (data) {
        rawGroups.value = data
        const allUsers = []
        const allRoles = []

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

              // 提取该用户下的角色列表
              if (m.userList && Array.isArray(m.userList)) {
                m.userList.forEach(u => {
                  allRoles.push({
                    ...u,
                    ownerId: m.UserName,
                    // 适配显示逻辑：辅助(3)显示奶量，其它显示伤害
                    displayDamage: (u.type === 3 || u.type === '3') ? (u.healing || '0') : (u.damage || '0')
                  })
                })
              }
            })
          }
        })

        users.value = allUsers
        roles.value = allRoles
      }
    } catch (e) {
      console.error('Failed to load roster data', e)
    }
  }

  // 计算树形结构：群组 -> 用户 -> 角色
  const groups = computed(() => {
    return rawGroups.value.map(rg => {
      const memberNodes = []
      if (rg.groupList) {
        rg.groupList.forEach(member => {
          const memberRoles = roles.value.filter(r => r.ownerId === member.UserName)

          memberNodes.push({
            id: member.UserName,
            label: member.DisplayName || member.NickName,
            isUser: true,
            avatar: member.SmallHeadImgUrl,
            children: memberRoles.map(r => ({
              id: r.id,
              label: r.name,
              role: {
                ...r,
                avatar: member.SmallHeadImgUrl, // 角色头像跟随用户
                damage: r.displayDamage || r.damage // 确保显示正确的数值
              }
            }))
          })
        })
      }

      return {
        id: rg.id,
        label: rg.name,
        children: memberNodes
      }
    })
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

  const getRole = (id) => {
    const role = roleMap.value.get(id)
    if (!role) return null

    // 额外处理一下头像，因为 role 本身可能没存头像，需要从用户那里拿
    const owner = users.value.find(u => u.userName === role.ownerId)
    return {
      ...role,
      avatar: owner ? owner.avatar : role.avatar,
      damage: role.displayDamage || role.damage
    }
  }

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

  const autoAssignRole = (roleId) => {
    const role = getRole(roleId)
    if (!role) return

    // 确定角色职能
    const isSupport = role.type == 3 || role.type === '辅助'
    const targetSlots = isSupport ? [3] : [0, 1, 2]
    const roleTypeName = isSupport ? '辅助' : '输出'

    // 先检查是否已经在排班中，如果在，可以提示或者先移除
    removeRoleFromAllWaves(roleId)

    // 寻找第一个符合条件的空位
    for (const wave of waves.value) {
      for (const team of wave.teams) {
        for (const slotIndex of targetSlots) {
          if (team.members[slotIndex] === null) {
            team.members[slotIndex] = roleId
            ElMessage.success({
              message: `✨ 「${role.name}」已自动分配至：${wave.name} - ${team.name} (${slotIndex < 3 ? '输出位' : '辅助位'})`,
              duration: 3000
            })
            return true
          }
        }
      }
    }

    ElMessage.warning(`⚠️ 抱歉，当前所有波次的${roleTypeName}位置已满`)
    return false
  }


  const addWave = async (waveData) => {
    const res = await window.$https("/dnf-api/addDnfRaid", "post", waveData, 2, {})
    const newRole = res.data.data || res.data
    ElMessage.success('🎉 攻坚队创建成功')
  }


  const addRole = async (roleData) => {
    try {
      // 将前端定义的类型转回后端数值 (1输出 2辅助)
      const submitData = {
        ...roleData,
      }

      const res = await window.$https("/dnf-api/addRole", "post", submitData, 2, {})
      const newRole = res.data.data || res.data

      if (newRole) {
        roles.value.push({
          ...newRole,
          ownerId: roleData.ownerId,
          jobImage: roleData.jobImage, // 确保保存职业图片
          displayDamage: (newRole.type === 3 || newRole.type === '3') ? (newRole.healing || '0') : (newRole.damage || '0')
        })
        ElMessage.success(`✅ 角色「${newRole.name}」已添加`)
      }
    } catch (e) {
      ElMessage.error('添加角色失败')
    }
  }

  return {
    roles,
    users,
    groups,
    waves,
    getRole,
    assignedCount,
    removeRoleFromAllWaves,
    autoAssignRole,
    addWave,
    addRole,
    refreshData: loadData
  }
}
