import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import FormField from '@/components/molecules/FormField'
import { dealService } from '@/services/api/dealService'
import { contactService } from '@/services/api/contactService'

const DEAL_STAGES = [
  'Lead',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
]

const DealForm = ({ deal = null, contactId = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    contactId: deal?.contactId || contactId || '',
    value: deal?.value || '',
    stage: deal?.stage || 'Lead',
    probability: deal?.probability || 30,
    expectedCloseDate: deal?.expectedCloseDate || '',
    notes: deal?.notes || ''
  })
  const [contacts, setContacts] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(true)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const contactList = await contactService.getAll()
      setContacts(contactList)
    } catch (error) {
      toast.error('Failed to load contacts')
    } finally {
      setLoadingContacts(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required'
    }
    
    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required'
    }
    
    if (!formData.value || isNaN(formData.value) || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Valid deal value is required'
    }
    
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required'
    }
    
    if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        contactId: parseInt(formData.contactId)
      }
      
      let result
      if (deal) {
        result = await dealService.update(deal.Id, dealData)
        toast.success('Deal updated successfully!')
      } else {
        result = await dealService.create(dealData)
        toast.success('Deal created successfully!')
      }
      
      onSubmit(result)
    } catch (error) {
      toast.error(error.message || 'Failed to save deal')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-adjust probability based on stage
    if (field === 'stage') {
      const stageProb = {
        'Lead': 30,
        'Qualified': 60,
        'Proposal': 75,
        'Negotiation': 85,
        'Won': 100,
        'Lost': 0
      }
      setFormData(prev => ({
        ...prev,
        [field]: value,
        probability: stageProb[value] || prev.probability
      }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Deal Title"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        required
        placeholder="Enter deal title"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Contact"
          type="select"
          value={formData.contactId}
          onChange={(e) => handleChange('contactId', e.target.value)}
          error={errors.contactId}
          required
          disabled={loadingContacts}
        >
          <option value="">
            {loadingContacts ? 'Loading contacts...' : 'Select a contact'}
          </option>
          {contacts.map(contact => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name} - {contact.company}
            </option>
          ))}
        </FormField>
        
        <FormField
          label="Deal Value"
          type="number"
          value={formData.value}
          onChange={(e) => handleChange('value', e.target.value)}
          error={errors.value}
          required
          placeholder="0"
          step="0.01"
          min="0"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="Stage"
          type="select"
          value={formData.stage}
          onChange={(e) => handleChange('stage', e.target.value)}
          error={errors.stage}
          required
        >
          {DEAL_STAGES.map(stage => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </FormField>
        
        <FormField
          label="Probability (%)"
          type="number"
          value={formData.probability}
          onChange={(e) => handleChange('probability', e.target.value)}
          error={errors.probability}
          required
          min="0"
          max="100"
        />
        
        <FormField
          label="Expected Close Date"
          type="date"
          value={formData.expectedCloseDate}
          onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
          error={errors.expectedCloseDate}
          required
        />
      </div>
      
      <FormField
        label="Notes"
        type="textarea"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        error={errors.notes}
        placeholder="Add deal notes or comments..."
        rows={3}
      />
      
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {deal ? 'Update Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  )
}

export default DealForm