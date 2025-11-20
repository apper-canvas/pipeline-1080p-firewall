import { useState } from 'react'
import Button from '@/components/atoms/Button'
import Modal from '@/components/molecules/Modal'
import PipelineBoard from '@/components/organisms/PipelineBoard'
import DealForm from '@/components/organisms/DealForm'
import ApperIcon from '@/components/ApperIcon'

const Pipeline = () => {
  const [showAddDeal, setShowAddDeal] = useState(false)

  const handleAddDeal = () => {
    setShowAddDeal(true)
  }

  const handleDealSubmit = (deal) => {
    setShowAddDeal(false)
    // Pipeline board will update automatically through its data loading
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
              <p className="text-gray-600 mt-1">
                Track and manage your deals through the sales process
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

      {/* Pipeline Board */}
      <div className="flex-1">
        <PipelineBoard onAddDeal={handleAddDeal} />
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
    </div>
  )
}

export default Pipeline