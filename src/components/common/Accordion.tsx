import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface AccordionProps {
  items: {
    label: string;
    content: React.ReactNode;
    icons?: React.ReactNode;
    id?: string;
    accordian?: boolean;
    dataLength?: string | number;
  }[];

  initiallyClosedIndices?: number[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
  console.log(items, "it.data");
  const [activeIndex, setActiveIndex] = useState<number[]>([]);

  useEffect(() => {
    const firstOpenIndex = items.findIndex((item) => item.accordian);
    if (firstOpenIndex !== -1) {
      setActiveIndex([firstOpenIndex]);
    }
  }, [items]);

  const toggleAccordian = (index: number, isForced: boolean) => {
    const isFixedOpen = items[index].accordian;

    // if (isFixedOpen) return; // Prevent toggle if accordian is true

    setActiveIndex((prevIndices) =>
      prevIndices.includes(index)
        ? prevIndices.filter((i) => i !== index)
        : [...prevIndices, index]
    );
  };

  return (
    <div className="w-full relative top-2">
      {items.map((item, index) => (
        <div key={index} className="border-b border-gray-200 mb-2" id={item.id}>
          <button
            onClick={() => toggleAccordian(index, !!item.accordian)}
            className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-gray-200 focus:outline-none bg-gray-100"
          >
            <span className="font-semibold flex gap-3">
              {item.icons}
              {item.label}
              {!activeIndex.includes(index) && (
                <span className="bg-blue-500 rounded-full text-xs w-6 h-6 flex items-center justify-center text-white">
                  {item.dataLength}
                </span>
              )}
            </span>

            <span>
              {activeIndex.includes(index) ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </span>
          </button>
          {activeIndex.includes(index) && (
            <div className="p-4 bg-gray-50 text-gray-700">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
