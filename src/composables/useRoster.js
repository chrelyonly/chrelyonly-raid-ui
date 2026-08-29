import {computed, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'

// 预定义一组好看的配色
const USER_PALETTE = [
  { bg: '#e0f2fe', text: '#0369a1' }, // 浅蓝
  { bg: '#fef3c7', text: '#b45309' }, // 浅黄
  { bg: '#dcfce7', text: '#15803d' }, // 浅绿
  { bg: '#f3e8ff', text: '#7e22ce' }, // 浅紫
  { bg: '#ffe4e6', text: '#be123c' }, // 浅粉
  { bg: '#ecfeff', text: '#0e7490' }, // 浅青
  { bg: '#fff7ed', text: '#c2410c' }, // 浅橙
  { bg: '#f1f5f9', text: '#334155' }, // 灰蓝
]

function getUserColor(userName) {
  if (!userName) return USER_PALETTE[0]
  // 简单的哈希算法，确保同一个用户总是得到同一个颜色
  let hash = 0
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % USER_PALETTE.length
  return USER_PALETTE[index]
}

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
          const color = getUserColor(member.UserName)

          memberNodes.push({
            id: member.UserName,
            label: member.DisplayName || member.NickName,
            isUser: true,
            avatar: member.SmallHeadImgUrl,
            userColor: color,
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

  const waves = ref([])

  const loadWaves = async () => {
    try {
      const res = await window.$https("/dnf-api/getDnfRaid", "get", {}, 1, {})
      const data = res.data.data || res.data
      if (data && Array.isArray(data)) {
        waves.value = data.map(item => {
          // 优先尝试从 userList 解析编队信息，如果为空则尝试 teams
          const teamsStr = item.userList || item.teams
          let teams = typeof teamsStr === 'string' ? JSON.parse(teamsStr) : teamsStr

          // 如果编队数据为空，根据副本类型初始化默认编队
          if (!teams || teams.length === 0) {
            const is12Person = (item.type === 2 || item.type === '2')
            if (is12Person) {
              teams = [
                { id: Date.now() + '-red', name: '红队', members: [null, null, null, null] },
                { id: Date.now() + '-yellow', name: '黄队', members: [null, null, null, null] },
                { id: Date.now() + '-green', name: '绿队', members: [null, null, null, null] }
              ]
            } else {
              teams = [{ id: Date.now() + '-red', name: '红队', members: [null, null, null, null] }]
            }
          }

          return {
            ...item,
            // 统一字段名，兼容旧代码和后端字段
            mode: (item.type === 1 || item.type === '1') ? '4人周本' :
                  (item.type === 2 || item.type === '2') ? '12人团本' : (item.mode || '未知模式'),
            time: item.time || item.date,
            boss: item.boss || item.bossName,
            place: item.place || item.address,
            teams: teams
          }
        })
      }
    } catch (e) {
      console.error('Failed to load raid data', e)
    }
  }

  // 初始化加载
  loadData()
  loadWaves()

  const roleMap = computed(() => new Map(roles.value.map(role => [role.id, role])))

  const getRole = (id) => {
    const role = roleMap.value.get(id)
    if (!role) return null

    // 额外处理一下头像和所属人名称
    const owner = users.value.find(u => u.userName === role.ownerId)
    const color = getUserColor(role.ownerId)

    return {
      ...role,
      ownerName: owner ? (owner.displayName || owner.nickName) : '',
      ownerColor: color,
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
    try {
      // 如果没有编队数据，根据副本类型初始化默认编队并存入 userList
      if (!waveData.userList && (!waveData.teams || waveData.teams.length === 0)) {
        const is12Person = (waveData.type === 2 || waveData.type === '2')
        let initialTeams = []
        if (is12Person) {
          initialTeams = [
            { id: Date.now() + '-red', name: '红队', members: [null, null, null, null] },
            { id: Date.now() + '-yellow', name: '黄队', members: [null, null, null, null] },
            { id: Date.now() + '-green', name: '绿队', members: [null, null, null, null] }
          ]
        } else {
          initialTeams = [{ id: Date.now() + '-red', name: '红队', members: [null, null, null, null] }]
        }
        waveData.userList = JSON.stringify(initialTeams)
      }

      await window.$https("/dnf-api/addDnfRaid", "post", waveData, 2, {})
      ElMessage.success('🎉 攻坚队创建成功')
      await loadWaves()
    } catch (e) {
      console.error('Add wave failed:', e)
      ElMessage.error('创建失败')
    }
  }


  const saveWaveTeams = async (wave) => {
    try {
      const submitData = {
        ...wave,
        userList: JSON.stringify(wave.teams)
      }
      await window.$https("/dnf-api/addDnfRaid", "post", submitData, 2, {})
      ElMessage.success(`💾 ${wave.name} 编队保存成功`)
    } catch (e) {
      ElMessage.error('保存失败')
    }
  }

  const delWave = async (wave) => {
    try {
      await window.$https("/dnf-api/delDnfRaid", "post", wave, 2, {})
      ElMessage.success(`✅ 波次「${wave.name}」已删除`)
      await loadWaves()
    } catch (e) {
      ElMessage.error('删除波次失败')
    }
  }

  const sendWaveNotification = async (wave) => {
    try {
      // 二次确认
      await ElMessageBox.confirm(
        `确定要向所有队员发送「${wave.name}」的攻坚通知吗？`,
        '发送确认',
        {
          confirmButtonText: '立即发送',
          cancelButtonText: '取消',
          type: 'info'
        }
      )

      // 1. 收集所有接收者的账号 ID (发起人 + 所有队员)
      const recipientIds = new Set()

      // 查找发起人的真实 ID
      let leaderId = wave.ownerId || ''
      const ownerUser = users.value.find(u =>
        (wave.ownerId && u.userName === wave.ownerId) ||
        (wave.masterName && (u.displayName === wave.masterName || u.nickName === wave.masterName))
      )
      if (ownerUser) leaderId = ownerUser.userName
      if (leaderId) recipientIds.add(leaderId)

      // 收集所有队员的账号 ID
      wave.teams.forEach(team => {
        team.members.forEach(roleId => {
          if (roleId) {
            const role = getRole(roleId)
            if (role && role.ownerId) {
              recipientIds.add(role.ownerId)
            }
          }
        })
      })

      // 转换为逗号分隔字符串
      const finalOwnerIds = Array.from(recipientIds).join(',')

      // 校验必须有接收者
      if (!finalOwnerIds) {
        ElMessage.warning(`⚠️ 无法识别接收者账号ID，请确保发起人填写正确或已分配队员`)
        return
      }

      // 2. 构造通知文本
      let msg = `【${wave.name}】攻坚通知\n`
      msg += `⏰ 时间：${wave.time || wave.date}\n`
      msg += `📍 地点：${wave.place || wave.address}\n`
      msg += `👾 Boss：${wave.boss || wave.bossName}\n`
      msg += `------------------\n`

      wave.teams.forEach(team => {
        msg += `🛡️ ${team.name}：\n`
        const memberDetails = team.members.map(id => {
          if (!id) return '[空缺]'

          const role = getRole(id)
          if (!role) return '[未知角色]'

          const owner = users.value.find(u => u.userName === role.ownerId)
          let ownerDisplay = owner ? (owner.displayName || owner.nickName || '未知') : '匿名'

          return `[@${ownerDisplay}] ${role.name}`
        })
        msg += `   ${memberDetails.join(' | ')}\n`
      })

      // 3. 发送请求，所有 ID 都放入 ownerId 字段，不再使用单独的 ids 字段
      const payload = {
        msg: msg,
        ownerId: finalOwnerIds
      }

      await window.$https("/dnf-api/sendMsg", "post", payload, 2, {})
      ElMessage.success(`📢 ${wave.name} 通知已发送`)
    } catch (e) {
      console.error('Notification Error:', e)
      ElMessage.error('通知发送失败')
    }
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

  const delRole = async (role) => {
    try {
      await window.$https("/dnf-api/delRole", "post", role, 2, {})
      ElMessage.success(`✅ 角色「${role.name}」已从数据库移除`)
      await loadData()
    } catch (e) {
      ElMessage.error('删除角色失败')
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
    saveWaveTeams,
    sendWaveNotification,
    delWave,
    addRole,
    delRole,
    refreshData: async () => {
      await loadData()
      await loadWaves()
    }
  }
}
