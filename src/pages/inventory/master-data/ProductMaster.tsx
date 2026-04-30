import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import GenericInventoryTable, { type RowAction } from '../../../components/table/GenericInventoryTable'

interface Product {
  id: number
  userCreated: number | string | null
  dateCreated: string
  userUpdated: number | string | null
  dateUpdated: string | null
  name: string
  isActive: boolean | null
}

interface FormattedProduct {
  id: number
  name: string
  dateCreated: string
  userCreated: string
  dateUpdated: string
  userUpdated: string
  isActive: string
}

const ProductMaster = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState<FormattedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [formData, setFormData] = useState({ id: 0, name: '', isActive: true })
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Define columns for the product table
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Product Name', sortable: true }
  ]

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/Product')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: Product[] = await response.json()
        
        // Format the data for display
        const formattedData: FormattedProduct[] = data.map(product => ({
          id: product.id,
          name: product.name,
          dateCreated: new Date(product.dateCreated).toLocaleDateString(),
          dateUpdated: product.dateUpdated ? new Date(product.dateUpdated).toLocaleDateString() : '-',
          userCreated: product.userCreated?.toString() || '-',
          userUpdated: product.userUpdated?.toString() || '-',
          isActive: product.isActive === null ? 'Not Set' : product.isActive ? 'Active' : 'Inactive'
        }))
        
        setProducts(formattedData)
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleImport = () => {
    console.log('Import CSV clicked')
    // Implement import functionality
  }

  const handleExport = () => {
    console.log('Download Template clicked')
    // Implement export functionality
  }

  const handleAddNew = () => {
    setFormData({ id: 0, name: '', isActive: true })
    setFormError(null)
    setModalMode('create')
    setShowModal(true)
  }

  const closeModal = () => {
    navigate(location.pathname)
    setShowModal(false)
    setFormData({ id: 0, name: '', isActive: true })
    setFormError(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const fetchProducts = async () => {
    try {
      const apiResponse = await fetch('${process.env.REACT_APP_API_BASE_URL}/Product')
      if (apiResponse.ok) {
        const data: Product[] = await apiResponse.json()
        const formattedData: FormattedProduct[] = data.map(product => ({
          id: product.id,
          name: product.name,
          dateCreated: new Date(product.dateCreated).toLocaleDateString(),
          dateUpdated: product.dateUpdated ? new Date(product.dateUpdated).toLocaleDateString() : '-',
          userCreated: product.userCreated?.toString() || '-',
          userUpdated: product.userUpdated?.toString() || '-',
          isActive: product.isActive === null ? 'Not Set' : product.isActive ? 'Active' : 'Inactive'
        }))
        setProducts(formattedData)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setFormError('Product name is required')
      return
    }

    try {
      setFormLoading(true)
      setFormError(null)

      if (modalMode === 'create') {
        const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/Product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            isActive: formData.isActive
          })
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorData}`)
        }

        toast.success('✅ Product created successfully!')
        await fetchProducts()
        closeModal()
      } else if (modalMode === 'edit') {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Product/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.id,
            name: formData.name,
            isActive: formData.isActive
          })
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorData}`)
        }

        toast.success('✅ Product updated successfully!')
        await fetchProducts()
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

  // Define row actions
  const rowActions: RowAction[] = [
    {
      label: 'View',
      icon: 'view',
      color: 'text-blue-600 hover:text-blue-900',
      onClick: (row, index) => {
        handleViewProduct(row)
      }
    },
    {
      label: 'Edit',
      icon: 'edit',
      color: 'text-amber-600 hover:text-amber-900',
      onClick: (row, index) => {
        handleEditProduct(row)
      }
    },
    {
      label: 'Delete',
      icon: 'delete',
      color: 'text-red-600 hover:text-red-900',
      onClick: (row, index) => {
        handleDeleteProduct(row)
      }
    }
  ]

  const handleViewProduct = (product: FormattedProduct) => {
    navigate(`${location.pathname}?id=${product.id}&mode=view`)
    setFormData({ id: product.id, name: product.name, isActive: product.isActive === 'Active' })
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditProduct = (product: FormattedProduct) => {
    navigate(`${location.pathname}?id=${product.id}&mode=edit`)
    setFormData({ id: product.id, name: product.name, isActive: product.isActive === 'Active' })
    setFormError(null)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleDeleteProduct = async (product: FormattedProduct) => {
    const result = await Swal.fire({
      title: 'Delete Product',
      html: `Are you sure you want to delete <strong>"${product.name}"</strong>? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      Swal.fire({
        title: 'Deleting...',
        html: 'Please wait while we delete the product.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: async () => {
          Swal.showLoading()
          
          try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Product/${product.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            })

            if (!response.ok) {
              const errorData = await response.text()
              throw new Error(`HTTP error! status: ${response.status} - ${errorData}`)
            }

            await fetchProducts()
            
            Swal.fire({
              title: 'Deleted!',
              text: `"${product.name}" has been deleted successfully.`,
              icon: 'success',
              confirmButtonColor: '#3b82f6'
            })

            toast.success('✅ Product deleted successfully!')
          } catch (err) {
            console.error('Error deleting product:', err)
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete product'
            
            Swal.fire({
              title: 'Error!',
              text: errorMsg,
              icon: 'error',
              confirmButtonColor: '#ef4444'
            })

            toast.error(`❌ Error: ${errorMsg}`)
          }
        }
      })
    } catch (err) {
      console.error('Error:', err)
      Swal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading products...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>


      <GenericInventoryTable
        title="Products"
        columns={columns}
        data={products}
        onImport={handleImport}
        onExport={handleExport}
        onAddNew={handleAddNew}
        showImport={true}
        showExport={true}
        showAddNew={true}
        itemsPerPage={10}
        actions={rowActions}
        showActions={true}
      />

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Add New Product'}
                {modalMode === 'edit' && 'Edit Product'}
                {modalMode === 'view' && 'View Product'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              {/* ID Field (View Only) */}
              {modalMode === 'view' && (
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID</label>
                  <input
                    type="text"
                    value={formData.id}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
                  />
                </div>
              )}

              {/* Product Name Field */}
              <div className="mb-5">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name {modalMode !== 'view' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter product name"
                  readOnly={modalMode === 'view'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                  }`}
                  disabled={formLoading || modalMode === 'view'}
                  required={modalMode !== 'view'}
                />
              </div>

              {/* Is Active Field */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    disabled={formLoading || modalMode === 'view'}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  disabled={formLoading}
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {modalMode === 'create' ? 'Creating...' : 'Updating...'}
                      </>
                    ) : (
                      modalMode === 'create' ? 'Create Product' : 'Update Product'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductMaster