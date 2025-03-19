import { FaTerminal } from "react-icons/fa6";
import { FiMenu, FiMousePointer, FiX } from "react-icons/fi";
import { FaRegSquare } from "react-icons/fa";

const ResizeIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 12L12 4M8 12L12 8M4 8L8 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
};

const ClearIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 4H14M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M12 4V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4" 
        stroke="#6B7280" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        strokeLinejoin="round"/>
    </svg>
  );
};

export const Icons = {
  FaTerminal,
  ResizeIcon,
  ClearIcon,
  FiMenu,
  FiX,
  FaRegSquare,
  FiMousePointer,
};