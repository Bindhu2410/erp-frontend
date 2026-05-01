import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import GenericInventoryTable, { type RowAction } from '../../../components/table/GenericInventoryTable'

interface QuotationTitle {
  id: number
  userCreated: number | string | null
  dateCreated: string | null
  userUpdated: number | string | null
  dateUpdated: string | null
  title: string
}

interface FormattedQuotationTitle {
  id: number
  title: string
  dateCreated: string
  userCreated: string
  dateUpdated: string
  userUpdated: string
}

const QuotationTitle = () => {
  const [quotationTitles, setQuotationTitles] = useState<FormattedQuotationTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [formData, setFormData] = useState({ id: 0, title: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'dateCreated', label: 'Date Created', sortable: true },
    { key: 'userCreated', label: 'Created By', sortable: true },
    { key: 'dateUpdated', label: 'Date Updated', sortable: true },
    { key: 'userUpdated', label: 'Updated By', sortable: true }
  ]

  useEffect(() => {
    fetchQuotationTitles()
  }, [])

  const fetchQuotationTitles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}QuotationTitle`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: QuotationTitle[] = await response.json()
      
      const formattedData: FormattedQuotationTitle[] = data.map(item => ({
        id: item.id,
        title: item.title,
        dateCreated: item.dateCreated ? new Date(item.dateCreated).toLocaleDateString() : '-',
        dateUpdated: item.dateUpdated ? new Date(item.dateUpdated).toLocaleDateString() : '-',
        userCreated: item.userCreated?.toString() || '-',
        userUpdated: item.userUpdated?.toString() || '-'
      }))
      
      setQuotationTitles(formattedData)
      setError(null)
    } catch (err) {
      console.error('Error fetching quotation titles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch quotation titles')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setFormData({ id: 0, title: '' })
    setFormError(null)
    setModalMode('create')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({ id: 0, title: '' })
    setFormError(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setFormError('Title is required')
      return
    }

    try {
      setFormLoading(true)
      setFormError(null)

      if (modalMode === 'create') {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}QuotationTitle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Title: formData.title.trim()
          })
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorData}`)
        }

        toast.success('✅ Quotation Title created successfully!')
        await fetchQuotationTitles()
        closeModal()
      } else if (modalMode === 'edit') {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}QuotationTitle/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Id: formData.id,
            Title: formData.title.trim()
          })
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorData}`)
        }

        toast.success('✅ Quotation Title updated successfully!')
        await fetchQuotationTitles()
        closeModal()
      }
    } catch (err) {
      console.error('Error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Operation failed'
      setFormError(errorMsg)
      toast.error(`❌ Error: ${errorMsg}`)
    } finally {
      setFormLoading(false)
    }
  }

  const rowActions: RowAction[] = [
    {
      label: 'View',
      icon: 'view',
      color: 'text-blue-600 hover:text-blue-900',
      onClick: (row) => {
        setFormData({ id: row.id, title: row.title })
        setModalMode('view')
        setShowModal(true)
      }
    },
    {
      label: 'Edit',
      icon: 'edit',
      color: 'text-amber-600 hover:text-amber-900',
      onClick: (row) => {
        setFormData({ id: row.id, title: row.title })
        setFormError(null)
        setModalMode('edit')
        setShowModal(true)
      }
    },
    {
      label: 'Delete',
      icon: 'delete',
      color: 'text-red-600 hover:text-red-900',
      onClick: async (row) => {
        const result = await Swal.fire({
          title: 'Delete Quotation Title',
          html: `Are you sure you want to delete <strong>"${row.title}"</strong>? This action cannot be undone.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Yes, Delete!',
          cancelButtonText: 'Cancel'
        })

        if (result.isConfirmed) {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}QuotationTitle/${row.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            })

            if (!response.ok) {
              const errorData = await response.text()
              throw new Error(`HTTP error! status: ${response.status} - ${errorData}`)
            }

            await fetchQuotationTitles()
            toast.success('✅ Quotation Title deleted successfully!')
          } catch (err) {
            console.error('Error:', err)
            const errorMsg = err instanceof Error ? err.message : 'Delete failed'
            toast.error(`❌ Error: ${errorMsg}`)
          }
        }
      }
    }
  ]

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div></div>
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>

  return (
    <div className="p-6">
      <GenericInventoryTable
        title="Quotation Title Master"
        data={quotationTitles}
        columns={columns}
        actions={rowActions}
        onAddNew={handleAddNew}
        onImport={() => console.log('Import CSV clicked')}
        onExport={() => console.log('Download Template clicked')}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === 'create' ? 'Add New' : modalMode === 'edit' ? 'Edit' : 'View'} Quotation Title
            </h2>
            
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  disabled={modalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quotation title"
                />
              </div>

              {formError && <div className="text-red-500 text-sm mb-4">{formError}</div>}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formLoading ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Update'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  )
}

export default QuotationTitle