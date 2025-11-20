import activitiesData from '@/services/mockData/activities.json'

let activities = [...activitiesData]

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const activityService = {
  async getAll() {
    await delay(200)
    return [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  },

  async getByContactId(contactId) {
    await delay(150)
    return activities
      .filter(a => a.contactId === parseInt(contactId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(a => ({ ...a }))
  },

  async create(activityData) {
    await delay(200)
    const newActivity = {
      Id: Math.max(...activities.map(a => a.Id), 0) + 1,
      ...activityData,
      contactId: parseInt(activityData.contactId),
      timestamp: new Date().toISOString()
    }
    activities.push(newActivity)
    return { ...newActivity }
  },

  async delete(id) {
    await delay(150)
    const index = activities.findIndex(a => a.Id === parseInt(id))
    if (index !== -1) {
      const deletedActivity = activities.splice(index, 1)[0]
      return { ...deletedActivity }
    }
    throw new Error('Activity not found')
  }
}