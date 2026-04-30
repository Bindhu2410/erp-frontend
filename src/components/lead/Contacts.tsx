import React, { useEffect, useState } from "react";
import jsonData from "../json/lead.json";

import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import ContactDetailsForm from "../forms/ContactDetailsForm";
import Loader from "../common/Loader";
import SearchOptions from "../common/SearchOption";
import PopUp from "../common/PopUp";
import DynamicTable from "../common/DynamicTable";
import Button from "../common/Buttons";
import { Field, TableHeaders } from "../models/ViewModel";
import LeadContactInfo from "../forms/ContactDetailsForm";
import ConfirmBox from "../common/ConfirmBox";
import LeadForm from "../../pages/lead/LeadForm";

type contactProps = {
  data?: any;
  leadId?: string;
  cusId?: string;
};

const LeadContactEdit: React.FC<contactProps> = ({ data, leadId, cusId }) => {
  console.log(data.contacts, "contacts");
  const [contactData, setContactData] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [contactTable, setContactTable] = useState<TableHeaders[]>([]);
  const [contactDetails, setContactDetails] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>(contactData);
  const [isModelOpen, setISModelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState();
  const [perPage, setPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("date_created asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const contactDetailsSection = jsonData.find(
      (section) => section.title === "Contact Details"
    );

    if (contactDetailsSection) {
      setContactDetails(contactDetailsSection.fields as unknown as Field[]);
      setContactTable(
        contactDetailsSection.tableColumns as unknown as TableHeaders[]
      );
    }
  }, []);

  const fetchContacts = async () => {
    const accessToken = localStorage.getItem("access_token");
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5104/api/SalesContact/lead/${leadId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(response.data, "api response contact");
      setContactData(response.data || []);
      setModal(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const sectionData = [
    {
      id: "contactInfo",
      title: "Contact Information",
      component: (
        <LeadContactInfo
          contactData={contactData}
          setContactData={setContactData}
          sectionData={contactDetails}
          onAddSuccess={fetchContacts}
          setModal={setModal}
          apiCall={true}
          leadId={leadId}
          oppId={cusId}
        />
      ),
      fields: contactTable || [],
    },
  ];
  useEffect(() => {
    setContactData(data.contacts || []);
  }, [data]);

  // const handleEdit = (row: any) => {
  //   console.log(row, "contact.data");
  //   const content = (
  //     <LeadContactInfo
  //       setModal={setModal}
  //       contactData={contactData}
  //       setContactData={setContactData}
  //       editData={row}
  //       isEditMode={true}
  //       onAddSuccess={fetchContacts}
  //       sectionData={contactDetails}
  //       apiCall={true}
  //       leadId={leadId}
  //       oppId={cusId}
  //     />
  //   );
  //   handleModal(content);
  // };

  const handleModal = (content: React.ReactNode) => {
    setModal((prev) => !prev);
    setContent(content);
  };

  const handleDelete = async (id: string | number) => {
    const accessToken = localStorage.getItem("access_token");
    setLoading(true);
    try {
      const response = await axios.delete(
        `http://localhost:5104/api/SalesContact/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setISModelOpen(false);
      setContactData(response.data?.data?.sales_lead_contacts || []);
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModel = (id: string | number) => {
    setSelectedItem(id);
    setISModelOpen(true);
  };

  const closeModel = () => {
    setISModelOpen(false);
    setSelectedItem(null);
  };

  // const actions = [
  //   {
  //     label: <MdEdit />,
  //     onClick: (row: any) => {
  //       handleEdit(row);
  //       console.log(row, "contact.data");
  //     },
  //     type: "edit",
  //   },
  //   {
  //     label: <FaTrash />,
  //     onClick: (row: any) => openModel(row.id),
  //     type: "delete",
  //   },
  // ];

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (contactData.length > 0) {
      const filtered = contactData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowercasedTerm)
        )
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, contactData]);

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
    setContactData(data.contacts || []);
  }, [data]);

  const [columns, setColumns] = useState({
    tableHeading: [
      { fieldName: "Contact Name", id: "contactName" },
      { fieldName: "Job Title", id: "jobTitle" },
      { fieldName: "Dept. Name", id: "departmentName" },
      { fieldName: "Specialist", id: "specialist" },
      { fieldName: "Degree", id: "degree" },
      { fieldName: "Email", id: "email" },
      { fieldName: "Mobile Number", id: "mobileNo" },
      { fieldName: "WhatsApp", id: "whatsApp" },
      { fieldName: "Working Time", id: "workingTime" },
      { fieldName: "Visiting Hours", id: "visitingHours" },
    ],
    manageColumn: {
      contactName: true,
      jobTitle: true,
      departmentName: true,
      specialist: true,
      degree: true,
      email: true,
      mobileNo: true,
      whatsApp: true,
      phoneExt: true,
      phoneNumber: true,
      website: true,
      linkedin: true,
      cityId: true,
      pincode: true,
      workingTime: true,
      visitingHours: true,
    },
  });

  const handleSort = (fieldName: string, direction: "asc" | "desc") => {
    const orderByString = `${fieldName} ${direction}`;
    console.log(orderByString, "orderByString");
    setOrderBy(orderByString); // Update sorting state
    // fetchProduct(); // Refetch leads with new sorting
  };

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white">
          <div>
            <div className="lg:flex hidden md:flex  justify-between gap-2 mt-2 ">
              <SearchOptions handleSearch={setSearchTerm} />
              <div>
                <Button
                  label="Add"
                  type="primary"
                  onClick={() => handleModal(<LeadForm leadData={data} />)}
                />
              </div>
            </div>
            <div className="lg:hidden block md:hidden mt-2 ">
              <SearchOptions handleSearch={setSearchTerm} />
              <div className="flex justify-between gap-2 m-2">
                <Button
                  label="Add"
                  type="primary"
                  onClick={() => handleModal(sectionData[0].component)}
                />
              </div>
            </div>
          </div>

          <div className="m-4">
            <DynamicTable
              leads={contactData.map((lead) => ({
                ...lead,
                id: lead.id,
              }))}
              columns={columns}
              toggleColumn={toggleColumn}
              totalCount={filteredData.length}
              navigateTo="sales/leads"
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              perPage={perPage}
              setPerPage={setPerPage}
              loading={loading}
              onSort={handleSort}
              listType="contacts"
              hideFields={true}
              tableType="form"
              checkbox={false}
            />
          </div>
          <PopUp
            content={content}
            isModalOpen={modal}
            heading={"Contact Edit Detail"}
            setModal={setModal}
          />
          <ConfirmBox
            isOpen={isModelOpen}
            onClose={closeModel}
            onDelete={() => handleDelete(selectedItem)}
            title="Contact"
            id={selectedItem}
          />
        </div>
      )}
    </div>
  );
};

export default LeadContactEdit;
