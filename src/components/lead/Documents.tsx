import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit, MdUploadFile } from "react-icons/md";
import { BsGrid, BsTable } from "react-icons/bs";
import { formatDate } from "./FormateDate";
import Button from "../common/Buttons";
import PopUp from "../common/PopUp";
import axios from "axios";
import ConfirmBox from "../common/ConfirmBox";
import DynamicTable from "../common/DynamicTable";
import Attachments from "../forms/DocumentForm";
import { FaEye } from "react-icons/fa";

const LeadAttachements: React.FC<{ stageItemId: string; stage: string }> = ({
  stageItemId,
  stage,
}) => {
  const [lead_Attachemnets, setLeadAttachements] = useState<any[]>([]);
  const [columns, setColumns] = useState({
    tableHeading: [
      {
        fieldName: "Title",
        id: "title",
      },
      {
        fieldName: "File Url",
        id: "fileUrl",
      },
      {
        fieldName: "File Type",
        id: "fileType",
      },
      {
        fieldName: "File Name",
        id: "fileName",
      },
      {
        fieldName: "Description",
        id: "description",
      },
      {
        fieldName: "Actions",
        id: "actions",
      },
    ],
    manageColumn: {
      title: true,
      iconUrl: true,
      fileUrl: true,
      fileType: true,
      fileName: true,
      descriptionatus: true,
      actions: true,
    },
  });

  const [isModelOpen, setISModelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [totalCount, setTotalCount] = useState();
  const [perPage, setPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("date_created asc");
  const [heading, setHeading] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [view, setView] = useState<"card" | "table">(
    isMobile ? "card" : "table"
  );
  const [tooltip, setTooltip] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");

  const openModel = (id: string | number) => {
    setSelectedItem(id);
    setISModelOpen(true);
  };

  const closeModel = () => {
    setISModelOpen(false);
    setSelectedItem(null);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/SalesDocument/stage/${stage}/${stageItemId}`
      );
      const fetchedRows = response.data || [];
      setLeadAttachements(fetchedRows);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleEdit = (row: any) => {
    setHeading("Edit Document Details");
    const content = (
      <Attachments
        setModal={setModal}
        editData={row}
        documentId={row.id}
        onAddSuccess={fetchDocuments}
        isEditMode={true}
        stageItemId={stageItemId}
        stage={stage}
      />
    );
    handleModal(content);
  };

  const handleModal = (content: React.ReactNode) => {
    setModal((prev) => !prev);
    setContent(content);
  };

  const handleDelete = async (id: string | number) => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/SalesDocument/${id}`
      );
      setISModelOpen(false);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }

    fetchDocuments();
  };

  const handlePreview = (fileUrl: string, fileType: string) => {
    setPreviewUrl(fileUrl);
    console.log("File URL:", fileUrl);
    setPreviewType(fileType.toLowerCase());
    setShowPreview(true);
    handleModal(
      <div className="max-w-4xl w-full mx-auto">
        {["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(
          fileType.toLowerCase()
        ) ? (
          <img src={fileUrl} alt="Preview" className="w-full h-auto" />
        ) : fileType.includes("pdf") ? (
          <iframe src={fileUrl} className="w-full h-[80vh]" />
        ) : (
          <div className="text-center py-8">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600"
            >
              Open file in new tab
            </a>
          </div>
        )}
      </div>
    );
  };

  const actions = [
    {
      label: <MdEdit />,
      onClick: (row: any) => {
        handleEdit(row);
      },
      type: "edit",
    },
    {
      label: <MdDelete title="Delete" />,
      onClick: (row: any) => {
        openModel(row.id);
      },
      type: "delete",
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setView(isMobile ? "card" : "table");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  const showTooltip = (text: string) => setTooltip(text);
  const hideTooltip = () => setTooltip("");

  const handleSort = (fieldName: string, direction: "asc" | "desc") => {
    const orderByString = `${fieldName} ${direction}`;
    setOrderBy(orderByString);
  };

  const toggleColumn = (column: string) => {
    setColumns((prevColumns) => {
      const key = column as keyof typeof prevColumns.manageColumn;
      return {
        ...prevColumns,
        manageColumn: {
          ...prevColumns.manageColumn,
          [key]: !prevColumns.manageColumn[key],
        },
      };
    });
  };

  const toggleLeadSelection = (id: string) => {
    setLeadAttachements((prevLeads: any) =>
      prevLeads.map((lead: any) =>
        lead.demoId === id ? { ...lead, isSelected: !lead?.isSelected } : lead
      )
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MdUploadFile className="text-orange-500" />
            Documents
          </h2>
          <div className="flex items-center gap-3">
            {/* View Toggle Buttons */}

            {/* Add Document Button */}
            <Button
              label={
                <div className="flex items-center gap-2">
                  <MdUploadFile />
                  <span>Add Document</span>
                </div>
              }
              type="primary"
              onClick={() => {
                setHeading("Add Document");
                handleModal(
                  <Attachments
                    setModal={setModal}
                    attachmentData={lead_Attachemnets}
                    setAttachmentData={setLeadAttachements}
                    onAddSuccess={fetchDocuments}
                    stage={stage}
                    stageItemId={stageItemId}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : view === "table" ? (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <DynamicTable
              leads={lead_Attachemnets.map((lead) => ({
                ...lead,
                id: lead.id.toString(),
              }))}
              columns={columns}
              toggleLeadSelection={(id) => toggleLeadSelection(id)}
              toggleColumn={toggleColumn}
              totalCount={lead_Attachemnets.length}
              navigateTo="sales/leads"
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              perPage={perPage}
              setPerPage={setPerPage}
              loading={loading}
              actions={actions}
              onSort={handleSort}
              hideFields={true}
              listType="Documents"
              tableType="form"
              checkbox={false}
              isFileTable={true}
              onFileClick={(fileUrl, fileType) => {
                handlePreview(fileUrl, fileType);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lead_Attachemnets.map((data, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
                onClick={() => handlePreview(data.fileUrl, data.fileType)}
              >
                {/* Document Preview */}
                <div className="h-32 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                  <MdUploadFile size={48} className="text-orange-400" />
                </div>

                {/* Document Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 truncate flex-1">
                      {data.file}
                    </h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(data)}
                        className="p-1 text-gray-500 hover:text-orange-500 rounded-full hover:bg-orange-50"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => openModel(data.UUID)}
                        className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 line-clamp-2">
                      {data.description}
                    </p>
                    <div className="flex justify-between items-center text-gray-500">
                      <span>{data.created_by}</span>
                      <span>{formatDate(data.created_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog and Modal */}
      <ConfirmBox
        isOpen={isModelOpen}
        onClose={closeModel}
        onDelete={() => handleDelete(selectedItem)}
        title="Document"
        id={selectedItem}
      />

      <PopUp
        content={content}
        isModalOpen={modal}
        heading={heading}
        setModal={setModal}
      />
    </div>
  );
};

export default LeadAttachements;
