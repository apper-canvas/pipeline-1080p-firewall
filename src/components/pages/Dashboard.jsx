import { useState, useEffect } from 'react'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import { dealService } from '@/services/api/dealService'
import { contactService } from '@/services/api/contactService'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

const Dashboard = () => {
  const [data, setData] = useState({
    deals: [],
    contacts: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    totalDeals: 0,
    totalValue: 0,
    wonDeals: 0,
    wonValue: 0,
    conversionRate: 0,
    avgDealSize: 0,
    totalContacts: 0,
    recentContacts: 0,
    pipelineByStage: {},
    recentActivity: []
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (data.deals.length > 0 || data.contacts.length > 0) {
      calculateMetrics()
    }
  }, [data])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ])
      
      setData({
        deals: dealsData,
        contacts: contactsData
      })
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = () => {
    const { deals, contacts } = data
    
    const totalDeals = deals.length
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
    const wonDeals = deals.filter(deal => deal.stage === 'Won')
    const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0)
    const conversionRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0
    
    const monthStart = startOfMonth(new Date())
    const monthEnd = endOfMonth(new Date())
    const recentContacts = contacts.filter(contact => {
      const createdDate = new Date(contact.createdAt)
      return createdDate >= monthStart && createdDate <= monthEnd
    }).length
    
    // Pipeline by stage
    const pipelineByStage = deals.reduce((acc, deal) => {
      if (!acc[deal.stage]) {
        acc[deal.stage] = { count: 0, value: 0 }
      }
      acc[deal.stage].count++
      acc[deal.stage].value += deal.value
      return acc
    }, {})

    setMetrics({
      totalDeals,
      totalValue,
      wonDeals: wonDeals.length,
      wonValue,
      conversionRate,
      avgDealSize,
      totalContacts: contacts.length,
      recentContacts,
      pipelineByStage
    })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${Math.round(value)}%`
  }

  if (loading) return <Loading type="metrics" />
  if (error) return <ErrorView message={error} onRetry={loadDashboardData} />

  const metricCards = [
    {
      title: 'Total Pipeline Value',
      value: formatCurrency(metrics.totalValue),
      change: '+12.5%',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Won Deals',
      value: formatCurrency(metrics.wonValue),
      change: `${metrics.wonDeals} deals`,
      changeType: 'neutral',
      icon: 'TrendingUp',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(metrics.conversionRate),
      change: '+2.1%',
      changeType: 'positive',
      icon: 'Target',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Average Deal Size',
      value: formatCurrency(metrics.avgDealSize),
      change: '+8.3%',
      changeType: 'positive',
      icon: 'BarChart3',
      color: 'from-amber-500 to-amber-600'
    }
  ]

  const contactCards = [
    {
      title: 'Total Contacts',
      value: metrics.totalContacts,
      change: `+${metrics.recentContacts} this month`,
      changeType: 'positive',
      icon: 'Users',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Active Deals',
      value: metrics.totalDeals - (metrics.pipelineByStage.Won?.count || 0) - (metrics.pipelineByStage.Lost?.count || 0),
      change: 'In progress',
      changeType: 'neutral',
      icon: 'Activity',
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Overview of your sales performance and pipeline
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Sales Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((metric, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </h3>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                    <ApperIcon name={metric.icon} className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </div>
                  <div className={`text-sm flex items-center ${
                    metric.changeType === 'positive' 
                      ? 'text-green-600' 
                      : metric.changeType === 'negative' 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                  }`}>
                    {metric.changeType === 'positive' && (
                      <ApperIcon name="ArrowUp" className="w-4 h-4 mr-1" />
                    )}
                    {metric.changeType === 'negative' && (
                      <ApperIcon name="ArrowDown" className="w-4 h-4 mr-1" />
                    )}
                    {metric.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactCards.map((metric, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </h3>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                    <ApperIcon name={metric.icon} className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </div>
                  <div className={`text-sm flex items-center ${
                    metric.changeType === 'positive' 
                      ? 'text-green-600' 
                      : metric.changeType === 'negative' 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                  }`}>
                    {metric.changeType === 'positive' && (
                      <ApperIcon name="ArrowUp" className="w-4 h-4 mr-1" />
                    )}
                    {metric.changeType === 'negative' && (
                      <ApperIcon name="ArrowDown" className="w-4 h-4 mr-1" />
                    )}
                    {metric.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Breakdown */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline by Stage</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(metrics.pipelineByStage).map(([stage, data]) => (
                  <div key={stage} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        stage === 'Lead' ? 'bg-gray-400' :
                        stage === 'Qualified' ? 'bg-blue-400' :
                        stage === 'Proposal' ? 'bg-purple-400' :
                        stage === 'Negotiation' ? 'bg-amber-400' :
                        stage === 'Won' ? 'bg-green-400' :
                        'bg-red-400'
                      }`}></div>
                      <span className="font-medium text-gray-900">{stage}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(data.value)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {data.count} deal{data.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard