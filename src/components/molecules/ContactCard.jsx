import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'

const ContactCard = ({ contact }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:scale-105 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
            <p className="text-gray-600 text-sm">{contact.company}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Mail" className="w-4 h-4" />
          <span>{contact.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Phone" className="w-4 h-4" />
          <span>{contact.phone}</span>
        </div>
      </div>
      
      {contact.notes && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {contact.notes}
        </p>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Updated {format(new Date(contact.updatedAt), 'MMM d, yyyy')}
        </span>
        <Link
          to={`/contacts/${contact.Id}`}
          className="text-primary hover:text-secondary text-sm font-medium transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default ContactCard