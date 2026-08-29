import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useDragAndDrop(getRole, removeRoleFromAllWaves) {
  const draggedRoleId = ref(null)
  const draggedSource = ref(null)

  const startDrag = (role) => {
    draggedRoleId.value = role.id
    draggedSource.value = { type: 'role' }
  }

  const startAssignedDrag = (roleId, team, index) => {
    draggedRoleId.value = roleId
    draggedSource.value = {
      type: 'assigned',
      team: team, // 存储团队引用
      index: index,
    }
  }

  const endDrag = () => {
    draggedRoleId.value = null
    draggedSource.value = null
  }

  const dropRole = (team, index) => {
    if (!draggedRoleId.value) return

    const role = getRole(draggedRoleId.value)
    if (!role) return

    // 1. 目标位置职能校验 (3 DPS + 1 Buffer)
    const targetPositionRequirement = index < 3 ? '输出' : '辅助'
    const rolePosition = role.position || (role.type === '辅助' ? '辅助' : '输出')

    if (rolePosition !== targetPositionRequirement) {
      ElMessage.warning(`⚠️ 「${role.name}」是${rolePosition}，不能放入${targetPositionRequirement}位哦`)
      endDrag()
      return
    }

    const oldRoleIdAtTarget = team.members[index]
    if (oldRoleIdAtTarget === role.id) {
      endDrag()
      return
    }

    // 2. 执行逻辑：区分 [从库拖入] 和 [位置交换]
    if (draggedSource.value && draggedSource.value.type === 'assigned') {
      const sourceTeam = draggedSource.value.team
      const sourceIndex = draggedSource.value.index

      if (oldRoleIdAtTarget) {
        // --- 真正的交换逻辑 ---
        const roleAtTarget = getRole(oldRoleIdAtTarget)
        const sourcePositionRequirement = sourceIndex < 3 ? '输出' : '辅助'
        const roleAtTargetPos = roleAtTarget.position || (roleAtTarget.type === '辅助' ? '辅助' : '输出')

        // 也要校验被换的人能不能去出发地
        if (roleAtTargetPos === sourcePositionRequirement) {
          // 双向奔赴，完美对调
          sourceTeam.members[sourceIndex] = oldRoleIdAtTarget
          team.members[index] = role.id
          ElMessage.success(`🔄 「${role.name}」与「${roleAtTarget.name}」已互换位置`)
        } else {
          // 被换的人去不了出发地，则被挤回角色库
          sourceTeam.members[sourceIndex] = null
          team.members[index] = role.id
          ElMessage.success(`✨ 「${role.name}」已就位，原成员已移回角色库`)
        }
      } else {
        // 只是单纯移动到空位
        sourceTeam.members[sourceIndex] = null
        team.members[index] = role.id
        ElMessage.success(`🚚 「${role.name}」已移动到新位置`)
      }
    } else {
      // 从左侧角色库拖入
      removeRoleFromAllWaves(role.id)
      team.members[index] = role.id
      ElMessage.success(`✨ 「${role.name}」已加入 ${team.name} 🎉`)
    }

    endDrag()
  }

  const dropDelete = () => {
    if (!draggedRoleId.value) return
    const role = getRole(draggedRoleId.value)
    removeRoleFromAllWaves(draggedRoleId.value)
    if (role) {
      ElMessage.success(`👋 「${role.name}」已从排班表中撤离`)
    }
    endDrag()
  }

  return {
    draggedRoleId,
    startDrag,
    startAssignedDrag,
    endDrag,
    dropRole,
    dropDelete
  }
}
