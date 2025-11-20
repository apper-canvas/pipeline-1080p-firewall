import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import SearchBar from '@/components/molecules/SearchBar'
import Modal from '@/components/molecules/Modal'
import ContactCard from '@/components/molecules/ContactCard'
import ContactsTable from '@/components/organisms/ContactsTable'
import ContactForm from '@/components/organisms/ContactForm'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { contactService } from '@/services/api/contactService'

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [viewMode, setViewMode] = useState('table')

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredContacts(filtered)
    } else {
      setFilteredContacts(contacts)
    }
  }, [contacts, searchQuery])

  const loadContacts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const contactsData = await contactService.getAll()
      setContacts(contactsData)
    } catch (err) {
      setError(err.message || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleAddContact = () => {
    setShowAddContact(true)
  }

  const handleEditContact = (contact) => {
    setEditingContact(contact)
  }

  const handleContactSubmit = (contact) => {
    if (editingContact) {
      setContacts(prev => 
        prev.map(c => c.Id === contact.Id ? contact : c)
      )
      setEditingContact(null)
    } else {
      setContacts(prev => [contact, ...prev])
      setShowAddContact(false)
    }
  }

  const handleDeleteContact = async (contactId) => {
    try {
      await contactService.delete(contactId)
      setContacts(prev => prev.filter(c => c.Id !== contactId))
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  if (loading) return <Loading type="cards" />
  if (error) return <ErrorView message={error} onRetry={loadContacts} />

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
              <p className="text-gray-600 mt-1">
                Manage your customer and prospect contacts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ApperIcon name="Table" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ApperIcon name="LayoutGrid" className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={handleAddContact}
                icon="Plus"
                className="shadow-lg hover:shadow-xl"
              >
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search contacts..."
            className="flex-1 max-w-md"
          />
          <div className="text-sm text-gray-600">
            {filteredContacts.length} of {contacts.length} contacts
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {filteredContacts.length === 0 && !loading ? (
          searchQuery ? (
            <div className="text-center py-12">
              <ApperIcon name="Search" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or add a new contact.
              </p>
            </div>
          ) : (
            <Empty
              title="No contacts yet"
              description="Start building your contact list by adding your first contact"
              actionText="Add First Contact"
              onAction={handleAddContact}
              icon="Users"
            />
          )
        ) : (
          <>
            {viewMode === 'table' ? (
              <ContactsTable
                contacts={filteredContacts}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContacts.map(contact => (
                  <ContactCard key={contact.Id} contact={contact} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        title="Add New Contact"
        size="lg"
      >
        <ContactForm
          onSubmit={handleContactSubmit}
          onCancel={() => setShowAddContact(false)}
        />
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={!!editingContact}
        onClose={() => setEditingContact(null)}
        title="Edit Contact"
        size="lg"
      >
        {editingContact && (
          <ContactForm
            contact={editingContact}
            onSubmit={handleContactSubmit}
            onCancel={() => setEditingContact(null)}
          />
        )}
      </Modal>
    </div>
  )
}

export default Contacts