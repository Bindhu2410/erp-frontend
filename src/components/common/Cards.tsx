import React from "react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as HiIcons from "react-icons/hi";
import * as IoIcons from "react-icons/io5";

interface CardsProps {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  color: number;
}

const Cards: React.FC<CardsProps> = ({
  title,
  value,
  description,
  icon,
  color,
}) => {
  const getColorClass = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
    ];
    return colors[index % colors.length];
  };

  const Icon = getIconComponent(icon);

  return (
    <div className={`p-4 rounded-lg ${getColorClass(color)}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-2xl font-bold mt-2">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-sm mt-1">{description}</p>
        </div>
        <div className="text-2xl">
          <Icon />
        </div>
      </div>
    </div>
  );
};

const colors = [
  "text-blue-500",
  "text-green-500",
  "text-red-500",
  "text-yellow-500",
  "text-purple-500",
  "text-pink-500",
  "text-indigo-500",
];

const gradients = [
  "from-blue-50 to-blue-100",
  "from-green-50 to-green-100",
  "from-red-50 to-red-100",
  "from-yellow-50 to-yellow-100",
  "from-purple-50 to-purple-100",
  "from-pink-50 to-pink-100",
  "from-indigo-50 to-indigo-100",
  "from-cyan-50 to-cyan-100",
  "from-orange-50 to-orange-100",
  "from-teal-50 to-teal-100",
];

const iconSets = {
  Fa: FaIcons,
  Md: MdIcons,
  Ai: AiIcons,
  Bs: BsIcons,
  Hi: HiIcons,
  Io: IoIcons,
};

const getIconComponent = (iconName: string): React.ElementType => {
  type IconSetPrefix = keyof typeof iconSets;
  const prefix = iconName.slice(0, 2) as IconSetPrefix;
  const iconSet = iconSets[prefix];
  return (iconSet && (iconSet as any)[iconName]) || FaIcons.FaQuestionCircle;
};

export default Cards;
