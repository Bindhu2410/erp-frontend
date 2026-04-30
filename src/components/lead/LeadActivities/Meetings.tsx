import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import SearchOptions from "../../common/SearchOption";

import Button from "../../common/Buttons";
import PopUp from "../../common/PopUp";
import axios from "axios";
// import MeetingForm from "app/src/modules/shared/components/form/MeetingForm";
import DynamicTable from "../../common/DynamicTable";
import { IoIosAddCircleOutline } from "react-icons/io";
import ConfirmBox from "../../common/ConfirmBox";
import MeetingForm from "../../forms/MeetingForm";
import Modal from "../../common/Modal";
import api from "../../../services/api";

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}
const Meetings: React.FC<{
  stageItemId?: string;
  stage?: string;
  onLengthChange?: (length: number) => void;
}> = ({ stageItemId, stage, onLengthChange }) => {
  const [meetings, setMeetings] = useState<any[]>([]);

  // const [model, setModel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(meetings);

  const [modal, setModal] = useState(false);

  const [content, setContent] = useState<React.ReactNode>(null);

  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | number | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const openModel = (id: string | number) => {
    setSelectedItem(id);
    setIsConfirmOpen(true);
  };

  const closeModel = () => {
    setIsConfirmOpen(false);
    setSelectedItem(null);
  };

  const handleEdit = (row: any) => {
    console.log(row.id, "sss");
    // const content = (
    //   <MeetingForm id={row.id} stage={stage} stageItemId={stageItemId} />
    // );
    setIsModelOpen(true);
    setSelectedItem(row.id);
    handleModal(content);
  };
  const handleModal = (content: React.ReactNode) => {
    setModal((prev) => !prev);
    setContent(content);
  };

  const handleDelete = async (id: string | number) => {
    console.log(id, "meetingId");
    const accessToken = localStorage.getItem("access_token");
    setLoading(true);
    try {
      const response = await axios.delete(
        `http://localhost:5104/api/SalesActivityMeeting/${id}`
      );

      console.log(response.data, "api response");
      setMeetings(response.data || []);
      setFilteredData(response.data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }

    fetchMeeting();
  };
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
  const [columns, setColumns] = useState({
    tableHeading: [
      { fieldName: "Meeting Title", id: "meetingTitle" },
      { fieldName: "Customer Name", id: "customerName" },
      { fieldName: "Meeting Type", id: "meetingType" },
      { fieldName: "Meeting Date", id: "meetingDateTime" },
      { fieldName: "Meeting Time", id: "meetingTime" },
      { fieldName: "Duration", id: "duration" },
      { fieldName: "Status", id: "status" },
      { fieldName: "Delegate", id: "delegate" },
      { fieldName: "Assigned To", id: "assignedTo" },
      { fieldName: "Address", id: "address" },
    ],
    manageColumn: {
      meetingTitle: true,
      customerName: true,
      meetingType: true,
      meetingDateTime: true,
      meetingTime: true,
      duration: true,
      status: true,
      delegate: true,
      assignedTo: true,
      address: true,
    },
  });
  const [totalCount, setTotalCount] = useState();
  const [perPage, setPerPage] = useState(5);
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

  const fetchMeeting = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await axios.get(
        `http://localhost:5104/api/SalesActivityMeeting/stage/${stage}/${stageItemId}`
      );

      const formattedData = (response.data || []).map((item: any) => ({
        ...item,
        meetingDateTime: new Date(item.meetingDateTime).toLocaleString(),
        participant: Array.isArray(item.participant)
          ? item.participant.join(", ")
          : String(item.participant || ""),
        groupWith: Array.isArray(item.groupWith)
          ? item.groupWith.join(", ")
          : String(item.groupWith || ""),
        duration: String(item.duration || ""),
        comments: String(item.comments || ""),
        delegate: String(item.delegate || ""),
      }));

      setMeetings(formattedData);
      setTotalCount(formattedData.length);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, []);
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filter = meetings.filter((data) =>
      Object.values(data).some((value) =>
        String(value).toLowerCase().includes(lowercasedTerm)
      )
    );
    setFilteredData(filter);
  }, [searchTerm, meetings]);

  useEffect(() => {
    if (filteredData && onLengthChange) {
      onLengthChange(filteredData.length);
    }
  }, [filteredData]);
  return (
    <div className="">
      <div className={`flex mt-2 ${filteredData.length > 0 ? "justify-between" : "justify-end"}`}>
        {filteredData && filteredData.length > 0 && (
          <SearchOptions handleSearch={setSearchTerm} />
        )}

        <div className="flex justify-end gap-2 mt-2 mx-2">
          <Button
            label={[
              <IoIosAddCircleOutline
                key="icon"
                className="mr-1"
                size={18}
                title="Add Meetings"
              />,
              " Add",
            ]}
            type="primary"
            onClick={() => {
              setSelectedItem(null);
              handleModal(
                <MeetingForm stage={stage} stageItemId={stageItemId} />
              );
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        {view === "table" && (
          <DynamicTable
            leads={filteredData?.map((lead) => ({
              id: lead.id,
              meetingTitle: String(lead.meetingTitle || ""),
              customerName: String(lead.customerName || ""),
              meetingType: String(lead.meetingType || ""),
              meetingDateTime: lead.meetingDateTime ? new Date(lead.meetingDateTime).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
              meetingTime: lead.meetingDateTime ? new Date(lead.meetingDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "",
              duration: String(lead.duration || ""),
              status: String(lead.status || ""),
              delegate: String(lead.delegate || ""),
              assignedTo: presenters[lead.assignedtouserid] || lead.assignedTo || "",
              address: String(lead.address || ""),
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
            listType="Meetings"
            hideFields={true}
            actions={actions}
            checkbox={false}
          />
        )}
        {view == "card" && (
          <div className="grid md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative  ">
            {filteredData.map((data, index) => (
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
                    Meeting Type :
                  </span>
                  <h6 className=" text-sm text-gray-600">{data.meetingType}</h6>
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
                    Date:
                  </span>

                  {formatDate(data.meetingDateTime)}
                </p>

                <p className="text-gray-600 mb-2 text-sm mt-3">
                  <span className="text-black-2 font-medium text-sm mr-1 break-word">
                    Return comments :
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
          <MeetingForm
            id={selectedItem !== null ? String(selectedItem) : ""}
            stage={stage}
            stageItemId={stageItemId}
            onSuccess={fetchMeeting}
            onClose={() => setModal(false)}
          />
        </Modal>
      </div>

      <ConfirmBox
        isOpen={isConfirmOpen}
        onClose={closeModel}
        onDelete={() => {
          if (selectedItem) {
            handleDelete(selectedItem);
          }
          closeModel();
        }}
        title="Meeting"
        id={selectedItem ?? ""}
      />
    </div>
  );
};

export default Meetings;
