import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5"; // Importing the close icon from react-icons
import Button from "./Buttons";

interface contentType {
  label: string;
  value: string;
  path?: string;
}

interface PopUpProps {
  isModalOpen: boolean;
  content?: React.ReactNode | contentType[];
  setModal: (isOpen: boolean) => void;
  heading: string;
  type?: string;
  modal_type?: boolean;
  action_type?: string;
}

const PopUp: React.FC<PopUpProps> = ({
  isModalOpen,
  content,
  setModal,
  heading,
  type,
  modal_type,
  action_type,
}) => {
  // Auto-save modal state
  useEffect(() => {
    if (isModalOpen) {
      try {
        localStorage.setItem(
          "popupState",
          JSON.stringify({
            isOpen: isModalOpen,
            heading,
            type,
            modal_type,
            action_type,
            timestamp: new Date().getTime(),
          })
        );
      } catch (error) {
        console.error("Error saving modal state:", error);
      }
    }
  }, [isModalOpen, heading, type, modal_type, action_type]);

  // Recover state if needed
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("popupState");
      if (savedState) {
        const { isOpen, timestamp } = JSON.parse(savedState);
        if (new Date().getTime() - timestamp < 3600000 && isOpen) {
          setModal(true);
        }
      }
    } catch (error) {
      console.error("Error recovering modal state:", error);
    }
  }, []);

  const handleModal = () => {
    setModal(false);
    localStorage.removeItem("popupState");
  };

  const handleOutsideClickClose = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleModal();
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleModal();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const isContentArray = Array.isArray(content);

  return (
    <div>
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          onClick={handleOutsideClickClose}
        >
          <div
            className={`bg-white rounded-lg shadow-xl overflow-hidden w-full m-4  max-w-${
              isContentArray
                ? "md"
                : type === "Capture" || type === "schedule"
                ? "2xl"
                : "4xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-800 px-4 py-3">
              {!isContentArray && (
                <h2 className="text-lg font-semibold text-white">{heading}</h2>
              )}
              <button
                onClick={handleModal}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                <IoCloseSharp className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {isContentArray ? (
                <div className="grid gap-4">
                  {content.map((item, index) => (
                    <a href={item.path} className="block" key={index}>
                      <button className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        {item.label}
                      </button>
                    </a>
                  ))}
                </div>
              ) : (
                content
              )}

              {/* Actions */}
              {!!modal_type && (
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <Button
                    label="Cancel"
                    type="tertiary"
                    onClick={handleModal}
                  />
                  <Button label={type ? "Upload" : "Save"} type="secondary" />
                  {type !== "ManageColumn" &&
                  action_type === "Edit" &&
                  type === "Contact" ? (
                    <Button label="Add More" type="secondary" />
                  ) : (
                    <Button label="Upload & Exit" type="secondary" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopUp;
