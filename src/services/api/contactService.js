import contactsData from '@/services/mockData/contacts.json'

let contacts = [...contactsData]

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const contactService = {
  async getAll() {
    await delay(200)
    return [...contacts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  },

  async getById(id) {
    await delay(150)
    const contact = contacts.find(c => c.Id === parseInt(id))
    return contact ? { ...contact } : null
  },

  async create(contactData) {
    await delay(300)
    const newContact = {
      Id: Math.max(...contacts.map(c => c.Id), 0) + 1,
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    contacts.push(newContact)
    return { ...newContact }
  },

  async update(id, updates) {
    await delay(250)
    const index = contacts.findIndex(c => c.Id === parseInt(id))
    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      return { ...contacts[index] }
    }
    throw new Error('Contact not found')
  },

  async delete(id) {
    await delay(200)
    const index = contacts.findIndex(c => c.Id === parseInt(id))
    if (index !== -1) {
      const deletedContact = contacts.splice(index, 1)[0]
      return { ...deletedContact }
    }
    throw new Error('Contact not found')
  },

  async search(query) {
    await delay(150)
    const lowercaseQuery = query.toLowerCase()
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.email.toLowerCase().includes(lowercaseQuery) ||
      contact.company.toLowerCase().includes(lowercaseQuery)
    )
  }
}