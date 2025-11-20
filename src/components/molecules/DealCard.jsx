import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'

const DealCard = ({ deal, contact, onStageChange, isDragging = false }) => {
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

  return (
    <div 
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-move ${
        isDragging ? 'rotate-3 scale-105 opacity-75' : ''
      }`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', deal.Id.toString())
      }}
    >
      <div className="flex items-start justify-between mb-3">
<h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 mr-2">
          {deal.title_c || deal.title || deal.Name}
        </h4>
        <ApperIcon name="GripVertical" className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
      
      <div className="space-y-2 mb-3">
<div className="text-lg font-bold text-gray-900">
          {formatCurrency(deal.value_c || deal.value)}
        </div>
        
        <div className="flex items-center justify-between">
<Badge variant={(deal.stage_c || deal.stage)?.toLowerCase()}>
            {deal.stage_c || deal.stage}
          </Badge>
<span className={`text-xs px-2 py-1 rounded-full ${getProbabilityColor(deal.probability_c || deal.probability)}`}>
            {deal.probability_c || deal.probability}%
          </span>
        </div>
      </div>
      
      <div className="space-y-1 mb-3 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
<ApperIcon name="User" className="w-3 h-3" />
          <span>{contact?.Name || contact?.name || 'Unknown Contact'}</span>
        </div>
        <div className="flex items-center space-x-1">
<ApperIcon name="Calendar" className="w-3 h-3" />
          <span>Close: {format(new Date(deal.expectedCloseDate_c || deal.expectedCloseDate), 'MMM d')}</span>
        </div>
      </div>
      
{(deal.notes_c || deal.notes) && (
        <p className="text-xs text-gray-500 line-clamp-2">
          {deal.notes_c || deal.notes}
        </p>
      )}
    </div>
  )
}

export default DealCard