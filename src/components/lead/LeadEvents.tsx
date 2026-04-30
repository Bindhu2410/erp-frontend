import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import SearchOptions from "../common/SearchOption";
import Button from "../common/Buttons";
import PopUp from "../common/PopUp";
import axios from "axios";
import DynamicTable from "../common/DynamicTable";
import { IoIosAddCircleOutline } from "react-icons/io";
import ConfirmBox from "../common/ConfirmBox";
import EventForm from "../forms/EventForm";
import Modal from "../common/Modal";
import api from "../../services/api";

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
  };
  return date.toLocaleDateString("en-US", options);
}
const LeadEvents: React.FC<{
  stageItemId?: string;
  stage?: string;
  onLengthChange?: (length: number) => void;
}> = ({ stage, stageItemId, onLengthChange }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(events);
  const [isEdit, setIsEdit] = useState(false);
  const [editid, setEditId] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState();
  const [perPage, setPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("date_created asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState({
    tableHeading: [
      { fieldName: "Event Title", id: "eventTitle" },
      { fieldName: "Start Date", id: "startDate" },
      { fieldName: "End Date", id: "endDate" },
      { fieldName: "Start Time", id: "startTime" },
      { fieldName: "End Time", id: "endTime" },
      { fieldName: "Priority", id: "priority" },
      { fieldName: "Status", id: "status" },
      { fieldName: "Assigned To", id: "assignedTo" },
      { fieldName: "Event Location", id: "eventLocation" },
      { fieldName: "Comments", id: "comments" },
    ],
    manageColumn: {
      eventTitle: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      priority: true,
      status: true,
      assignedTo: true,
      eventLocation: true,
      comments: true,
    },
  });
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
  useEffect(() => {
    if (onLengthChange && filteredData) {
      onLengthChange(events.length);
    }
  }, [filteredData]);
  const toggleLeadSelection = (id: string) => {
    setFilteredData((prevLeads) =>
      prevLeads.map((lead) =>
        lead.demoId === id ? { ...lead, isSelected: !lead?.isSelected } : lead
      )
    );
  };

  const handleEdit = (row: any) => {
    setIsEdit(true);
    setEditId(row.id);
    setModal(true);
  };
  const handleModal = (content: React.ReactNode) => {
    setModal((prev) => !prev);
    setContent(content);
  };

  const handleDelete = async (id: string | number) => {
    console.log(id, "meetingId");
    setLoading(true);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/SalesActivityEvent/${id}`
      );
      console.log(response.data, "api response");
      setEvents(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }

    fetchEvents();
  };

  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | number | null>(
    null
  );

  const openModel = (id: string | number) => {
    setSelectedItem(id);
    setIsModelOpen(true);
  };

  const closeModel = () => {
    setIsModelOpen(false);
    setSelectedItem(null);
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
      label: <MdDelete />,
      onClick: (row: any) => openModel(row.id),
      type: "delete",
    },
  ];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [view, setView] = useState<"card" | "table" | "calendar">(
    isMobile ? "card" : "table"
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setView(isMobile ? "card" : "table");
    };
    window.addEventListener("Resize", handleResize);
    return () => window.addEventListener("Resize", handleResize);
  });

  const ITEMS_PER_PAGE = 2;

  const currentEvents = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const [tooltip, setTooltip] = useState("");
  const showTooltip = (text: string) => setTooltip(text);
  const hideTooltip = () => setTooltip("");
  const [loading, setLoading] = useState(false);
  const [presenters, setPresenters] = useState<Record<number, string>>({});

  useEffect(() => {
    api.get("PresenterDropdown/presenterDropdown").then((res) => {
      const map: Record<number, string> = {};
      (res.data || []).forEach((p: any) => { map[p.id] = p.username; });
      setPresenters(map);
    }).catch(() => {});
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/SalesActivityEvent/stage/${stage}/${stageItemId}`
      );

      console.log(response.data, "Event response");
      setEvents(response.data || []);
      setTotalCount(response.data?.data?.TotalCount);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filter = events.filter((data) =>
      Object.values(data).some((value) =>
        String(value).toLowerCase().includes(lowercasedTerm)
      )
    );
    setFilteredData(filter);
  }, [searchTerm, events]);
  function handleSort(fieldName: string, direction: "desc" | "asc"): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="">
      <div
        className={`flex  mt-2 ${
          currentEvents.length > 0 ? "justify-between" : "justify-end"
        }`}
      >
        {currentEvents && currentEvents.length > 0 && (
          <SearchOptions handleSearch={setSearchTerm} />
        )}

        <div className="flex justify-end gap-2 mt-2 mx-2">
          <Button
            label={[
              <IoIosAddCircleOutline
                key="icon"
                className="mr-1"
                size={18}
                title="Add Events"
              />,
              " Add",
            ]}
            type="primary"
            onClick={() => {
              setIsEdit(false);
              setModal(true);
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        {view === "table" && (
          <>
            <DynamicTable
              leads={filteredData.map((lead) => ({
                id: lead.id,
                eventTitle: String(lead.eventTitle || ""),
                startDate: lead.startDate ? new Date(lead.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
                endDate: lead.endDate ? new Date(lead.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
                startTime: String(lead.startTime || ""),
                endTime: String(lead.endTime || ""),
                priority: String(lead.priority || ""),
                status: String(lead.status || ""),
                assignedTo: presenters[lead.assignedtouserid] || lead.assignedTo || "",
                eventLocation: String(lead.eventLocation || ""),
                comments: String(lead.comments || ""),
              }))}
              columns={columns}
              toggleLeadSelection={(id) => toggleLeadSelection(id)}
              toggleColumn={toggleColumn}
              totalCount={totalCount}
              navigateTo="sales/leads"
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              perPage={perPage}
              setPerPage={setPerPage}
              loading={loading}
              onSort={handleSort}
              listType="Events"
              hideFields={true}
              actions={actions}
              tableType="form"
              checkbox={false}
            />
          </>
        )}
        {view == "card" && (
          <div className="grid md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative  ">
            {currentEvents.map((data, index) => (
              <div
                key={index}
                className={`max-w-sm p-2 bg-white border-l-4 
                   rounded-lg shadow dark:bg-gray-800 dark:border-gray-700`}
              >
                <div className="flex flex-shrink-0 justify-between mb-2 relative">
                  <h5 className="font-extrabold text-sm break-words max-w-[calc(100%-2rem)]">
                    {data.name}
                  </h5>
                </div>
                <div className="flex flex-row justify-between">
                  <span className="text-black-2 mb-1 font-medium text-sm">
                    Event Title :
                  </span>
                  <h6 className=" text-sm text-gray-600">{data.eventTitle}</h6>
                </div>
                <p className="text-gray-600 text-md mb-1 flex justify-between">
                  <span className="text-black-2 font-medium text-sm">
                    Assigned To :
                  </span>
                  <div className="flex">
                    <span className="w-6 h-6 rounded-full mr-2">
                      <img src="" alt="John Doe" />
                    </span>
                    {data.assignedTo}
                  </div>
                </p>
                <p className="text-gray-600 text-md mb-1 flex justify-between">
                  <span className="text-black-2  font-medium text-sm">
                    Start Date:
                  </span>

                  {formatDate(data.startDate)}
                </p>
                <p className="text-gray-600 text-md mb-1 flex justify-between">
                  <span className="text-black-2  font-medium text-sm">
                    End Date:
                  </span>

                  {formatDate(data.endDate)}
                </p>
                <p className="text-gray-600 text-md mb-1 flex justify-between">
                  <span className="text-black-2  font-medium text-sm">
                    Location:
                  </span>

                  {formatDate(data.location)}
                </p>

                <p className="text-gray-600 mb-2 text-sm mt-3">
                  <span className="text-black-2 font-medium text-sm mr-1 break-word">
                    Description :
                  </span>
                  {data.description}
                </p>

                <a href="#">
                  <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"></h5>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-2">
        <Modal isOpen={modal} onClose={() => setModal(false)}>
          <EventForm
            stage={stage}
            stageItemId={stageItemId}
            id={isEdit ? editid ?? undefined : undefined}
            onClose={() => setModal(false)}
            onSuccess={fetchEvents}
          />
        </Modal>
      </div>

      <ConfirmBox
        isOpen={isModelOpen}
        onClose={closeModel}
        onDelete={() => {
          if (selectedItem) {
            handleDelete(selectedItem);
          }
          closeModel();
        }}
        title="Event"
        id={selectedItem ?? ""}
      />
    </div>
  );
};

export default LeadEvents;
