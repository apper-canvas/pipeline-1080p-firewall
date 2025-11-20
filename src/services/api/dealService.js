import { getApperClient } from '@/services/apperClient'
import { toast } from 'react-toastify'

export const dealService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error('ApperClient not initialized')
      }

      const response = await apperClient.fetchRecords('deals_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expectedCloseDate_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "updatedAt_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "contactId_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        orderBy: [{"fieldName": "updatedAt_c", "sorttype": "DESC"}]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error)
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error('ApperClient not initialized')
      }

      const response = await apperClient.getRecordById('deals_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expectedCloseDate_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "updatedAt_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "contactId_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      })

      if (!response.success) {
        console.error(response.message)
        return null
      }

      return response.data || null
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error('ApperClient not initialized')
      }

      const response = await apperClient.fetchRecords('deals_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expectedCloseDate_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "updatedAt_c"}},
          {"field": {"Name": "contactId_c"}}
        ],
        where: [{"FieldName": "contactId_c", "Operator": "EqualTo", "Values": [parseInt(contactId)]}],
        orderBy: [{"fieldName": "updatedAt_c", "sorttype": "DESC"}]
      })

      if (!response.success) {
        console.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching deals by contact:", error?.response?.data?.message || error)
      return []
    }
  },

  async getByStage(stage) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error('ApperClient not initialized')
      }

      const response = await apperClient.fetchRecords('deals_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expectedCloseDate_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "contactId_c"}}
        ],
        where: [{"FieldName": "stage_c", "Operator": "EqualTo", "Values": [stage]}]
      })

      if (!response.success) {
        console.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching deals by stage:", error?.response?.data?.message || error)
      return []
    }
  },

  async create(dealData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error('ApperClient not initialized')
      }

      // Only include Updateable fields
      const params = {
        records: [{
          Name: dealData.title || dealData.title_c || dealData.Name,
          title_c: dealData.title || dealData.title_c,
          value_c: parseFloat(dealData.value || dealData.value_c),
          stage_c: dealData.stage || dealData.stage_c,
          probability_c: parseInt(dealData.probability || dealData.probability_c),
          expectedCloseDate_c: dealData.expectedCloseDate || dealData.expectedCloseDate_c,
          notes_c: dealData.notes || dealData.notes_c,
          contactId_c: parseInt(dealData.contactId || dealData.contactId_c),
          updatedAt_c: new Date().toISOString()
        }]
      }

      const response = await apperClient.createRecord('deals_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, failed)
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`))
            }
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }

      throw new Error('No response data')
    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error('ApperClient not initialized')
      }

      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          ...(updates.title || updates.title_c || updates.Name ? {
            Name: updates.title || updates.title_c || updates.Name,
            title_c: updates.title || updates.title_c || updates.Name
          } : {}),
          ...(updates.value !== undefined || updates.value_c !== undefined ? {value_c: parseFloat(updates.value || updates.value_c)} : {}),
          ...(updates.stage || updates.stage_c ? {stage_c: updates.stage || updates.stage_c} : {}),
          ...(updates.probability !== undefined || updates.probability_c !== undefined ? {probability_c: parseInt(updates.probability || updates.probability_c)} : {}),
          ...(updates.expectedCloseDate || updates.expectedCloseDate_c ? {expectedCloseDate_c: updates.expectedCloseDate || updates.expectedCloseDate_c} : {}),
          ...(updates.notes || updates.notes_c ? {notes_c: updates.notes || updates.notes_c} : {}),
          ...(updates.contactId || updates.contactId_c ? {contactId_c: parseInt(updates.contactId || updates.contactId_c)} : {}),
          updatedAt_c: new Date().toISOString()
        }]
      }

      const response = await apperClient.updateRecord('deals_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, failed)
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`))
            }
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }

      throw new Error('No response data')
    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error)
      throw error
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error('ApperClient not initialized')
      }

      const response = await apperClient.deleteRecord('deals_c', {
        RecordIds: [parseInt(id)]
      })

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0
      }

      return false
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error)
      return false
    }
  },

  async updateStage(id, newStage) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error('ApperClient not initialized')
      }

      const params = {
        records: [{
          Id: parseInt(id),
          stage_c: newStage,
          updatedAt_c: new Date().toISOString()
        }]
      }

      const response = await apperClient.updateRecord('deals_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update stage for ${failed.length} deals:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }

      throw new Error('No response data')
    } catch (error) {
      console.error("Error updating deal stage:", error?.response?.data?.message || error)
      throw error
    }
  }
}