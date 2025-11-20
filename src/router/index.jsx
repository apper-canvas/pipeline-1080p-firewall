import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '@/components/organisms/Layout'

// Lazy load all page components
const Pipeline = lazy(() => import("@/components/pages/Pipeline"))
const Contacts = lazy(() => import("@/components/pages/Contacts"))
const Deals = lazy(() => import("@/components/pages/Deals"))
const Dashboard = lazy(() => import("@/components/pages/Dashboard"))
const ContactDetail = lazy(() => import("@/components/pages/ContactDetail"))
const DealDetail = lazy(() => import("@/components/pages/DealDetail"))
const NotFound = lazy(() => import("@/components/pages/NotFound"))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
)

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

const mainRoutes = [
  {
    path: "",
    index: true,
    element: withSuspense(Pipeline)
  },
  {
    path: "pipeline",
    element: withSuspense(Pipeline)
  },
  {
    path: "contacts",
    element: withSuspense(Contacts)
  },
  {
    path: "contacts/:id",
    element: withSuspense(ContactDetail)
  },
  {
    path: "deals",
    element: withSuspense(Deals)
  },
  {
    path: "deals/:id",
    element: withSuspense(DealDetail)
  },
  {
    path: "dashboard",
    element: withSuspense(Dashboard)
  },
  {
    path: "*",
    element: withSuspense(NotFound)
  }
]

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: mainRoutes
  }
]

export const router = createBrowserRouter(routes)