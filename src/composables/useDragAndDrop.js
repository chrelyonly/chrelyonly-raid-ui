import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useDragAndDrop(getRole, removeRoleFromAllWaves) {
  const draggedRoleId = ref(null)
  const draggedSource = ref(null)

  const startDrag = (role) => {
    draggedRoleId.value = role.id
    draggedSource.value = 'role'
  }

  const startAssignedDrag = (roleId, team, index) => {
    draggedRoleId.value = roleId
    draggedSource.value = {
      type: 'assigned',
      teamId: team.id,
      index,
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

    // DNF Standard: 3 DPS (0, 1, 2) + 1 Buffer (3)
    const targetPosition = index < 3 ? '输出' : '辅助'
    const rolePosition = role.position || (role.type === '辅助' ? '辅助' : '输出')

    if (rolePosition !== targetPosition) {
      ElMessage.warning(`「${role.name}」属于${rolePosition}，不能放入${targetPosition}位置`)
      endDrag()
      return
    }

    // Role Swapping Logic
    const oldRoleId = team.members[index]

    // If it's the same role at same position, do nothing
    if (oldRoleId === role.id) {
      endDrag()
      return
    }

    // Remove from previous position if it exists in ANY team in ANY wave
    removeRoleFromAllWaves(role.id)

    // Assign to new position
    team.members[index] = role.id

    ElMessage.success(`「${role.name}」已加入${team.name}`)
    endDrag()
  }

  const dropDelete = () => {
    if (!draggedRoleId.value) return
    const role = getRole(draggedRoleId.value)
    removeRoleFromAllWaves(draggedRoleId.value)
    if (role) {
      ElMessage.success(`「${role.name}」已移出排班`)
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
