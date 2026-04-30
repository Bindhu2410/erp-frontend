import React, { useState } from "react";
import DynamicTable from "../common/DynamicTable";
import tableConfigs from "../json/businessLogic.json"; // Adjust path as needed
import Button from "../common/Buttons";
import PopUp from "../common/PopUp";
import LeadForm from "../../pages/lead/LeadForm";
import { GoGoal, GoPackage } from "react-icons/go";
import Modal from "../common/Modal";

interface dataField {
  [key: string]: any[];
}

interface BussinessLogicProps {
  data: dataField;
}

const BussinessLogic: React.FC<BussinessLogicProps> = ({ data }) => {
  console.log(data, "Interest");
  const [modal, setModal] = useState(false);
  return (
    <div className="mt-5 p-4 space-y-10">
      {tableConfigs.map((section) => {
        const sectionData = data[section.key] || [];

        return (
          <div key={section.key}>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {section.key === "product" ? (
                <GoPackage className="text-orange-500" />
              ) : (
                <GoGoal className="text-orange-500" />
              )}
              {section.section}
            </h2>

            <div className="flex justify-end gap-2 m-2">
              <Button
                label="Add"
                type="primary"
                onClick={() => setModal((prev) => !prev)}
              />
            </div>
            <DynamicTable
              leads={sectionData.map((item) => ({
                ...item,
                id: item.id,
              }))}
              columns={{
                tableHeading: section.columns,
                manageColumn: section.columns.reduce((acc, col) => {
                  acc[col.id] = true;
                  return acc;
                }, {} as Record<string, boolean>),
              }}
              toggleColumn={(column: string) => {
                console.warn("Toggle not implemented:", column);
              }}
              totalCount={sectionData.length}
              listType={""}
              hideFields={true}
            />
          </div>
        );
      })}

      <Modal isOpen={modal} onClose={() => setModal(false)}>
        <LeadForm
          onClose={() => setModal(false)}
          leadData={data}
          leadId={data?.id ? String(data.id) : undefined}
        />
      </Modal>
    </div>
  );
};

export default BussinessLogic;
