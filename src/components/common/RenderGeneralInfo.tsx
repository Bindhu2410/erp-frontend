import React, { ReactNode } from "react";
import {
  MdBusinessCenter,
  MdPerson,
  MdDateRange,
  MdLocationOn,
  MdPhone,
  MdOutlineMailOutline,
} from "react-icons/md";
import { formatDate } from "../lead/FormateDate";

interface FieldGroup {
  title?: string;
  label: string;
  key: string;
  icon?: ReactNode;
  section?: string;
}

interface FieldConfig {
  title?: string;
  section?: string;
  label?: string;
  key?: string;
  icon?: ReactNode;
  contactDetails?: FieldGroup[];
  Details?: FieldGroup[];
}

interface GeneralInfoCardProps {
  data: any | null;
  generalInfoFields: FieldConfig[];
}

const GeneralInfoCard: React.FC<GeneralInfoCardProps> = ({
  data,
  generalInfoFields,
}) => {
  const getValue = (key: any) => {
    const value = data?.[key];
    if (value === undefined || value === null) return "-";

    switch (key) {
      case "demoDateTime":
      case "closeDate":
      case "itemAvailableDates":
      case "customerRequestDates":
      case "internalAcceptedDates":
      case "expectedCompletion":
        return typeof value === "string" || typeof value === "number"
          ? formatDate(value.toString())
          : "-";
      case "phoneNo":
        return value.toString();

      case "status":
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              typeof value === "string" && value.toLowerCase() === "active"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {Array.isArray(value)
              ? value.map((item, index) => (
                  <span key={index}>
                    {JSON.stringify(item)}
                    {index < value.length - 1 && ", "}
                  </span>
                ))
              : value}
          </span>
        );
      default:
        return value.toString();
    }
  };

  const renderField = (field: FieldGroup) => {
    switch (field.section) {
      case "header":
        return field.key === "status" ? (
          <span className="px-4 py-2 bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600 text-sm font-medium">
            {getValue(field.key)}
          </span>
        ) : (
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg shadow-lg">
              {field.icon}
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">
                {field.label}
              </p>
              <h1 className="text-xl font-bold text-white">
                {getValue(field.key)}
              </h1>
            </div>
          </div>
        );

      case "info":
        return (
          <div
            key={field.key}
            className="space-y-1 px-3 py-2 first:border-none border-l border-slate-600/50"
          >
            <div className="flex items-center gap-2 text-slate-400">
              {field.icon && <span className="text-sky-400">{field.icon}</span>}
              <p className="text-sm">{field.label}</p>
            </div>
            <p className="text-lg font-semibold">{getValue(field.key)}</p>
            {field.key === "customerName" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-400/10 text-sky-400 border border-sky-400/20">
                {getValue("customerType")}
              </span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header and Info Sections */}
      <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-8 rounded-lg text-white overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-grid-slate-600/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            {generalInfoFields
              .filter((f) => f.section === "header")
              .map((field, index) => renderField(field as FieldGroup))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-700/20 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50">
            {generalInfoFields
              .filter((f) => f.section === "info")
              .map((field, index) => renderField(field as FieldGroup))}
          </div>
        </div>
      </div>

      {/* Dynamic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {generalInfoFields.map((group, index) => {
          if (group.contactDetails) {
            return (
              <div
                key={`contact-${index}`}
                className="bg-white rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="border-b border-slate-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {group.title}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {group.contactDetails.map((field, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {field.key === "contactName" && (
                          <MdPerson className="text-slate-600" />
                        )}
                        {field.key === "contactMobileNo" && (
                          <MdPhone className="text-slate-600" />
                        )}
                        {field.key === "email" && (
                          <MdOutlineMailOutline className="text-slate-600" />
                        )}
                        {field.key === "address" && (
                          <MdLocationOn className="text-slate-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">{field.label}</p>
                        <p className="font-medium text-slate-900">
                          {getValue(field.key)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (group.Details) {
            return (
              <div
                key={`opportunity-${index}`}
                className="bg-white rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow lg:col-span-2"
              >
                <div className="border-b border-slate-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {group.title}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {group.Details.map((field, idx) => (
                      <div key={idx}>
                        <p className="text-sm text-slate-500">{field.label}</p>
                        <p className="font-medium text-slate-900 mt-1">
                          {getValue(field.key)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

export default GeneralInfoCard;
