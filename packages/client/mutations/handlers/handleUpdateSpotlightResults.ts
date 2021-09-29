import safeRemoveNodeFromArray from '~/utils/relay/safeRemoveNodeFromArray'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import getNextSortOrder from '~/utils/getNextSortOrder'
import addNodeToArray from '~/utils/relay/addNodeToArray'

// if a remote user groups/ungroups a result, a reflectionGroupId is created or removed
// update the similarReflectionGroup to reflect this
const handleUpdateSpotlightResults = (
  reflection: RecordProxy,
  reflectionGroup: RecordProxy,
  oldReflectionGroupId: string,
  store: RecordSourceSelectorProxy
) => {
  const reflectionGroupId = reflection.getValue('reflectionGroupId')
  const reflectionId = reflection.getValue('id')
  if (reflectionGroupId === oldReflectionGroupId) return
  const meetingId = reflection.getValue('meetingId') as string
  const meeting = store.get(meetingId)
  if (!meeting) return
  const spotlightReflection = meeting?.getLinkedRecord('spotlightReflection')
  const spotlightReflectionId = spotlightReflection?.getValue('id')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer || !spotlightReflectionId) return
  const similarReflectionGroups = viewer.getLinkedRecords('similarReflectionGroups', {
    reflectionId: spotlightReflectionId,
    searchQuery: ''
  })
  if (!similarReflectionGroups) return
  const wasInSpotlightGroups = similarReflectionGroups.find(
    (group) => group.getValue('id') === oldReflectionGroupId
  )
  const isInSpotlightGroups = similarReflectionGroups.find(
    (group) => group.getValue('id') === reflectionGroupId
  )
  // added to an existing group. old reflection group needs to be removed
  if (isInSpotlightGroups && wasInSpotlightGroups) {
    const removedReflectionGroup = store.get(oldReflectionGroupId)
    // make sure the old group is empty
    const oldReflections = removedReflectionGroup?.getLinkedRecords('reflections')
    const oldReflectionIds = oldReflections?.map((reflection) => reflection.getValue('id'))
    if (oldReflectionIds?.length === 1 && oldReflectionIds[0] === reflectionId) {
      safeRemoveNodeFromArray(oldReflectionGroupId, viewer, 'similarReflectionGroups', {
        storageKeyArgs: {
          reflectionId: spotlightReflectionId,
          searchQuery: ''
        }
      })
    }
  }
  // ungrouping created a new group id which needs to be added to Spotlight
  else if (!isInSpotlightGroups && wasInSpotlightGroups) {
    const sortOrders = similarReflectionGroups.map((group) => ({
      sortOrder: group.getValue('sortOrder') as number
    }))
    const nextSortOrder = getNextSortOrder(sortOrders)
    reflectionGroup.setValue(nextSortOrder, 'sortOrder')
    addNodeToArray(reflectionGroup, viewer, 'similarReflectionGroups', 'sortOrder', {
      storageKeyArgs: {
        reflectionId: spotlightReflectionId,
        searchQuery: ''
      }
    })
  }
}

export default handleUpdateSpotlightResults
