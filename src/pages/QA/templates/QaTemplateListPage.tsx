import React, { useState, useEffect, useCallback } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaChevronRight,
  FaShieldAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { qaTemplateService } from "../../../services/qaService";
import type {
  QaTemplate,
  QaChecklistItem,
  QaChecklistItemRequest,
} from "../../../types/qa";
import { useUser } from "../../../context/UserContext";

interface NewChecklistItemForm {
  checkPoint: string;
  description: string;
  isRequired: boolean;
  sequence: number;
}

const emptyForm = (): NewChecklistItemForm => ({
  checkPoint: "",
  description: "",
  isRequired: true,
  sequence: 1,
});

const QaTemplateListPage: React.FC = () => {
  const { user } = useUser();
  const [templates, setTemplates] = useState<QaTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(null);
  const [checklistItems, setChecklistItems] = useState<Record<number, QaChecklistItem[]>>({});
  const [loadingChecklist, setLoadingChecklist] = useState<number | null>(null);

  // Add new checklist item state
  const [addingToTemplate, setAddingToTemplate] = useState<number | null>(null);
  const [newItemForm, setNewItemForm] = useState<NewChecklistItemForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingItem, setEditingItem] = useState<QaChecklistItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<NewChecklistItemForm>>({});

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await qaTemplateService.getAll();
      setTemplates(data);
    } catch {
      toast.error("Failed to load QA templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleExpandTemplate = async (templateId: number) => {
    if (expandedTemplateId === templateId) {
      setExpandedTemplateId(null);
      return;
    }
    setExpandedTemplateId(templateId);
    if (!checklistItems[templateId]) {
      try {
        setLoadingChecklist(templateId);
        const items = await qaTemplateService.getChecklistItems(templateId);
        setChecklistItems((prev) => ({ ...prev, [templateId]: items }));
      } catch {
        toast.error("Failed to load checklist items.");
      } finally {
        setLoadingChecklist(null);
      }
    }
  };

  const handleAddItem = async (templateId: number) => {
    if (!newItemForm.checkPoint.trim()) {
      toast.error("Check point is required.");
      return;
    }
    try {
      setSaving(true);
      const payload: QaChecklistItemRequest = {
        ...newItemForm,
        createdBy: user?.userId ?? 1,
      };
      const created = await qaTemplateService.addChecklistItem(templateId, payload);
      setChecklistItems((prev) => ({
        ...prev,
        [templateId]: [...(prev[templateId] ?? []), created],
      }));
      setNewItemForm(emptyForm());
      setAddingToTemplate(null);
      toast.success("Check point added.");
    } catch {
      toast.error("Failed to add check point.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (templateId: number, itemId: number) => {
    if (!window.confirm("Delete this check point?")) return;
    try {
      await qaTemplateService.deleteChecklistItem(templateId, itemId);
      setChecklistItems((prev) => ({
        ...prev,
        [templateId]: prev[templateId]?.filter((i) => i.id !== itemId) ?? [],
      }));
      toast.success("Check point deleted.");
    } catch {
      toast.error("Failed to delete check point.");
    }
  };

  const handleSaveEdit = async (templateId: number) => {
    if (!editingItem) return;
    try {
      setSaving(true);
      await qaTemplateService.updateChecklistItem(templateId, editingItem.id, editForm);
      setChecklistItems((prev) => ({
        ...prev,
        [templateId]: prev[templateId]?.map((i) =>
          i.id === editingItem.id ? { ...i, ...editForm } : i
        ) ?? [],
      }));
      setEditingItem(null);
      setEditForm({});
      toast.success("Check point updated.");
    } catch {
      toast.error("Failed to update check point.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-teal-100 p-2 rounded-lg">
          <FaShieldAlt className="text-teal-600 text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">QA Templates</h1>
          <p className="text-sm text-gray-500">Manage QC checklist templates and check-points</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
          <FaShieldAlt className="text-4xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No QA templates found.</p>
          <p className="text-sm text-gray-400 mt-1">
            Create templates from the QC Templates management panel.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => {
            const isExpanded = expandedTemplateId === template.id;
            const items = checklistItems[template.id] ?? [];

            return (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Template header row */}
                <button
                  type="button"
                  onClick={() => handleExpandTemplate(template.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <FaChevronDown className="text-gray-400" size={13} />
                    ) : (
                      <FaChevronRight className="text-gray-400" size={13} />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{template.templateName}</p>
                      {template.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isExpanded && (
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                        {items.length} check-points
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      ID: {template.id}
                    </span>
                  </div>
                </button>

                {/* Checklist items */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {loadingChecklist === template.id ? (
                      <div className="flex justify-center py-6">
                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        {items.length > 0 ? (
                          <table className="min-w-full">
                            <thead className="bg-gray-50">
                              <tr className="border-b border-gray-100">
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Check Point</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase w-20">Required</th>
                                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase w-24">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items
                                .sort((a, b) => a.sequence - b.sequence)
                                .map((item) => (
                                  <tr
                                    key={item.id}
                                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                                  >
                                    <td className="px-4 py-2.5 text-sm text-gray-500">
                                      {item.sequence}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      {editingItem?.id === item.id ? (
                                        <input
                                          type="text"
                                          value={editForm.checkPoint ?? item.checkPoint}
                                          onChange={(e) =>
                                            setEditForm((p) => ({
                                              ...p,
                                              checkPoint: e.target.value,
                                            }))
                                          }
                                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        />
                                      ) : (
                                        <span className="text-sm font-medium text-gray-800">
                                          {item.checkPoint}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      {editingItem?.id === item.id ? (
                                        <input
                                          type="text"
                                          value={editForm.description ?? item.description ?? ""}
                                          onChange={(e) =>
                                            setEditForm((p) => ({
                                              ...p,
                                              description: e.target.value,
                                            }))
                                          }
                                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        />
                                      ) : (
                                        <span className="text-sm text-gray-500">
                                          {item.description ?? "—"}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                      {item.isRequired ? (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                          Required
                                        </span>
                                      ) : (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                          Optional
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <div className="flex justify-end gap-1">
                                        {editingItem?.id === item.id ? (
                                          <>
                                            <button
                                              onClick={() => handleSaveEdit(template.id)}
                                              disabled={saving}
                                              className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-50 rounded transition"
                                              title="Save"
                                            >
                                              <FaSave size={13} />
                                            </button>
                                            <button
                                              onClick={() => {
                                                setEditingItem(null);
                                                setEditForm({});
                                              }}
                                              className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded transition"
                                              title="Cancel"
                                            >
                                              <FaTimes size={13} />
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => {
                                                setEditingItem(item);
                                                setEditForm({
                                                  checkPoint: item.checkPoint,
                                                  description: item.description,
                                                  isRequired: item.isRequired,
                                                  sequence: item.sequence,
                                                });
                                              }}
                                              className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded transition"
                                              title="Edit"
                                            >
                                              <FaEdit size={13} />
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteItem(template.id, item.id)
                                              }
                                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition"
                                              title="Delete"
                                            >
                                              <FaTrash size={13} />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="py-8 text-center text-sm text-gray-400">
                            No check-points yet. Add the first one below.
                          </div>
                        )}

                        {/* Add New Check Point */}
                        {addingToTemplate === template.id ? (
                          <div className="p-4 bg-teal-50 border-t border-teal-100">
                            <p className="text-xs font-semibold text-teal-700 mb-3 uppercase">
                              New Check Point
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  placeholder="Check point description *"
                                  value={newItemForm.checkPoint}
                                  onChange={(e) =>
                                    setNewItemForm((p) => ({
                                      ...p,
                                      checkPoint: e.target.value,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="Description (optional)"
                                  value={newItemForm.description}
                                  onChange={(e) =>
                                    setNewItemForm((p) => ({
                                      ...p,
                                      description: e.target.value,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  placeholder="Seq"
                                  min={1}
                                  value={newItemForm.sequence}
                                  onChange={(e) =>
                                    setNewItemForm((p) => ({
                                      ...p,
                                      sequence: Number(e.target.value),
                                    }))
                                  }
                                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={newItemForm.isRequired}
                                    onChange={(e) =>
                                      setNewItemForm((p) => ({
                                        ...p,
                                        isRequired: e.target.checked,
                                      }))
                                    }
                                    className="accent-teal-600"
                                  />
                                  Required
                                </label>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleAddItem(template.id)}
                                disabled={saving}
                                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition"
                              >
                                {saving ? "Adding..." : "Add Check Point"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingToTemplate(null);
                                  setNewItemForm(emptyForm());
                                }}
                                className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => {
                                setAddingToTemplate(template.id);
                                setNewItemForm({
                                  ...emptyForm(),
                                  sequence: items.length + 1,
                                });
                              }}
                              className="flex items-center gap-2 text-teal-600 hover:text-teal-800 text-sm font-medium hover:bg-teal-50 px-3 py-1.5 rounded-lg transition"
                            >
                              <FaPlus size={11} /> Add Check Point
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QaTemplateListPage;
