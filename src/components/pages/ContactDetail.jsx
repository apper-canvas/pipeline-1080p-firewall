import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Modal from '@/components/molecules/Modal'
import ContactForm from '@/components/organisms/ContactForm'
import DealForm from '@/components/organisms/DealForm'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { contactService } from '@/services/api/contactService'
import { dealService } from '@/services/api/dealService'
import { activityService } from '@/services/api/activityService'

const ContactDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [deals, setDeals] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditContact, setShowEditContact] = useState(false)
  const [showAddDeal, setShowAddDeal] = useState(false)

  useEffect(() => {
    loadContactData()
  }, [id])

  const loadContactData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [contactData, dealsData, activitiesData] = await Promise.all([
        contactService.getById(id),
        dealService.getByContactId(id),
        activityService.getByContactId(id)
      ])
      
      if (!contactData) {
        setError('Contact not found')
        return
      }
      
      setContact(contactData)
      setDeals(dealsData)
      setActivities(activitiesData)
    } catch (err) {
      setError(err.message || 'Failed to load contact details')
    } finally {
      setLoading(false)
    }
  }

  const handleEditContact = () => {
    setShowEditContact(true)
  }

  const handleContactSubmit = (updatedContact) => {
    setContact(updatedContact)
    setShowEditContact(false)
    toast.success('Contact updated successfully')
  }

  const handleAddDeal = () => {
    setShowAddDeal(true)
  }

  const handleDealSubmit = (newDeal) => {
    setDeals(prev => [newDeal, ...prev])
    setShowAddDeal(false)
    toast.success('Deal created successfully')
  }

  const handleDeleteContact = async () => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}? This will also remove all associated deals and activities.`)) {
      try {
        await contactService.delete(contact.Id)
        toast.success('Contact deleted successfully')
        navigate('/contacts')
      } catch (error) {
        toast.error('Failed to delete contact')
      }
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getTotalDealValue = () => {
    return deals.reduce((sum, deal) => sum + deal.value, 0)
  }

  const getWonDeals = () => {
    return deals.filter(deal => deal.stage === 'Won')
  }

  if (loading) return <Loading />
  if (error) return <ErrorView message={error} onRetry={loadContactData} />
  if (!contact) return <ErrorView message="Contact not found" />

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'User' },
    { id: 'deals', name: `Deals (${deals.length})`, icon: 'TrendingUp' },
    { id: 'activity', name: `Activity (${activities.length})`, icon: 'Activity' }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                icon="ArrowLeft"
                className="!p-2"
              />
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
                  <p className="text-gray-600">{contact.company}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleAddDeal}
                icon="Plus"
                variant="secondary"
              >
                Add Deal
              </Button>
              <Button
                onClick={handleEditContact}
                icon="Edit2"
                variant="secondary"
              >
                Edit
              </Button>
              <Button
                onClick={handleDeleteContact}
                icon="Trash2"
                variant="danger"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ApperIcon name={tab.icon} className="w-4 h-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Mail" className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium text-gray-900">{contact.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Phone" className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium text-gray-900">{contact.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Building" className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Company</div>
                      <div className="font-medium text-gray-900">{contact.company}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ApperIcon name="Calendar" className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Created</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {contact.notes && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <p className="text-gray-700 leading-relaxed">{contact.notes}</p>
                </div>
              )}
            </div>

            {/* Stats & Quick Info */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600">Total Deals</div>
                    <ApperIcon name="TrendingUp" className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{deals.length}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatCurrency(getTotalDealValue())} total value
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600">Won Deals</div>
                    <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{getWonDeals().length}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatCurrency(getWonDeals().reduce((sum, deal) => sum + deal.value, 0))} won
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600">Activities</div>
                    <ApperIcon name="Activity" className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Total interactions
                  </div>
                </div>
              </div>

              {/* Recent Deals */}
              {deals.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Deals</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {deals.slice(0, 3).map(deal => (
                        <div key={deal.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{deal.title}</div>
                            <div className="text-sm text-gray-600">
                              Close date: {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(deal.value)}
                            </div>
                            <Badge variant={deal.stage.toLowerCase()}>
                              {deal.stage}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div>
            {deals.length === 0 ? (
              <Empty
                title="No deals yet"
                description={`Start tracking deals for ${contact.name} by creating your first deal`}
                actionText="Add First Deal"
                onAction={handleAddDeal}
                icon="TrendingUp"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map(deal => (
                  <div key={deal.Id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 flex-1">{deal.title}</h4>
                      <Badge variant={deal.stage.toLowerCase()}>
                        {deal.stage}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(deal.value)}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Probability</span>
                        <span className="font-medium text-gray-900">{deal.probability}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Close Date</span>
                        <span className="font-medium text-gray-900">
                          {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    
                    {deal.notes && (
                      <p className="text-gray-600 text-sm mt-4 line-clamp-2">
                        {deal.notes}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        to={`/deals/${deal.Id}`}
                        className="text-primary hover:text-secondary text-sm font-medium transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            {activities.length === 0 ? (
              <Empty
                title="No activity yet"
                description={`Activity history for ${contact.name} will appear here`}
                icon="Activity"
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {activities.map(activity => (
                      <div key={activity.Id} className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'Email' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'Call' ? 'bg-green-100 text-green-600' :
                          activity.type === 'Meeting' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <ApperIcon 
                            name={
                              activity.type === 'Email' ? 'Mail' :
                              activity.type === 'Call' ? 'Phone' :
                              activity.type === 'Meeting' ? 'Users' :
                              'FileText'
                            } 
                            className="w-4 h-4" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={showEditContact}
        onClose={() => setShowEditContact(false)}
        title="Edit Contact"
        size="lg"
      >
        <ContactForm
          contact={contact}
          onSubmit={handleContactSubmit}
          onCancel={() => setShowEditContact(false)}
        />
      </Modal>

      {/* Add Deal Modal */}
      <Modal
        isOpen={showAddDeal}
        onClose={() => setShowAddDeal(false)}
        title="Create New Deal"
        size="lg"
      >
        <DealForm
          contactId={contact?.Id}
          onSubmit={handleDealSubmit}
          onCancel={() => setShowAddDeal(false)}
        />
      </Modal>
    </div>
  )
}

export default ContactDetail