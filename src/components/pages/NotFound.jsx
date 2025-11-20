import { Link } from 'react-router-dom'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <ApperIcon name="AlertTriangle" className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/pipeline">
            <Button className="w-full">
              <ApperIcon name="Home" className="w-4 h-4 mr-2" />
              Go to Pipeline
            </Button>
          </Link>
          
          <div className="text-sm text-gray-500">
            Or try one of these:
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/contacts" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                Contacts
              </Button>
            </Link>
            <Link to="/deals" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                Deals
              </Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound