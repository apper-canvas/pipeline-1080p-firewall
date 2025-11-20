import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import ApperIcon from '@/components/ApperIcon'
import { cn } from '@/utils/cn'

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Pipeline', href: '/pipeline', icon: 'BarChart3' },
    { name: 'Contacts', href: '/contacts', icon: 'Users' },
    { name: 'Deals', href: '/deals', icon: 'TrendingUp' },
    { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  ]

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Navigation */}
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <ApperIcon name="Target" className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Pipeline Pro</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href === '/pipeline' && location.pathname === '/')
                  
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "text-primary bg-primary/5 border-b-2 border-primary"
                          : "text-gray-600 hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      <ApperIcon name={item.icon} className="w-4 h-4 mr-2" />
                      {item.name}
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <ApperIcon name={mobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href === '/pipeline' && location.pathname === '/')
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center px-3 py-2 text-base font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "text-primary bg-primary/5 border-l-4 border-primary"
                        : "text-gray-600 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
                    {item.name}
                  </NavLink>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout