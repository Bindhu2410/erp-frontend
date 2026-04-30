import React, { useEffect, useState } from "react";
import { MdDelete, MdEdit, MdPrint } from "react-icons/md";

import { FaAddressCard } from "react-icons/fa";

import SearchOptions from "../common/SearchOption";
import PopUp from "../common/PopUp";
import { FaFileInvoiceDollar, FaTableList } from "react-icons/fa6";
import { ImTable2 } from "react-icons/im";
import Button from "../common/Buttons";
import AddressForm from "../forms/AddressForm";
import jsonData from "../json/lead.json";
import { AddressField, TableHeaders } from "../models/ViewModel";
import ConfirmBox from "../common/ConfirmBox";
import axios from "axios";
import DynamicTable from "../common/DynamicTable";
import LeadForm from "../../pages/lead/LeadForm";

type dataField = {
  [key: string]: string | number;
};

type addressProps = {
  action: string[];
  data: any;
  leadId?: string;
  oppId?: string;
};
const LeadAddressEdit: React.FC<addressProps> = ({
  data,
  action,
  leadId,
  oppId,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [refreshTable, setRefreshTable] = useState(false);
  const [view, setView] = useState<"card" | "table">(
    isMobile ? "card" : "table"
  );
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setView(isMobile ? "card" : "table");
    };
    window.addEventListener("resize", handleResize);
    return () => window.addEventListener("resize", handleResize);
  }, []);
  const companyAddress = {
    content: {
      title: "Medical Equipment Handle With Care",
      from: {
        companyName: "JBS Meditec India Private Ltd",
        address: {
          address1: "Sri Ragavendra Tower, 3rd Floor, No-34,",
          address2: "Co-operative E-colony, Behind Kumudham Nagar,",
          street: "Villankurichi Road",
          city: " Coimbatore",
          pincode: "641035",
        },
        contact: ["9443367915", "9443366752"],
      },
    },
  };

  const printAddress = (row: any) => {
    // const printContent = document.getElementById("print-template")?.innerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quotation</title>
          <style>
            @media print {
              @page {
                margin: 0;
              }
              body {
                margin: 30px;
                font-family: Arial, sans-serif;
              }
                 p {
          font-size: 20px; /* Set the font size of all p tags */
        }
            }
          </style>
        </head>
        <body>
          <div style="text-align:left;margin:30px">
            <strong>To</strong>
            <p>${row.city}</p>
            <p>${row.landmark}</p>
            <p>${row.territory}</p>
          </div>
          <h2 style="text-align:center">${companyAddress.content.title}</h2>
          <div style="position: absolute; right: 30px; top: 250px; width: auto; font-size:16px">
            <div style="text-align:left;">
              <strong>From</strong>
              <p>${companyAddress.content.from.address.address1}</p>
              <p>${companyAddress.content.from.address.address2}</p>
              <p>${companyAddress.content.from.address.street}</p>
              <p>${companyAddress.content.from.address.city}-${
        companyAddress.content.from.address.pincode
      }</p>
              <p style="display: flex;"><strong>Ph:</strong>
                ${companyAddress.content.from.contact.map(
                  (contact) =>
                    `
                  ${contact}
                `
                )}
              </p>
            </div>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const actions = [
    {
      label: <MdEdit title="Edit" />,
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
    {
      label: <MdPrint title="Print" />,
      onClick: (row: any) => {
        printAddress(row);
      },
      type: "print",
    },
    {
      label: <FaFileInvoiceDollar title="Generate Invoice" />,
      onClick: (row: any) => {
        console.log(row);
      },
      type: "invoice",
    },
  ];
  const [loading, setLoading] = useState(false);

  // const fetchLeadAddress = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:4321/api/sales/get_lead_address",
  //       {
  //         leadId: "987654",
  //         pageNo: currentPage.toString(),
  //         pageSize: ITEMS_PER_PAGE,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     console.log(response.data, "address");
  //     setBusinessData(response.data?.data?.sales_lead_addresses || []);
  //     console.log(address, "addr");
  //   } catch (error) {
  //     console.log("Error fetching Lead Address", address);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRefresh = () => {
    setRefreshTable((prev) => !prev);
  };
  const fetchLeadAddress = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/SalesAddress/lead/${leadId}`
      );

      console.log(response.data, "api response");
      setBusinessData(response.data || []);

      console.log(businessData, "contact response");
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
    console.log(leadId, "leadId");
  };

  useEffect(() => {
    console.log(data, "address.data");
    setBusinessData(data.addresses);
  }, [data]);

  const [address, setAddress] = useState<any[]>([]);
  const [addressTable, setAddressTable] = useState<TableHeaders[]>([]);
  const [businessData, setBusinessData] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const sectionData = [
    {
      id: "address",
      title: "Address",
      component: (
        <AddressForm
          leadId={leadId}
          onCancel={() => {
            setModal(false);
          }}
          onSuccess={fetchLeadAddress}
        />
      ),
      fields: addressTable || [],
    },
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // const [MCFieldData, SetMCFields] = useState<any[]>(address_Field);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [isModelOpen, setISModelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();

    const filtered = businessData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(lowercasedTerm)
      )
    );
    setFilteredData(filtered);
  }, [searchTerm, businessData]);

  useEffect(() => {
    try {
      const addressSection = jsonData.find(
        (section) => section.title === "Address"
      );

      if (addressSection) {
        setAddress([
          {
            title: "address",
            fields: addressSection.fields as unknown as AddressField[],
          },
        ]);
        setAddressTable(
          addressSection.tableColumns as unknown as TableHeaders[]
        );
      }
    } catch (error) {
      console.error("Error loading JSON data:", error);
    }
  }, [jsonData]);

  const handleEdit = (row: any) => {
    console.log(row, "addess.edit");
    console.log(row, "address.new");
    const content = (
      <AddressForm
        onCancel={() => setModal(false)}
        leadId={leadId}
        onSuccess={fetchLeadAddress}
        editId={row.id}
        // addressData={businessData}
        // setAddressData={setBusinessData}
        // sectionData={address}
        // onAddSuccesss={fetchLeadAddress}
        // setModal={setModal}
        // editData={row}
        // leadId={leadId}
        // oppId={oppId}
        // apiCall={true}
        // isEditMode={true}
      />
    );
    handleModal(content);
  };
  const handleModal = (content: React.ReactNode) => {
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
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/SalesAddress/${id}`
      );
      setISModelOpen(false);

      console.log(response.data, "api response");
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }

    fetchLeadAddress();
  };
  const [tooltip, setTooltip] = useState("");
  const showTooltip = (text: string) => setTooltip(text);
  const hideTooltip = () => setTooltip("");
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
  const [columns, setColumns] = useState({
    tableHeading: [
      { fieldName: "Address Type", id: "type" },
      { fieldName: "Contact Name", id: "contactName" },
      { fieldName: "Block", id: "block" },
      { fieldName: "Department", id: "department" },
      { fieldName: "Door No", id: "doorNo" },
      { fieldName: "Street", id: "street" },
      { fieldName: "Pincode", id: "pincode" },
      { fieldName: "Landmark", id: "landmark" },
      { fieldName: "City", id: "city" },
      { fieldName: "District", id: "district" },
      { fieldName: "State", id: "state" },
    ],
    manageColumn: {
      type: true,
      contactName: true,
      block: true,
      department: true,
      doorNo: true,
      street: true,
      landmark: true,
      city: true,
      district: true,
      state: true,
      pincode: true,
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

  return (
    <div className="bg-white p-2 m-2">
      <div>
        <div className="lg:flex hidden md:flex  justify-between mt-2 ">
          <SearchOptions handleSearch={setSearchTerm} />
          <div className="flex justify-end gap-2  mx-2">
            <button
              onMouseEnter={() => showTooltip("Card")}
              onMouseLeave={hideTooltip}
              className={`text-gray-500 relative p-2 border border-gray-300 rounded-md ${
                view === "card"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-400"
              }`}
              onClick={() => setView("card")}
            >
              <FaTableList />
              {tooltip == "Card" && (
                <div className="absolute top-10 z-10 right-1/2 bg-gray-700 text-white text-sm p-2 rounded-md mt-1">
                  {tooltip}
                </div>
              )}
            </button>
            <button
              onMouseEnter={() => showTooltip("Table")}
              onMouseLeave={hideTooltip}
              className={`text-gray-500 p-2 relative border border-gray-300 rounded-md hover:bg-gray-100 focus:bg-gray-100 ${
                view === "table"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-400"
              }`}
              onClick={() => setView("table")}
            >
              <ImTable2 />
              {tooltip == "Table" && (
                <div className="absolute top-10 z-10 right-1/2 bg-gray-700 text-white text-sm p-2 rounded-md mt-1">
                  {tooltip}
                </div>
              )}
            </button>

            <Button
              label="Add"
              type="primary"
              onClick={() => handleModal(<LeadForm leadData={LeadForm} />)}
            />
          </div>
        </div>
        <div className="lg:hidden md:hidden block ">
          <SearchOptions handleSearch={setSearchTerm} />
          <div className="flex justify-between gap-2  mx-2">
            <div className="flex justify-start gap-2 m-2">
              <button
                onMouseEnter={() => showTooltip("Card")}
                onMouseLeave={hideTooltip}
                className={`text-gray-500 relative p-2 border border-gray-300 rounded-md ${
                  view === "card"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-400"
                }`}
                onClick={() => setView("card")}
              >
                <FaTableList />
                {tooltip == "Card" && (
                  <div className="absolute top-10 z-10 right-1/2 bg-gray-700 text-white text-sm p-2 rounded-md mt-1">
                    {tooltip}
                  </div>
                )}
              </button>

              <button
                onMouseEnter={() => showTooltip("Table")}
                onMouseLeave={hideTooltip}
                className={`text-gray-500 p-2 relative border border-gray-300 rounded-md hover:bg-gray-100 focus:bg-gray-100 ${
                  view === "table"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-400"
                }`}
                onClick={() => setView("table")}
              >
                <ImTable2 />
                {tooltip == "Table" && (
                  <div className="absolute top-10 z-10 right-1/2 bg-gray-700 text-white text-sm p-2 rounded-md mt-1">
                    {tooltip}
                  </div>
                )}
              </button>
            </div>
            <div className=" m-2">
              <Button
                label="Add"
                type="primary"
                onClick={() => handleModal(sectionData[0].component)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {view === "table" ? (
          <>
            {/* <ViewHandling
                fields={sectionData[0].fields || []}
                data={currentTaskData}
                actions={filteredActions}
                edit={sectionData[0].component}
                editHeading={`Edit `}
                model_type={false}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              /> */}

            <DynamicTable
              leads={businessData.map((lead) => ({
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
              listType="Addresses"
              hideFields={true}
              tableType="form"
              checkbox={false}
            />

            <ConfirmBox
              isOpen={isModelOpen}
              onClose={closeModel}
              onDelete={() => handleDelete(selectedItem)}
              title="Address"
              id={selectedItem}
            />
          </>
        ) : (
          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 px-10  ">
            {filteredData.map((data, index) => (
              <div
                key={index}
                className="max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex gap-2 items-center">
                  <FaAddressCard className="text-2xl" />
                  <span className="text-xl font-bold text-black-2">
                    {" "}
                    {data.type}
                  </span>
                </div>

                <a href="#">
                  <h5 className="mb-2 mt-1 text-md font-semibold tracking-tight text-gray-600 dark:text-white">
                    {data.contact_name}
                  </h5>
                </a>
                <p className=" font-normal text-gray-500 dark:text-gray-400">
                  {data.address}
                </p>
                <p className=" font-normal text-gray-500 dark:text-gray-400">
                  {data.city}
                </p>
                <p className=" font-normal text-gray-500 dark:text-gray-400">
                  {data.landmark}
                </p>
                <p className="font-normal text-gray-500 dark:text-gray-400">
                  {data.state}
                </p>
                <p className=" font-normal text-gray-500 dark:text-gray-400">
                  pincode - {data.zipcode}
                </p>
                <p className=" font-normal text-gray-500 dark:text-gray-400">
                  Territory-
                  <span className="font-semibold text-black-2">
                    {data.territory}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* <div className="w-full  gap-2  justify-center flex border-gray-400 rounded">
        <textarea
          rows={3}
          placeholder="comments..."
          className="w-full m-4  justify-center flex items-center"
        />
      </div> */}
      <div className="z-10">
        <PopUp
          content={content}
          isModalOpen={modal}
          heading={"Edit Address"}
          setModal={setModal}
        />
      </div>
    </div>
  );
};

export default LeadAddressEdit;
