import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import GenericInventoryTable, { type RowAction } from '../../../components/table/GenericInventoryTable'

interface TermsConditionsDetail {
  id: number
  tcId: number
  sno: number
  type: string
  termsAndConditions: string
}

interface TermsConditions {
  id: number
  userCreated: number | null
  dateCreated: string
  userUpdated: number | null
  dateUpdated: string | null
  moduleName: string
  templateName: string
  templateDescription: string
  details: TermsConditionsDetail[]
}

interface FormattedTermsConditions {
  id: number
  moduleName: string
  templateName: string
  templateDescription: string
  dateCreated: string
  userCreated: string
  dateUpdated: string
  userUpdated: string
}

const TermsConditions = () => {
  const [termsConditions, setTermsConditions] = useState<FormattedTermsConditions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [formData, setFormData] = useState({
    id: 0,
    moduleName: '',
    templateName: '',
    templateDescription: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [tableRows, setTableRows] = useState<Array<{id: number, type: string, termsAndConditions: string}>>([{id: 1, type: '', termsAndConditions: ''}])

  // Define columns for the terms conditions table
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'moduleName', label: 'Module Name', sortable: true },
    { key: 'templateName', label: 'Template Name', sortable: true },
    { key: 'templateDescription', label: 'Description', sortable: false },
    { key: 'dateCreated', label: 'Date Created', sortable: true }
  ]

  // Fetch terms conditions from API
  useEffect(() => {
    fetchTermsConditions()
  }, [])

  const fetchTermsConditions = async () => {
    try {
      setLoading(true)
      const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/TermsConditions')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: TermsConditions[] = await response.json()
      
      const formattedData: FormattedTermsConditions[] = data.map(item => ({
        id: item.id,
        moduleName: item.moduleName,
        templateName: item.templateName,
        templateDescription: item.templateDescription,
        dateCreated: item.dateCreated ? new Date(item.dateCreated).toLocaleDateString() : '-',
        dateUpdated: item.dateUpdated ? new Date(item.dateUpdated).toLocaleDateString() : '-',
        userCreated: item.userCreated?.toString() || '-',
        userUpdated: item.userUpdated?.toString() || '-',
      }))
      
      setTermsConditions(formattedData)
      setError(null)
    } catch (err) {
      console.error('Error fetching terms and conditions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch terms and conditions')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    console.log('Import CSV clicked')
    // Implement import functionality
  }

  const handleExport = () => {
    console.log('Download Template clicked')
    // Implement export functionality
  }

  const handleAddNew = () => {
    setFormData({ id: 0, moduleName: '', templateName: '', templateDescription: '' })
    setTableRows([{id: 1, type: '', termsAndConditions: ''}])
    setFormError(null)
    setModalMode('create')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({ id: 0, moduleName: '', templateName: '', templateDescription: '' })
    setTableRows([{id: 1, type: '', termsAndConditions: ''}])
    setFormError(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTableCellChange = (rowIndex: number, field: 'type' | 'termsAndConditions', value: string) => {
    setTableRows(prev => prev.map((row, index) => 
      index === rowIndex ? { ...row, [field]: value } : row
    ))
  }

  const addNewRow = () => {
    setTableRows(prev => [...prev, { id: prev.length + 1, type: '', termsAndConditions: '' }])
  }

  const removeRow = (rowIndex: number) => {
    if (tableRows.length > 1) {
      setTableRows(prev => prev.filter((_, index) => index !== rowIndex))
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.moduleName.trim() || !formData.templateName.trim()) {
      setFormError('Module Name and Template Name are required')
      return
    }

    const validRows = tableRows.filter(row => row.type.trim() || row.termsAndConditions.trim())
    if (validRows.length === 0) {
      setFormError('Please add at least one term and condition')
      return
    }

    try {
      setFormLoading(true)
      setFormError(null)

      const details = validRows.map((row, index) => ({
        sno: index + 1,
        type: row.type.trim() || 'Default Type',
        termsAndConditions: row.termsAndConditions.trim() || 'Default terms and conditions'
      }))

      if (modalMode === 'create') {
        const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/TermsConditions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleName: formData.moduleName.trim(),
            templateName: formData.templateName.trim(),
            templateDescription: formData.templateDescription.trim() || 'Default description',
            details
          })
        })
        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorData}`)
        }
        toast.success('✅ Terms and Conditions created successfully!')
      } else if (modalMode === 'edit') {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/TermsConditions/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.id,
            moduleName: formData.moduleName.trim(),
            templateName: formData.templateName.trim(),
            templateDescription: formData.templateDescription.trim() || 'Default description',
            details: validRows.map((row, index) => ({
              id: typeof row.id === 'number' && row.id > 0 ? row.id : undefined,
              sno: index + 1,
              type: row.type.trim() || 'Default Type',
              termsAndConditions: row.termsAndConditions.trim() || 'Default terms and conditions'
            }))
          })
        })
        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorData}`)
        }
        toast.success('✅ Terms and Conditions updated successfully!')
      }

      await fetchTermsConditions()
      closeModal()
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
        handleViewTermsConditions(row)
      }
    },
    {
      label: 'Edit',
      icon: 'edit',
      color: 'text-amber-600 hover:text-amber-900',
      onClick: (row, index) => {
        handleEditTermsConditions(row)
      }
    },
    {
      label: 'Delete',
      icon: 'delete',
      color: 'text-red-600 hover:text-red-900',
      onClick: (row, index) => {
        handleDeleteTermsConditions(row)
      }
    }
  ]

  const handleViewTermsConditions = async (item: FormattedTermsConditions) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/TermsConditions/${item.id}`)
      if (response.ok) {
        const data: TermsConditions = await response.json()
        setFormData({
          id: data.id,
          moduleName: data.moduleName,
          templateName: data.templateName,
          templateDescription: data.templateDescription
        })
        setTableRows(data.details.map(detail => ({
          id: detail.id,
          type: detail.type,
          termsAndConditions: detail.termsAndConditions
        })))
        setModalMode('view')
        setShowModal(true)
      }
    } catch (err) {
      toast.error('Failed to load details')
    }
  }

  const handleEditTermsConditions = async (item: FormattedTermsConditions) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/TermsConditions/${item.id}`)
      if (response.ok) {
        const data: TermsConditions = await response.json()
        setFormData({
          id: data.id,
          moduleName: data.moduleName,
          templateName: data.templateName,
          templateDescription: data.templateDescription
        })
        setTableRows(data.details.map(detail => ({
          id: detail.id,
          type: detail.type,
          termsAndConditions: detail.termsAndConditions
        })))
        setFormError(null)
        setModalMode('edit')
        setShowModal(true)
      }
    } catch (err) {
      toast.error('Failed to load details for editing')
    }
  }

  const handleDeleteTermsConditions = async (item: FormattedTermsConditions) => {
    const result = await Swal.fire({
      title: 'Delete Terms & Conditions',
      html: `Are you sure you want to delete <strong>"${item.templateName}"</strong>? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    Swal.fire({
      title: 'Deleting...',
      html: 'Please wait while we delete the terms and conditions.',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: async () => {
        Swal.showLoading()
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/TermsConditions/${item.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          })

          if (!response.ok) {
            const errorText = await response.text()
            // Foreign key constraint — record is in use by BOM
            if (response.status === 500 && errorText.includes('foreign key')) {
              Swal.fire({
                title: 'Cannot Delete',
                html: `<strong>"${item.templateName}"</strong> is currently used in one or more Bill of Materials and cannot be deleted.<br/><br/>Please remove it from all BOMs first.`,
                icon: 'warning',
                confirmButtonColor: '#3b82f6'
              })
              return
            }
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          await fetchTermsConditions()
          Swal.fire({
            title: 'Deleted!',
            text: `"${item.templateName}" has been deleted successfully.`,
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          })
          toast.success('✅ Terms and Conditions deleted successfully!')
        } catch (err) {
          console.error('Error deleting terms and conditions:', err)
          const errorMsg = err instanceof Error ? err.message : 'Failed to delete'
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
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading terms and conditions...</span>
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
              <h3 className="text-sm font-medium text-red-800">Error loading terms and conditions</h3>
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
        title="Terms and Conditions"
        columns={columns}
        data={termsConditions}
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

      {/* Terms and Conditions Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Add New Terms and Conditions'}
                {modalMode === 'edit' && 'Edit Terms and Conditions'}
                {modalMode === 'view' && 'View Terms and Conditions'}
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

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="moduleName" className="block text-sm font-medium text-gray-700 mb-2">
                    Module Name {modalMode !== 'view' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="moduleName"
                    name="moduleName"
                    value={formData.moduleName}
                    onChange={handleFormChange}
                    placeholder="Enter module name"
                    readOnly={modalMode === 'view'}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                    }`}
                    disabled={formLoading || modalMode === 'view'}
                    required={modalMode !== 'view'}
                  />
                </div>
                <div>
                  <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name {modalMode !== 'view' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="templateName"
                    name="templateName"
                    value={formData.templateName}
                    onChange={handleFormChange}
                    placeholder="Enter template name"
                    readOnly={modalMode === 'view'}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                    }`}
                    disabled={formLoading || modalMode === 'view'}
                    required={modalMode !== 'view'}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Template Description
                </label>
                <input
                  type="text"
                  id="templateDescription"
                  name="templateDescription"
                  value={formData.templateDescription}
                  onChange={handleFormChange}
                  placeholder="Enter template description"
                  readOnly={modalMode === 'view'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                  }`}
                  disabled={formLoading || modalMode === 'view'}
                />
              </div>

              {/* Terms and Conditions Details Table */}
              <div className="mb-6">
                <div className="bg-gray-100 px-4 py-3 border-b mb-4">
                  <h3 className="text-md font-medium text-gray-800">Terms and Conditions Details</h3>
                </div>
                
                <div className="overflow-x-auto border border-gray-300 rounded-md">
                  <table className="w-full">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium w-20">S No</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-1/3">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium w-1/2">Terms and Condition</th>
                        {modalMode !== 'view' && (
                          <th className="px-4 py-3 text-left text-sm font-medium w-20">Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, index) => (
                        <tr key={row.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 text-sm font-medium">{index + 1}</td>
                          <td className="px-2 py-1">
                            <input
                              type="text"
                              value={row.type}
                              onChange={(e) => handleTableCellChange(index, 'type', e.target.value)}
                              className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              placeholder="Enter type"
                              readOnly={modalMode === 'view'}
                              disabled={modalMode === 'view'}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <textarea
                              value={row.termsAndConditions}
                              onChange={(e) => handleTableCellChange(index, 'termsAndConditions', e.target.value)}
                              className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              placeholder="Enter terms and conditions"
                              rows={2}
                              readOnly={modalMode === 'view'}
                              disabled={modalMode === 'view'}
                            />
                          </td>
                          {modalMode !== 'view' && (
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeRow(index)}
                                disabled={tableRows.length === 1}
                                className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                title="Remove row"
                              >
                                ✕
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {modalMode !== 'view' && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={addNewRow}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      + Add Row
                    </button>
                  </div>
                )}
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
                      modalMode === 'create' ? 'Create Terms & Conditions' : 'Update Terms & Conditions'
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

export default TermsConditions