import React, { useEffect, useState } from "react";
import { MdCancel, MdDelete, MdEdit, MdPersonAddAlt1 } from "react-icons/md";
import UserOne from "../../../cra-sales-template/images/user/user-01.png";
import PopUp from "../common/PopUp";
import SearchOptions from "../common/SearchOption";
import Button from "../common/Buttons";
import axios from "axios";
import DynamicTable from "../common/DynamicTable";
import { IoIosAddCircleOutline } from "react-icons/io";
import ConfirmBox from "../common/ConfirmBox";
import CallForm from "../forms/CallForm";
import Modal from "../common/Modal";
import { formatDate } from "./FormateDate";
import api from "../../services/api";

const CallActivities: React.FC<{
  stageItemId?: string;
  stage?: string;
  onLengthChange?: (length: number) => void;
}> = ({ stageItemId, stage, onLengthChange }) => {
  const [model, setModel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [view, setView] = useState<"card" | "table" | "calendar">(
    isMobile ? "card" : "table"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setView(isMobile ? "card" : "table");
    };
    window.addEventListener("Resize", handleResize);
    return () => window.addEventListener("Resize", handleResize);
  });
  const [call_data, setCallData] = useState<any[]>([]);

  const call_fields = [
    { fieldName: "Status", id: "status" },
    { fieldName: "Priority", id: "priority" },
    { fieldName: "Participants", id: "participants" },
    { fieldName: "Outcome", id: "outcome" },
    { fieldName: " FileUrl", id: "fileUrl" },
    { fieldName: "Call Description", id: "description" },
    { fieldName: "Call Type", id: "type" },
    { fieldName: " Call Title", id: "callTitle" },
    { fieldName: "Call Result", id: "callResult" },
    { fieldName: "Call Date", id: "callDateTime" },
    { fieldName: "Call Duration", id: "duration" },
    { fieldName: "Call Mode", id: "callMode" },
    { fieldName: "Call Agenda", id: "callAgenda" },
  ];
  const [selectedLabel, setSelectedLabel] = useState("");
  const actions = [
    {
      label: <MdEdit />,
      onClick: (row: any) => {
        handleEdit(row);
        console.log(row);
      },
      type: "edit",
    },
    {
      label: <MdDelete />,
      onClick: (row: any) => handleDelete(row.id),
      type: "delete",
    },
  ];
  const [modal, setModal] = useState(false);
  const [MCFieldData, SetMCFields] = useState<any[]>(call_fields);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [columns, setColumns] = useState({
    tableHeading: [
      { fieldName: "Call Title", id: "callTitle" },
      { fieldName: "Call Type", id: "callType" },
      { fieldName: "Call Date", id: "callDateTime" },
      { fieldName: "Duration", id: "duration" },
      { fieldName: "Priority", id: "priority" },
      { fieldName: "Status", id: "status" },
      { fieldName: "Assigned To", id: "assignedTo" },
      { fieldName: "Outcome", id: "outcome" },
      { fieldName: "Call Agenda", id: "callAgenda" },
    ],
    manageColumn: {
      callTitle: true,
      callType: true,
      callDateTime: true,
      duration: true,
      priority: true,
      status: true,
      assignedTo: true,
      outcome: true,
      callAgenda: true,
    },
  });
  const [totalCount, setTotalCount] = useState();
  const [perPage, setPerPage] = useState(5);
  const [edit, isEdit] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string>();
  const [orderBy, setOrderBy] = useState("date_created asc");
  const handleSort = (fieldName: string, direction: "asc" | "desc") => {
    const orderByString = `${fieldName} ${direction}`;
    console.log(orderByString, "orderByString");
    setOrderBy(orderByString);
  };
  const [currentPage, setCurrentPage] = useState(1);
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
    setFilteredData((prevLeads) =>
      prevLeads.map((lead) =>
        lead.demoId === id ? { ...lead, isSelected: !lead?.isSelected } : lead
      )
    );
  };

  useEffect(() => {
    onLengthChange && onLengthChange(call_data.length);
  }, [call_data]);
  const handleEdit = (row: any) => {
    console.log(row);
    isEdit(true);
    setSelectedRows(row.id);
    const content = (
      <CallForm
        id={row.id}
        stage={stage}
        stageItemId={stageItemId}
        onSuccess={fetchCalls}
        onClose={() => setModal(false)}
      />
    );
    handleModal(content);
  };
  const handleModal = (content: React.ReactNode) => {
    setModal((prev) => !prev);
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const handleDelete = async (id: string | number) => {
    console.log();
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:5104/api/SalesActivityCall/${deleteId}`
      );
      await fetchCalls();
    } catch (error) {
      console.error("Error deleting call:", error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const ITEMS_PER_PAGE = 2;

  const currentcallData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const [loading, setLoading] = useState(false);
  const [presenters, setPresenters] = useState<Record<number, string>>({});

  useEffect(() => {
    api.get("PresenterDropdown/presenterDropdown").then((res) => {
      const map: Record<number, string> = {};
      (res.data || []).forEach((p: any) => { map[p.id] = p.username; });
      setPresenters(map);
    }).catch(() => {});
  }, []);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5104/api/SalesActivityCall/stage/${stage}/${stageItemId}`
      );

      const formattedData = (response.data || []).map((item: any) => ({
        ...item,
        participants: Array.isArray(item.participants)
          ? item.participants.join(", ")
          : String(item.participants || ""),
        callDateTime: new Date(item.callDateTime).toLocaleString(),
        duration: String(item.duration || ""),
        comments: String(item.comments || ""),
        groupWith: Array.isArray(item.groupWith)
          ? item.groupWith.join(", ")
          : String(item.groupWith || ""),
      }));

      setCallData(formattedData);
      setTotalCount(formattedData.length);
    } catch (error) {
      console.error("Error fetching calls:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log(call_data, "Updated call response");
  }, [call_data]);
  useEffect(() => {
    fetchCalls();
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filter = call_data.filter((data) =>
      Object.values(data).some((value) =>
        String(value).toLowerCase().includes(lowercasedTerm)
      )
    );
    setFilteredData(filter);
  }, [searchTerm, call_data]);
  const [tooltip, setTooltip] = useState("");
  const showTooltip = (text: string) => setTooltip(text);
  const hideTooltip = () => setTooltip("");
  return (
    <div>
      <div
        className={`flex  mt-2 flex-wrap ${
          currentcallData.length > 0 ? "justify-between" : "justify-end"
        }`}
      >
        {currentcallData.length > 0 && (
          <SearchOptions handleSearch={setSearchTerm} />
        )}
        <div className={`flex  gap-2 mt-2 mx-2 justify-end`}>
          <Button
            label={[
              <IoIosAddCircleOutline
                key="icon"
                className="mr-1"
                size={18}
                title="Add Calls"
              />,
              " Add",
            ]}
            type="primary"
            onClick={() => {
              handleModal(
                <CallForm
                  stage={stage}
                  stageItemId={stageItemId}
                  onSuccess={fetchCalls}
                  onClose={() => setModal(false)}
                />
              );
              setSelectedRows(undefined);
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        {view === "table" && (
          <DynamicTable
            leads={filteredData.map((lead) => ({
              id: lead.id,
              callTitle: String(lead.callTitle || ""),
              callType: String(lead.callType || ""),
              callDateTime: lead.callDateTime ? new Date(lead.callDateTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
              duration: String(lead.duration || ""),
              priority: String(lead.priority || ""),
              status: String(lead.status || ""),
              assignedTo: presenters[lead.assignedtouserid] || lead.assignedTo || "",
              outcome: String(lead.outcome || ""),
              callAgenda: String(lead.callAgenda || ""),
            }))}
            columns={columns}
            toggleLeadSelection={toggleLeadSelection}
            toggleColumn={toggleColumn}
            totalCount={totalCount}
            navigateTo="sales/leads"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            perPage={perPage}
            setPerPage={setPerPage}
            loading={loading}
            onSort={handleSort}
            listType="Call"
            hideFields={true}
            actions={actions}
            checkbox={false}
          />
        )}
        {view == "card" && (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 shadow gap-4">
            {currentcallData.map((data, index) => (
              <div
                key={index}
                className="max-w-sm card border shadow rounded p-2"
              >
                <h1 className="font-extrabold text-sm mb-2">{data.name}</h1>
                <p className="flex justify-between">
                  <span className="text-black-2 mb-1 font-medium text-sm">
                    Call Type :
                  </span>
                  <span className="text-sm text-gray-600"> {data.type}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-black-2 mb-1 font-medium text-sm">
                    Caller :
                  </span>
                  <span className="text-sm text-gray-600 flex justify-center items-center">
                    <div className="w-5 h-5">
                      <img src="" alt="User" />
                    </div>
                    {data.caller}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-black-2 mb-1 font-medium text-sm">
                    Receiver :
                  </span>
                  <span className="text-sm text-gray-600 flex justify-center items-center">
                    <div className="w-5 h-5">
                      <img src="" alt="User" />
                    </div>
                    {data.receiver}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-black-2 mb-1 font-medium text-sm">
                    Date :
                  </span>
                  <span className="text-sm text-gray-600">
                    {" "}
                    {formatDate(data.date)}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-black-2 mb-1 font-medium text-sm">
                    Duration:
                  </span>
                  <span className="text-sm text-gray-600">{data.duration}</span>
                </p>
                <p className="w-full">
                  <span className="text-black-2 font-medium text-sm">
                    Comments :
                  </span>
                  <span className="text-sm text-gray-600"> {data.notes}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)}>
        <CallForm
          stage={stage}
          stageItemId={stageItemId}
          id={edit ? selectedRows : ""}
          onClose={() => setModal(false)}
          onSuccess={() => {
            fetchCalls();
            setModal(false);
          }}
        />
      </Modal>

      <ConfirmBox
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onDelete={() => confirmDelete()}
        title="Delete Call"
        id={deleteId ?? ""}
      />
    </div>
  );
};

export default CallActivities;
