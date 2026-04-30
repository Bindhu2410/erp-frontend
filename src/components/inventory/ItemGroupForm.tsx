import React from 'react';

const ItemGroupForm: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Item Account Group</h2>
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Group<span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Group / Category<span className="text-red-500">*</span></label>
          <select className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Select</option>
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Code<span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type<span className="text-red-500">*</span></label>
          <select className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Select</option>
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Type<span className="text-red-500">*</span></label>
          <select className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Select</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-red-600 mb-2">Finance Integration</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset/Inventory A/c</label>
            <select className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select</option>
            </select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation A/c</label>
            <select className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select</option>
            </select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase A/c</label>
            <select className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="border-b border-gray-200 mb-2 flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-blue-700 border-b-2 border-blue-700 bg-blue-50 rounded-t">Group Master</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-t">Category Master</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-t">Product Config Master</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-t">Product type Master</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-t">Brand Master</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">S No</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Group Name<span className="text-red-500">*</span></th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Group Order</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border-b">1</td>
                <td className="px-4 py-2 border-b"></td>
                <td className="px-4 py-2 border-b"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemGroupForm;
