import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Select from '@/components/atoms/Select'
import Modal from '@/components/molecules/Modal'
import DealForm from '@/components/organisms/DealForm'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import ApperIcon from '@/components/ApperIcon'
import { dealService } from '@/services/api/dealService'
import { contactService } from '@/services/api/contactService'

const DEAL_STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']

const DealDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deal, setDeal] = useState(null)
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditDeal, setShowEditDeal] = useState(false)
  const [updatingStage, setUpdatingStage] = useState(false)

  useEffect(() => {
    loadDealData()
  }, [id])

  const loadDealData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const dealData = await dealService.getById(id)
      
      if (!dealData) {
        setError('Deal not found')
        return
      }
      
      const contactData = await contactService.getById(dealData.contactId)
      
      setDeal(dealData)
      setContact(contactData)
    } catch (err) {
      setError(err.message || 'Failed to load deal details')
    } finally {
      setLoading(false)
    }
  }

  const handleEditDeal = () => {
    setShowEditDeal(true)
  }

  const handleDealSubmit = (updatedDeal) => {
    setDeal(updatedDeal)
    setShowEditDeal(false)
    toast.success('Deal updated successfully')
  }

  const handleStageChange = async (newStage) => {
    if (newStage === deal.stage) return
    
    setUpdatingStage(true)
    try {
      const updatedDeal = await dealService.updateStage(deal.Id, newStage)
      setDeal(updatedDeal)
      toast.success(`Deal moved to ${newStage}`)
    } catch (error) {
      toast.error('Failed to update deal stage')
    } finally {
      setUpdatingStage(false)
    }
  }

  const handleDeleteDeal = async () => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      try {
        await dealService.delete(deal.Id)
        toast.success('Deal deleted successfully')
        navigate('/deals')
      } catch (error) {
        toast.error('Failed to delete deal')
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

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-green-600 bg-green-50'
    if (probability >= 60) return 'text-blue-600 bg-blue-50'
    if (probability >= 40) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  const getStageProgress = (stage) => {
    const stageIndex = DEAL_STAGES.indexOf(stage)
    return ((stageIndex + 1) / DEAL_STAGES.length) * 100
  }

  if (loading) return <Loading />
  if (error) return <ErrorView message={error} onRetry={loadDealData} />
  if (!deal) return <ErrorView message="Deal not found" />

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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant={deal.stage.toLowerCase()}>
                    {deal.stage}
                  </Badge>
                  <span className={`text-sm px-3 py-1 rounded-full ${getProbabilityColor(deal.probability)}`}>
                    {deal.probability}% probability
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleEditDeal}
                icon="Edit2"
                variant="secondary"
              >
                Edit
              </Button>
              <Button
                onClick={handleDeleteDeal}
                icon="Trash2"
                variant="danger"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Deal Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Deal Value & Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Value</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(deal.value)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ApperIcon name="Calendar" className="w-4 h-4" />
                    <span>Expected close: {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Current Stage</span>
                      <span className="text-sm font-medium text-primary">{deal.stage}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getStageProgress(deal.stage)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Start</span>
                      <span>Close</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Management */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Stage</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Select 
                    value={deal.stage}
                    onChange={(e) => handleStageChange(e.target.value)}
                    disabled={updatingStage}
                  >
                    {DEAL_STAGES.map(stage => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </Select>
                </div>
                {updatingStage && (
                  <ApperIcon name="Loader2" className="w-5 h-5 animate-spin text-primary" />
                )}
              </div>
            </div>

            {/* Notes */}
            {deal.notes && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 leading-relaxed">{deal.notes}</p>
              </div>
            )}

            {/* Deal Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <ApperIcon name="Plus" className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Deal Created</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(deal.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ApperIcon name="Edit" className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(deal.updatedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            {contact && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.company}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Mail" className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Phone" className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.phone}</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/contacts/${contact.Id}`}
                    className="block w-full text-center py-2 text-sm font-medium text-primary hover:text-secondary transition-colors border border-primary hover:border-secondary rounded-lg"
                  >
                    View Contact Details
                  </Link>
                </div>
              </div>
            )}

            {/* Deal Statistics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Stage</span>
                  <Badge variant={deal.stage.toLowerCase()}>{deal.stage}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Win Probability</span>
                  <span className="text-sm font-medium text-gray-900">{deal.probability}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expected Value</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(deal.value * (deal.probability / 100))}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days to Close</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.max(0, Math.ceil((new Date(deal.expectedCloseDate) - new Date()) / (1000 * 60 * 60 * 24)))} days
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="sm"
                  icon="Mail"
                  className="w-full justify-start"
                  onClick={() => window.location.href = `mailto:${contact?.email}`}
                >
                  Send Email
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="Phone"
                  className="w-full justify-start"
                  onClick={() => window.location.href = `tel:${contact?.phone}`}
                >
                  Call Contact
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="Calendar"
                  className="w-full justify-start"
                >
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Deal Modal */}
      <Modal
        isOpen={showEditDeal}
        onClose={() => setShowEditDeal(false)}
        title="Edit Deal"
        size="lg"
      >
        <DealForm
          deal={deal}
          onSubmit={handleDealSubmit}
          onCancel={() => setShowEditDeal(false)}
        />
      </Modal>
    </div>
  )
}

export default DealDetail