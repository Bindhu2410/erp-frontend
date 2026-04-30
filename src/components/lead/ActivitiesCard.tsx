import React, { useEffect, useState } from "react";

import { MdDelete, MdEdit, MdPersonAddAlt1 } from "react-icons/md";
import PopUp from "../common/PopUp";
import SearchOptions from "../common/SearchOption";
import Button from "../common/Buttons";

import axios from "axios";
import ConfirmBox from "../common/ConfirmBox";
// import TaskForm from "app/src/modules/shared/components/form/TaskForm";
import DynamicTable from "../common/DynamicTable";
import { IoIosAddCircleOutline } from "react-icons/io";
import TaskForm from "../forms/TaskForm";
import Modal from "../common/Modal";
import api from "../../services/api";

const ActivitiesCard: React.FC<{
  stage?: string;
  stageItemId?: string;
  onLengthChange?: (length: number) => void;
}> = ({ stage, stageItemId, onLengthChange }) => {
  const [model, setModel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [task_Data, setTaskData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(task_Data);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [columns, setColumns] = useState({
    tableHeading: [
      { fieldName: "Task Name", id: "taskName" },
      { fieldName: "Due Date", id: "dueDate" },
      { fieldName: "Priority", id: "priority" },
      { fieldName: "Status", id: "status" },
      { fieldName: "Assigned To", id: "assignedTo" },
      { fieldName: "Comments", id: "comments" },
    ],
    manageColumn: {
      taskName: true,
      dueDate: true,
      priority: true,
      status: true,
      assignedTo: true,
      comments: true,
    },
  });

  const task_Fields = [];
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
      onClick: (row: any) => {
        openModel(row.id);
      },
      type: "delete",
    },
    // {
    //   label: <BsCheckSquare className="bg-green-500 text-white" />,
    //   onClick: (row: any) => {
    //     editValues.set(row);
    //     setSelectedLabel("Completed By");
    //     setModel(!model);
    //   },
    //   type: "popup",
    // },
    // {
    //   label: <MdCancel className="text-red-500 text-xl" />,
    //   onClick: () => {
    //     setModel(!model);
    //   },
    //   type: "popup",
    // },
    // {
    //   label: <MdPersonAddAlt1 />,

    //   onClick: (row: any) => {
    //     setSelectedLabel("Delegated By");
    //     setModel(!model);
    //     editValues.set(row);
    //   },
    //   type: "popup",
    // },
    // {
    //   label: <FaUserCheck />,
    //   onClick: (row: any) => {
    //     setSelectedLabel("Approved By");
    //     setModel(!model);
    //     editValues.set(row);
    //   },
    //   type: "popup",
    // },
  ];

  const [modal, setModal] = useState(false);

  const [content, setContent] = useState<React.ReactNode>(null);
  const [isModelOpen, setISModelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [totalCount, setTotalCount] = useState();
  const [perPage, setPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("date_created asc");
  const handleSort = (fieldName: string, direction: "asc" | "desc") => {
    const orderByString = `${fieldName} ${direction}`;
    console.log(orderByString, "orderByString");
    setOrderBy(orderByString); // Update sorting state
    // fetchProduct(); // Refetch leads with new sorting
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
    filteredData && onLengthChange && onLengthChange(totalCount || 0);
  }, [filteredData]);

  const [editId, setEditId] = useState<string | undefined>(undefined);

  const handleEdit = (row: any) => {
    setEditId(String(row.id));
    setModal(true);
  };
  const handleModal = (content: React.ReactNode) => {
    setEditId(undefined);
    setModal((prev) => !prev);
    setContent(content);
  };
  const openModel = (id: string | number) => {
    setSelectedItem(id);
    setISModelOpen(true);
  };
  const closeModel = () => {
    setISModelOpen(false);
    setSelectedItem(null);
  };
  const handleDelete = async (id: string | number) => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await axios.get(
        `http://localhost:5104/api/SalesActivityTask/${id}`
      );

      console.log(response.data, "api response");
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
    setISModelOpen((prev) => !prev);
    fetchTasks();
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [view, setView] = useState<"card" | "table" | "calendar">(
    isMobile ? "card" : "table"
  );
  const [tooltip, setTooltip] = useState("");
  const hideTooltip = () => setTooltip("");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setView(mobile ? "card" : "table");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });
  useEffect(() => {
    return () => {
      // Cleanup function: Delete leadId from localStorage when the component unmounts
      localStorage.removeItem("leadId");
      console.log("leadId deleted from localStorage");
    };
  }, []);
  const [loading, setLoading] = useState(false);
  const [presenters, setPresenters] = useState<Record<number, string>>({});

  useEffect(() => {
    api.get("PresenterDropdown/presenterDropdown").then((res) => {
      const map: Record<number, string> = {};
      (res.data || []).forEach((p: any) => { map[p.id] = p.username; });
      setPresenters(map);
    }).catch(() => {});
  }, []);

  const fetchTasks = async () => {
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await axios.get(
        `http://localhost:5104/api/SalesActivityTask/stage/${stage}/${stageItemId}`
      );
      setTaskData(response.data);
      onLengthChange && onLengthChange(response.data.length || 0);
      setTotalCount(response.data.data?.TotalCount);
    } catch (error) {
      console.error("Error fetching lead view:", error);
    }
  };

  useEffect(() => {
    console.log(task_Data, "Updated task response");
    if (task_Data) {
      setFilteredData(task_Data); // Initialize filteredData with task_Data
    }
  }, [task_Data]);
  useEffect(() => {
    stageItemId && fetchTasks();
  }, [stageItemId]);
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options);
  }
  const getColor = (status: string) => {
    switch (status) {
      case "Completed":
        return { bgColor: "bg-green-400", borderColor: "border-green-400" };
      case "InProgress":
        return { bgColor: "bg-yellow-400", borderColor: "border-yellow-400" };
      case "Expired":
        return { bgColor: "bg-red-400", borderColor: "border-red-400" };
      case "Not Started":
        return { bgColor: "bg-gray-400", borderColor: "border-gray-400" };
      default:
        return { bgColor: "bg-orange-600", borderColor: "border-orange-600" };
    }
  };
  const ITEMS_PER_PAGE = 3;
  // const { currentPage, totalPages, handlePageChange } = usePagination({
  //   itemsPerPage: ITEMS_PER_PAGE,
  //   totalItems: filteredData.length,
  // });

  const currentTaskData =
    filteredData &&
    filteredData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  useEffect(() => {
    if (task_Data.length > 0) {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filter = task_Data.filter((data) =>
        Object.values(data).some((value) =>
          String(value).toLowerCase().includes(lowercasedTerm)
        )
      );
      setFilteredData(filter);
    }
  }, [searchTerm, task_Data]);

  useEffect(() => {
    console.log(task_Data, "task:::");
  });

  return (
    <div className="">
      <ConfirmBox
        isOpen={isModelOpen}
        onClose={closeModel}
        onDelete={() => handleDelete(selectedItem)}
        title="Address"
        id={selectedItem}
      />
      <div
        className={`lg:flex md:flex hidden ${
          !task_Data || task_Data.length == 0
            ? "justify-end"
            : "justify-between"
        }  mt-2
         `}
      >
        {task_Data && task_Data.length > 0 && (
          <SearchOptions handleSearch={setSearchTerm} />
        )}

        <div className="justify-end flex">
          <Button
            label={[
              <IoIosAddCircleOutline
                key="icon"
                className="mr-1"
                size={18}
                title="Add Tasks"
              />,
              " Add",
            ]}
            type="primary"
            onClick={() =>
              handleModal(
                <TaskForm
                  onSuccess={fetchTasks}
                  stage={stage}
                  stageItemId={stageItemId}
                  onClose={() => setModal(false)}
                />
              )
            }
          />
        </div>
      </div>
      <div className=" lg:hidden md:hidden block mt-2">
        <SearchOptions handleSearch={setSearchTerm} />

        <div
          className={`flex   relative gap-2 mt-2 mx-2 ${
            !filteredData || filteredData.length > 0
              ? "justify-between"
              : "justify-end"
          }`}
        >
          <Button
            label="Add"
            type="primary"
            onClick={() =>
              handleModal(
                "Task"
                // <TaskForm setModal={setModal} onAddSuccess={fetchTasks} />
              )
            }
          />
        </div>
      </div>

      <div className="mt-4">
        {view === "table" && (
          <>
            <DynamicTable
              leads={filteredData.map((lead) => ({
                ...lead,
                id: lead.id,
                assignedTo: presenters[lead.assignedtouserid] || lead.assignedTo || "",
                dueDate: lead.dueDate ? new Date(lead.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
              }))}
              columns={columns}
              toggleColumn={toggleColumn}
              totalCount={totalCount}
              navigateTo="sales/leads"
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              perPage={perPage}
              setPerPage={setPerPage}
              loading={loading}
              onSort={handleSort}
              listType="Tasks"
              hideFields={true}
              actions={actions}
              tableType="form"
              checkbox={false}
            />
          </>
        )}
        {view == "card" && (
          <>
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 relative place-items-center ">
              {filteredData &&
                filteredData.map((data, index) => (
                  <div
                    key={index}
                    className={`max-w-sm p-2 bg-white border-l-4 ${
                      getColor(data.status).borderColor
                    } rounded-lg shadow dark:bg-gray-800 dark:border-gray-700`}
                  >
                    <div className="flex flex-shrink-0 justify-between mb-2 relative">
                      <h5 className="font-extrabold text-sm break-words max-w-[calc(100%-4rem)]">
                        {data.task_name}
                      </h5>

                      <div className="flex items-center  absolute top-0 right-0 ">
                        <p
                          className={`text-sm ${
                            getColor(data.status).bgColor
                          } p-1 flex justify-center items-center h-6 rounded-full text-center text-white`}
                        >
                          {data.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row justify-between">
                      <span className="text-black-2 mb-1 font-medium text-sm">
                        Task Type :
                      </span>
                      <h6 className=" text-sm text-gray-600">
                        {data.task_type}
                      </h6>
                    </div>
                    <p className="text-gray-600 text-md mb-1 flex justify-between">
                      <span className="text-black-2 font-medium text-sm">
                        Assigned To :
                      </span>
                      <div className="flex">
                        <span className="w-6 h-6 rounded-full mr-2">
                          <img src="" alt="John Doe" />
                        </span>
                        {data.assigned_to}
                      </div>
                    </p>
                    <p className="text-gray-600 text-md mb-1 flex justify-between">
                      <span className="text-black-2  font-medium text-sm">
                        Due Date:
                      </span>

                      {formatDate(data.due_date)}
                    </p>

                    <p className="text-gray-600 mb-2 text-sm mt-3">
                      <span className="text-black-2 font-medium text-sm mr-1 break-word">
                        Return comments :
                      </span>
                      {data.comments}
                    </p>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => { setModal(false); setEditId(undefined); }}>
        <TaskForm
          id={editId}
          stage={stage}
          stageItemId={stageItemId}
          onClose={() => { setModal(false); setEditId(undefined); }}
          onSuccess={fetchTasks}
        />
      </Modal>
    </div>
  );
};

export default ActivitiesCard;
