import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import { toast } from 'react-toastify'

const ContactsTable = ({ contacts, onEdit, onDelete }) => {
  const [sortField, setSortField] = useState('updatedAt')
  const [sortDirection, setSortDirection] = useState('desc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown'
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'
  }

  const sortedContacts = [...contacts].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (sortField === 'updatedAt' || sortField === 'createdAt') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleDelete = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      try {
        await onDelete(contact.Id)
        toast.success('Contact deleted successfully')
      } catch (error) {
        toast.error('Failed to delete contact')
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Contact</span>
                  <ApperIcon name={getSortIcon('name')} className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('company')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Company</span>
                  <ApperIcon name={getSortIcon('company')} className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('updatedAt')}
                  className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                >
                  <span>Last Updated</span>
                  <ApperIcon name={getSortIcon('updatedAt')} className="w-4 h-4" />
                </button>
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedContacts.map((contact) => (
              <tr key={contact.Id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-medium text-sm">
{contact.Name ? contact.Name.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2) : '??'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-gray-900">{contact.company_c || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-gray-900">{contact.email_c || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-gray-900">{contact.phone_c || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
{contact.updatedAt_c ? format(new Date(contact.updatedAt_c), 'MMM d, yyyy') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/contacts/${contact.Id}`}
                      className="text-primary hover:text-secondary transition-colors"
                    >
                      <ApperIcon name="Eye" className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onEdit(contact)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ApperIcon name="Edit2" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ContactsTable