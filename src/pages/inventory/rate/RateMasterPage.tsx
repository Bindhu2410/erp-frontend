import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import api from '../../../services/api'
import GenericInventoryTable, { type RowAction } from '../../../components/table/GenericInventoryTable'

interface RateItem {
  id?: number
  rateMasterId?: number
  itemId: number
  supplierId: number
  currencyType: string
  purchaseRate: number
  hsnCode: string
  tax: number
  salesRate: number
  klRate: number
  quotationRate: number
}

interface RateMasterData {
  id?: number
  rateMasterId?: string
  docDate: string
  effectiveDate: string
  inventoryGroupId: number
  type: string
  remarks: string
  userCreated?: number | string
  dateCreated?: string
  userUpdated?: number | string
  dateUpdated?: string
  items: RateItem[]
}

interface FormattedRateMaster {
  id: number
  rateMasterId: string
  docDate: string
  effectiveDate: string
  type: string
  itemCount: string
}

const RateMasterPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [rateMasters, setRateMasters] = useState<FormattedRateMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [itemMasters, setItemMasters] = useState<{ label: string; value: number }[]>([])
  const [suppliers, setSuppliers] = useState<{ label: string; value: number }[]>([])
  const [inventoryGroups, setInventoryGroups] = useState<{ label: string; value: number }[]>([])

  const [formData, setFormData] = useState<RateMasterData>({
    docDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    inventoryGroupId: 4,
    type: 'Normal',
    remarks: '',
    items: [{
      itemId: 0,
      supplierId: 0,
      currencyType: 'INR',
      purchaseRate: 0,
      hsnCode: '',
      tax: 0,
      salesRate: 0,
      klRate: 0,
      quotationRate: 0
    }]
  })

  // Define columns for the rate master table
  const columns = [
    { key: 'rateMasterId', label: 'Rate Master ID', sortable: true },
    { key: 'docDate', label: 'Doc Date', sortable: true },
    { key: 'effectiveDate', label: 'Effective Date', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'itemCount', label: 'Items', sortable: false }
  ]

  // Fetch reference data (items, suppliers, inventory groups)
  const fetchReferenceData = async () => {
    try {
      const [itemsRes, suppliersRes, inventoryGroupsRes] = await Promise.all([
        api.get('ItemMaster'),
        api.get('Supplier'),
        api.get('InventoryGroup')
      ])

      setItemMasters(
        itemsRes.data.map((item: any) => ({
          label: item.itemName || item.name || `Item ${item.id}`,
          value: item.id
        }))
      )

      setSuppliers(
        suppliersRes.data.map((supplier: any) => ({
          label: supplier.vendorName || supplier.companyName || supplier.name || `Supplier ${supplier.id}`,
          value: supplier.id
        }))
      )

      setInventoryGroups(
        inventoryGroupsRes.data.map((group: any) => ({
          label: group.name,
          value: group.id
        }))
      )
    } catch (err) {
      console.error('Error fetching reference data:', err)
    }
  }

  // Fetch rate masters from API
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        await fetchReferenceData()
        const response = await api.get<RateMasterData[]>('RateMaster')

        // Format the data for display
        const formattedData: FormattedRateMaster[] = (response.data || []).map(rateMaster => ({
          id: rateMaster.id || 0,
          rateMasterId: rateMaster.rateMasterId || '',
          docDate: new Date(rateMaster.docDate).toLocaleDateString(),
          effectiveDate: new Date(rateMaster.effectiveDate).toLocaleDateString(),
          type: rateMaster.type,
          itemCount: (rateMaster.items?.length || 0).toString()
        }))

        setRateMasters(formattedData)
        setError(null)
      } catch (err) {
        console.error('Error fetching rate masters:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch rate masters')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setFormData({
      docDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      inventoryGroupId: 4,
      type: 'Normal',
      remarks: '',
      items: [{
        itemId: 0,
        supplierId: 0,
        currencyType: 'INR',
        purchaseRate: 0,
        hsnCode: '',
        tax: 0,
        salesRate: 0,
        klRate: 0,
        quotationRate: 0
      }]
    })
    setFormError(null)
    setModalMode('create')
    setSelectedId(null)
    setShowModal(true)
  }

  const closeModal = () => {
    navigate(location.pathname)
    setShowModal(false)
    setSelectedId(null)
    setFormData({
      docDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      inventoryGroupId: 4,
      type: 'Normal',
      remarks: '',
      items: [{
        itemId: 0,
        supplierId: 0,
        currencyType: 'INR',
        purchaseRate: 0,
        hsnCode: '',
        tax: 0,
        salesRate: 0,
        klRate: 0,
        quotationRate: 0
      }]
    })
    setFormError(null)
  }

  const fetchRateMastersData = async () => {
    try {
      const response = await api.get<RateMasterData[]>('RateMaster')
      const formattedData: FormattedRateMaster[] = (response.data || []).map(rateMaster => ({
        id: rateMaster.id || 0,
        rateMasterId: rateMaster.rateMasterId || '',
        docDate: new Date(rateMaster.docDate).toLocaleDateString(),
        effectiveDate: new Date(rateMaster.effectiveDate).toLocaleDateString(),
        type: rateMaster.type,
        itemCount: (rateMaster.items?.length || 0).toString()
      }))
      setRateMasters(formattedData)
    } catch (err) {
      console.error('Error fetching rate masters:', err)
    }
  }

  const handleViewRateMaster = async (row: FormattedRateMaster) => {
    navigate(`${location.pathname}?id=${row.id}&mode=view`)
    try {
      const response = await api.get<RateMasterData>(`RateMaster/${row.id}`)
      const rateMaster = response.data

      setFormData({
        id: rateMaster.id,
        rateMasterId: rateMaster.rateMasterId,
        docDate: rateMaster.docDate.split('T')[0],
        effectiveDate: rateMaster.effectiveDate.split('T')[0],
        inventoryGroupId: rateMaster.inventoryGroupId,
        type: rateMaster.type.charAt(0).toUpperCase() + rateMaster.type.slice(1),
        remarks: rateMaster.remarks,
        items: rateMaster.items || []
      })

      setSelectedId(row.id)
      setModalMode('view')
      setShowModal(true)
    } catch (err) {
      console.error('Error fetching rate master:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch rate master'
      toast.error(`❌ Error: ${errorMsg}`)
    }
  }

  const handleEditRateMaster = async (row: FormattedRateMaster) => {
    navigate(`${location.pathname}?id=${row.id}&mode=edit`)
    try {
      const response = await api.get<RateMasterData>(`RateMaster/${row.id}`)
      const rateMaster = response.data

      setFormData({
        id: rateMaster.id,
        rateMasterId: rateMaster.rateMasterId,
        docDate: rateMaster.docDate.split('T')[0],
        effectiveDate: rateMaster.effectiveDate.split('T')[0],
        inventoryGroupId: rateMaster.inventoryGroupId,
        type: rateMaster.type.charAt(0).toUpperCase() + rateMaster.type.slice(1),
        remarks: rateMaster.remarks,
        items: rateMaster.items || []
      })

      setSelectedId(row.id)
      setFormError(null)
      setModalMode('edit')
      setShowModal(true)
    } catch (err) {
      console.error('Error fetching rate master:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch rate master'
      toast.error(`❌ Error: ${errorMsg}`)
    }
  }

  const handleDeleteRateMaster = async (row: FormattedRateMaster) => {
    const result = await Swal.fire({
      title: 'Delete Rate Master',
      html: `Are you sure you want to delete <strong>"${row.rateMasterId}"</strong>? This action cannot be undone.`,
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
        html: 'Please wait while we delete the rate master.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: async () => {
          Swal.showLoading()

          try {
            await api.delete(`RateMaster/${row.id}`)
            await fetchRateMastersData()

            Swal.fire({
              title: 'Deleted!',
              text: `"${row.rateMasterId}" has been deleted successfully.`,
              icon: 'success',
              confirmButtonColor: '#3b82f6'
            })

            toast.success('✅ Rate Master deleted successfully!')
          } catch (err) {
            console.error('Error deleting rate master:', err)
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete rate master'

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: name === 'inventoryGroupId' ? Number(value) : value
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        itemId: 0,
        supplierId: 0,
        currencyType: 'INR',
        purchaseRate: 0,
        hsnCode: '',
        tax: 0,
        salesRate: 0,
        klRate: 0,
        quotationRate: 0
      }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const updateItem = (index: number, field: keyof RateItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.items || formData.items.length === 0) {
      setFormError('At least one item is required')
      return
    }

    // Validate all items have required fields
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i]
      if (item.itemId === 0) {
        setFormError(`Item ${i + 1}: Item is required`)
        return
      }
      if (item.supplierId === 0) {
        setFormError(`Item ${i + 1}: Supplier is required`)
        return
      }
      if (item.purchaseRate <= 0) {
        setFormError(`Item ${i + 1}: Purchase Rate must be greater than 0`)
        return
      }
      if (item.salesRate <= 0) {
        setFormError(`Item ${i + 1}: Sales Rate must be greater than 0`)
        return
      }
    }

    try {
      setFormLoading(true)
      setFormError(null)

      const payload = {
        rateMasterId: modalMode === 'edit' ? formData.rateMasterId : '',
        docDate: `${formData.docDate}T00:00:00.000Z`,
        effectiveDate: `${formData.effectiveDate}T00:00:00.000Z`,
        inventoryGroupId: Number(formData.inventoryGroupId),
        type: formData.type.toLowerCase(),
        remarks: formData.remarks,
        userCreated: 1,
        dateCreated: new Date().toISOString(),
        userUpdated: 1,
        dateUpdated: new Date().toISOString(),
        items: formData.items.map(item => ({
          itemId: Number(item.itemId),
          supplierId: Number(item.supplierId),
          currencyType: item.currencyType,
          purchaseRate: Number(item.purchaseRate),
          hsnCode: item.hsnCode,
          tax: Number(item.tax),
          salesRate: Number(item.salesRate),
          klRate: Number(item.klRate),
          quotationRate: Number(item.quotationRate)
        }))
      }

      if (modalMode === 'create') {
        await api.post('RateMaster', payload)
        toast.success('✅ Rate Master created successfully!')
      } else if (modalMode === 'edit' && selectedId) {
        const editPayload = {
          id: selectedId,
          ...payload
        }
        await api.put(`RateMaster/${selectedId}`, editPayload)
        toast.success('✅ Rate Master updated successfully!')
      }

      await fetchRateMastersData()
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
      onClick: (row) => {
        handleViewRateMaster(row as FormattedRateMaster)
      }
    },
    {
      label: 'Edit',
      icon: 'edit',
      color: 'text-amber-600 hover:text-amber-900',
      onClick: (row) => {
        handleEditRateMaster(row as FormattedRateMaster)
      }
    },
    {
      label: 'Delete',
      icon: 'delete',
      color: 'text-red-600 hover:text-red-900',
      onClick: (row) => {
        handleDeleteRateMaster(row as FormattedRateMaster)
      }
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading rate masters...</span>
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
              <h3 className="text-sm font-medium text-red-800">Error loading rate masters</h3>
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
        title="Rate Masters"
        columns={columns}
        data={rateMasters}
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

      {/* Rate Master Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-5xl mx-4 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Create Rate Master'}
                {modalMode === 'edit' && 'Edit Rate Master'}
                {modalMode === 'view' && 'View Rate Master'}
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

              {/* Header Fields */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Master Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Read-only Rate Master ID (auto-generated) */}
                  {modalMode !== 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Master ID
                      </label>
                      <input
                        type="text"
                        value={formData.rateMasterId || 'Auto-generated'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="inventoryGroupId" className="block text-sm font-medium text-gray-700 mb-2">
                      Inventory Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="inventoryGroupId"
                      name="inventoryGroupId"
                      value={formData.inventoryGroupId}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                      }`}
                      disabled={formLoading || modalMode === 'view'}
                      required
                    >
                      <option value={0}>Select Inventory Group</option>
                      {inventoryGroups.map(group => (
                        <option key={group.value} value={group.value}>
                          {group.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                      }`}
                      disabled={formLoading || modalMode === 'view'}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Special">Special</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="docDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Doc Date
                    </label>
                    <input
                      type="date"
                      id="docDate"
                      name="docDate"
                      value={formData.docDate}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                      }`}
                      readOnly={modalMode === 'view'}
                      disabled={formLoading || modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      id="effectiveDate"
                      name="effectiveDate"
                      value={formData.effectiveDate}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                      }`}
                      readOnly={modalMode === 'view'}
                      disabled={formLoading || modalMode === 'view'}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleFormChange}
                      placeholder="Enter remarks"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                      }`}
                      readOnly={modalMode === 'view'}
                      disabled={formLoading || modalMode === 'view'}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                  {modalMode !== 'view' && (
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      disabled={formLoading}
                    >
                      + Add Item
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border border-gray-300 rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium">Item</th>
                        <th className="px-2 py-2 text-left font-medium">Supplier</th>
                        <th className="px-2 py-2 text-left font-medium">Currency</th>
                        <th className="px-2 py-2 text-left font-medium">Purchase Rate</th>
                        <th className="px-2 py-2 text-left font-medium">HSN Code</th>
                        <th className="px-2 py-2 text-left font-medium">Tax %</th>
                        <th className="px-2 py-2 text-left font-medium">Sale Rate</th>
                        <th className="px-2 py-2 text-left font-medium">KL Rate</th>
                        <th className="px-2 py-2 text-left font-medium">Quote Rate</th>
                        {modalMode !== 'view' && <th className="px-2 py-2 text-center font-medium">Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-2 py-2">
                            <select
                              value={item.itemId}
                              onChange={(e) => updateItem(index, 'itemId', Number(e.target.value))}
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              disabled={modalMode === 'view' || formLoading}
                            >
                              <option value={0}>Select Item</option>
                              {itemMasters.map(item => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={item.supplierId}
                              onChange={(e) => updateItem(index, 'supplierId', Number(e.target.value))}
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              disabled={modalMode === 'view' || formLoading}
                            >
                              <option value={0}>Select Supplier</option>
                              {suppliers.map(supplier => (
                                <option key={supplier.value} value={supplier.value}>
                                  {supplier.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.currencyType}
                              onChange={(e) => updateItem(index, 'currencyType', e.target.value)}
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              readOnly={modalMode === 'view'}
                              disabled={modalMode === 'view' || formLoading}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.purchaseRate || ''}
                              onChange={(e) => updateItem(index, 'purchaseRate', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              readOnly={modalMode === 'view'}
                              disabled={modalMode === 'view' || formLoading}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.hsnCode}
                              onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              readOnly={modalMode === 'view'}
                              disabled={modalMode === 'view' || formLoading}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.tax || ''}
                              onChange={(e) => updateItem(index, 'tax', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              readOnly={modalMode === 'view'}
                              disabled={modalMode === 'view' || formLoading}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.salesRate || ''}
                              onChange={(e) => updateItem(index, 'salesRate', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              readOnly={modalMode === 'view'}
                              disabled={modalMode === 'view' || formLoading}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.klRate || ''}
                              onChange={(e) => updateItem(index, 'klRate', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              readOnly={modalMode === 'view'}
                              disabled={modalMode === 'view' || formLoading}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.quotationRate || ''}
                              onChange={(e) => updateItem(index, 'quotationRate', e.target.value === '' ? 0 : Number(e.target.value))}
                              placeholder="0"
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs ${
                                modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
                              }`}
                              readOnly={modalMode === 'view'}
                              disabled={modalMode === 'view' || formLoading}
                            />
                          </td>
                          {modalMode !== 'view' && (
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                disabled={formData.items.length === 1 || formLoading}
                                className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
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
                      modalMode === 'create' ? 'Create Rate Master' : 'Update Rate Master'
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

export default RateMasterPage
