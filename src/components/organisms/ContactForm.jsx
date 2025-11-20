import { useState } from 'react'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import FormField from '@/components/molecules/FormField'
import { contactService } from '@/services/api/contactService'

const ContactForm = ({ contact = null, onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
    name: contact?.Name || '',
    email: contact?.email_c || '',
    phone: contact?.phone_c || '',
    company: contact?.company_c || '',
    notes: contact?.notes_c || ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required'
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
      let result
      if (contact) {
        result = await contactService.update(contact.Id, formData)
        toast.success('Contact updated successfully!')
      } else {
        result = await contactService.create(formData)
        toast.success('Contact created successfully!')
      }
      
      onSubmit(result)
    } catch (error) {
      toast.error(error.message || 'Failed to save contact')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
          placeholder="Enter full name"
        />
        
        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
          placeholder="Enter email address"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="Enter phone number"
        />
        
        <FormField
          label="Company"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          error={errors.company}
          required
          placeholder="Enter company name"
        />
      </div>
      
      <FormField
        label="Notes"
        type="textarea"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        error={errors.notes}
        placeholder="Add any additional notes..."
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
          {contact ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  )
}

export default ContactForm