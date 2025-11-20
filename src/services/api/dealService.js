import dealsData from '@/services/mockData/deals.json'

let deals = [...dealsData]

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const dealService = {
  async getAll() {
    await delay(200)
    return [...deals].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  },

  async getById(id) {
    await delay(150)
    const deal = deals.find(d => d.Id === parseInt(id))
    return deal ? { ...deal } : null
  },

  async getByContactId(contactId) {
    await delay(150)
    return deals.filter(d => d.contactId === parseInt(contactId)).map(d => ({ ...d }))
  },

  async getByStage(stage) {
    await delay(150)
    return deals.filter(d => d.stage === stage).map(d => ({ ...d }))
  },

  async create(dealData) {
    await delay(300)
    const newDeal = {
      Id: Math.max(...deals.map(d => d.Id), 0) + 1,
      ...dealData,
      contactId: parseInt(dealData.contactId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    deals.push(newDeal)
    return { ...newDeal }
  },

  async update(id, updates) {
    await delay(250)
    const index = deals.findIndex(d => d.Id === parseInt(id))
    if (index !== -1) {
      deals[index] = {
        ...deals[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      return { ...deals[index] }
    }
    throw new Error('Deal not found')
  },

  async delete(id) {
    await delay(200)
    const index = deals.findIndex(d => d.Id === parseInt(id))
    if (index !== -1) {
      const deletedDeal = deals.splice(index, 1)[0]
      return { ...deletedDeal }
    }
    throw new Error('Deal not found')
  },

  async updateStage(id, newStage) {
    await delay(200)
    const index = deals.findIndex(d => d.Id === parseInt(id))
    if (index !== -1) {
      deals[index] = {
        ...deals[index],
        stage: newStage,
        updatedAt: new Date().toISOString()
      }
      return { ...deals[index] }
    }
    throw new Error('Deal not found')
  }
}