import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import DealCard from '@/components/molecules/DealCard'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import Empty from '@/components/ui/Empty'
import { dealService } from '@/services/api/dealService'
import { contactService } from '@/services/api/contactService'

const DEAL_STAGES = [
  { id: 'Lead', name: 'Lead', color: 'bg-gray-100 border-gray-300' },
  { id: 'Qualified', name: 'Qualified', color: 'bg-blue-100 border-blue-300' },
  { id: 'Proposal', name: 'Proposal', color: 'bg-purple-100 border-purple-300' },
  { id: 'Negotiation', name: 'Negotiation', color: 'bg-amber-100 border-amber-300' },
  { id: 'Won', name: 'Won', color: 'bg-green-100 border-green-300' },
  { id: 'Lost', name: 'Lost', color: 'bg-red-100 border-red-300' }
]

const PipelineBoard = ({ onAddDeal }) => {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [draggedDeal, setDraggedDeal] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ])
      setDeals(dealsData)
      setContacts(contactsData)
    } catch (err) {
      setError(err.message || 'Failed to load pipeline data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getStageDeals = (stageId) => {
    return deals.filter(deal => deal.stage === stageId)
  }

  const getStageValue = (stageId) => {
    return getStageDeals(stageId).reduce((sum, deal) => sum + deal.value, 0)
  }

  const getContactById = (contactId) => {
    return contacts.find(contact => contact.Id === contactId)
  }

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, newStage) => {
    e.preventDefault()
    
    if (!draggedDeal || draggedDeal.stage === newStage) {
      setDraggedDeal(null)
      return
    }

    try {
      const updatedDeal = await dealService.updateStage(draggedDeal.Id, newStage)
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.Id === draggedDeal.Id ? updatedDeal : deal
        )
      )
      toast.success(`Deal moved to ${newStage}`)
    } catch (err) {
      toast.error('Failed to update deal stage')
    } finally {
      setDraggedDeal(null)
    }
  }

  if (loading) return <Loading type="pipeline" />
  if (error) return <ErrorView message={error} onRetry={loadData} />
  if (deals.length === 0) {
    return (
      <Empty
        title="No deals in pipeline"
        description="Start building your sales pipeline by adding your first deal"
        actionText="Add First Deal"
        onAction={onAddDeal}
        icon="TrendingUp"
      />
    )
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex space-x-6 min-w-max p-6">
        {DEAL_STAGES.map(stage => {
          const stageDeals = getStageDeals(stage.id)
          const stageValue = getStageValue(stage.id)
          
          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4 ${stage.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {stage.name}
                  </h3>
                  <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {formatCurrency(stageValue)}
                </div>
              </div>

              {/* Deals */}
              <div className="space-y-3 min-h-[200px]">
                {stageDeals.map(deal => {
                  const contact = getContactById(deal.contactId)
                  return (
                    <div
                      key={deal.Id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      className={draggedDeal?.Id === deal.Id ? 'opacity-50' : ''}
                    >
                      <DealCard
                        deal={deal}
                        contact={contact}
                        isDragging={draggedDeal?.Id === deal.Id}
                      />
                    </div>
                  )
                })}
                
                {stageDeals.length === 0 && (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 text-sm">
                      Drop deals here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PipelineBoard