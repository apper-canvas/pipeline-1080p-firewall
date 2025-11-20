import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import SearchBar from '@/components/molecules/SearchBar'
import Modal from '@/components/molecules/Modal'
import DealForm from '@/components/organisms/DealForm'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { dealService } from '@/services/api/dealService'
import { contactService } from '@/services/api/contactService'

const Deals = () => {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [filteredDeals, setFilteredDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDeal, setShowAddDeal] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [sortField, setSortField] = useState('updatedAt')
  const [sortDirection, setSortDirection] = useState('desc')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = deals.filter(deal => {
        const contact = contacts.find(c => c.Id === deal.contactId)
        return (
          deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.stage.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact && contact.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })
      setFilteredDeals(filtered)
    } else {
      setFilteredDeals(deals)
    }
  }, [deals, contacts, searchQuery])

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
      setError(err.message || 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

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

  const handleAddDeal = () => {
    setShowAddDeal(true)
  }

  const handleEditDeal = (deal) => {
    setEditingDeal(deal)
  }

  const handleDealSubmit = (deal) => {
    if (editingDeal) {
      setDeals(prev => 
        prev.map(d => d.Id === deal.Id ? deal : d)
      )
      setEditingDeal(null)
    } else {
      setDeals(prev => [deal, ...prev])
      setShowAddDeal(false)
    }
  }

  const handleDeleteDeal = async (dealId) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await dealService.delete(dealId)
        setDeals(prev => prev.filter(d => d.Id !== dealId))
        toast.success('Deal deleted successfully')
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

  const getContactById = (contactId) => {
    return contacts.find(contact => contact.Id === contactId)
  }

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (sortField === 'updatedAt' || sortField === 'createdAt' || sortField === 'expectedCloseDate') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  if (loading) return <Loading type="table" />
  if (error) return <ErrorView message={error} onRetry={loadData} />

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
              <p className="text-gray-600 mt-1">
                Manage and track all your sales opportunities
              </p>
            </div>
            <Button
              onClick={handleAddDeal}
              icon="Plus"
              className="shadow-lg hover:shadow-xl"
            >
              Add Deal
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search deals..."
            className="flex-1 max-w-md"
          />
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-gray-600">
              {filteredDeals.length} of {deals.length} deals
            </div>
            <div className="font-medium text-gray-900">
              Total Value: {formatCurrency(filteredDeals.reduce((sum, deal) => sum + deal.value, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {filteredDeals.length === 0 && !loading ? (
          searchQuery ? (
            <div className="text-center py-12">
              <ApperIcon name="Search" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or add a new deal.
              </p>
            </div>
          ) : (
            <Empty
              title="No deals yet"
              description="Start tracking your sales opportunities by creating your first deal"
              actionText="Add First Deal"
              onAction={handleAddDeal}
              icon="TrendingUp"
            />
          )
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Deal</span>
                        <ApperIcon name={getSortIcon('title')} className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('value')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Value</span>
                        <ApperIcon name={getSortIcon('value')} className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('expectedCloseDate')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Close Date</span>
                        <ApperIcon name={getSortIcon('expectedCloseDate')} className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedDeals.map((deal) => {
                    const contact = getContactById(deal.contactId)
                    return (
                      <tr key={deal.Id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {deal.title}
                          </div>
                          {deal.notes && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {deal.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {contact.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {contact.company}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Unknown Contact</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(deal.value)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={deal.stage.toLowerCase()}>
                            {deal.stage}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {deal.probability}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/deals/${deal.Id}`}
                              className="text-primary hover:text-secondary transition-colors"
                            >
                              <ApperIcon name="Eye" className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleEditDeal(deal)}
                              className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <ApperIcon name="Edit2" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDeal(deal.Id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <ApperIcon name="Trash2" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Deal Modal */}
      <Modal
        isOpen={showAddDeal}
        onClose={() => setShowAddDeal(false)}
        title="Create New Deal"
        size="lg"
      >
        <DealForm
          onSubmit={handleDealSubmit}
          onCancel={() => setShowAddDeal(false)}
        />
      </Modal>

      {/* Edit Deal Modal */}
      <Modal
        isOpen={!!editingDeal}
        onClose={() => setEditingDeal(null)}
        title="Edit Deal"
        size="lg"
      >
        {editingDeal && (
          <DealForm
            deal={editingDeal}
            onSubmit={handleDealSubmit}
            onCancel={() => setEditingDeal(null)}
          />
        )}
      </Modal>
    </div>
  )
}

export default Deals