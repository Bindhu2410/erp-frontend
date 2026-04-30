import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GenericInventoryTable, { Column, RowAction } from "../../../components/table/GenericInventoryTable";
import api from "../../../services/api";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';

interface MakeItem {
  id: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  name: string;
  isActive: boolean;
}

interface FormattedMake {
  id: number;
  name: string;
  isActive: string;
  dateCreated: string;
}

type ModalMode = 'create' | 'edit' | 'view';

interface FormData {
  id: number;
  name: string;
  isActive: boolean;
}



const MakeMaster: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [makes, setMakes] = useState<FormattedMake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [formData, setFormData] = useState<FormData>({ id: 0, name: '', isActive: true });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchMakes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Make`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const formattedData: FormattedMake[] = data.map((item: MakeItem) => ({
        id: item.id,
        name: item.name,
        isActive: item.isActive ? 'Active' : 'Inactive',
        dateCreated: item.dateCreated ? new Date(item.dateCreated).toLocaleDateString() : '-'
      }));

      setMakes(formattedData);
    } catch (err) {
      console.error('Error fetching makes:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch makes';
      setError(errorMsg);
      toast.error(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMakes();
  }, []);

  const handleImport = () => {
    toast.info('📥 Import functionality coming soon!');
  };

  const handleExport = () => {
    toast.info('📤 Export functionality coming soon!');
  };

  const handleAddNew = () => {
    setFormData({ id: 0, name: '', isActive: true });
    setFormError(null);
    setModalMode('create');
    setShowModal(true);
  };

  const closeModal = () => {
    navigate(location.pathname);
    setShowModal(false);
    setFormData({ id: 0, name: '', isActive: true });
    setFormError(null);
    setFormLoading(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Make name is required');
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);

      const payload = {
        id: formData.id,
        name: formData.name.trim(),
        isActive: formData.isActive
      };

      let response;
      if (modalMode === 'create') {
        response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Make`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Make/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
      }

      await fetchMakes();
      closeModal();

      const successMsg = modalMode === 'create' ? 'Make created successfully!' : 'Make updated successfully!';
      toast.success(`✅ ${successMsg}`);
    } catch (err) {
      console.error('Error saving make:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to save make';
      setFormError(errorMsg);
      toast.error(`❌ Error: ${errorMsg}`);
    } finally {
      setFormLoading(false);
    }
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Make Name', sortable: true },
    { key: 'isActive', label: 'Status', sortable: true },
    { key: 'dateCreated', label: 'Date Created', sortable: true }
  ];

  const rowActions: RowAction[] = [
    {
      label: 'View',
      icon: 'view',
      color: 'text-blue-600 hover:text-blue-800',
      onClick: (row) => handleViewMake(row)
    },
    {
      label: 'Edit',
      icon: 'edit',
      color: 'text-green-600 hover:text-green-800',
      onClick: (row) => handleEditMake(row)
    },
    {
      label: 'Delete',
      icon: 'delete',
      color: 'text-red-600 hover:text-red-800',
      onClick: (row) => handleDeleteMake(row)
    }
  ];

  const handleViewMake = (make: FormattedMake) => {
    navigate(`${location.pathname}?id=${make.id}&mode=view`);
    setFormData({ id: make.id, name: make.name, isActive: make.isActive === 'Active' });
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditMake = (make: FormattedMake) => {
    navigate(`${location.pathname}?id=${make.id}&mode=edit`);
    setFormData({ id: make.id, name: make.name, isActive: make.isActive === 'Active' });
    setFormError(null);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteMake = async (make: FormattedMake) => {
    const result = await Swal.fire({
      title: 'Delete Make',
      html: `Are you sure you want to delete <strong>"${make.name}"</strong>? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: 'Deleting...',
        html: 'Please wait while we delete the make.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: async () => {
          Swal.showLoading();

          try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Make/${make.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
              const errorData = await response.text();
              throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
            }

            await fetchMakes();

            Swal.fire({
              title: 'Deleted!',
              text: `"${make.name}" has been deleted successfully.`,
              icon: 'success',
              confirmButtonColor: '#3b82f6'
            });

            toast.success('✅ Make deleted successfully!');
          } catch (err) {
            console.error('Error deleting make:', err);
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete make';

            Swal.fire({
              title: 'Error!',
              text: errorMsg,
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });

            toast.error(`❌ Error: ${errorMsg}`);
          }
        }
      });
    } catch (err) {
      console.error('Error:', err);
      Swal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading makes...</span>
        </div>
      </div>
    );
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
              <h3 className="text-sm font-medium text-red-800">Error loading makes</h3>
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
    );
  }

  return (
    <>


      <GenericInventoryTable
        title="Makes"
        columns={columns}
        data={makes}
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

      {/* Make Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' && 'Add New Make'}
                {modalMode === 'edit' && 'Edit Make'}
                {modalMode === 'view' && 'View Make'}
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

              {/* Make Name Field */}
              <div className="mb-5">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Make Name {modalMode !== 'view' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter make name"
                  readOnly={modalMode === 'view'}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${modalMode === 'view' ? 'bg-gray-100 text-gray-600' : ''
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
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {formLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {modalMode === 'create' ? 'Create Make' : 'Update Make'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MakeMaster;
