import { FaTerminal } from "react-icons/fa6";
import { 
  FiList, 
  FiGrid, 
  FiEdit2, 
  FiTrash2, 
  FiAlertTriangle,
  FiSearch, 
  FiGitMerge, 
  FiBox, 
  FiClock, 
  FiMenu, 
  FiMousePointer, 
  FiX, 
  FiPlusCircle, 
  FiSave, 
  FiFolder, 
  FiDownload, 
  FiUpload, 
  FiLogOut, 
  FiDatabase, 
  FiLayout, 
  FiCheck,
  FiHome,
  FiPlus,
  FiInfo,
  FiStar,
  FiGlobe,
} from "react-icons/fi";
import { FaRegSquare } from "react-icons/fa";
import { ChevronDownIcon } from '@heroicons/react/24/outline';

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

const WandIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 4-3 3 6 6 3-3a2.83 2.83 0 0 0-4-4Z" />
      <path d="m14.5 14.5-10 10 3-3" />
      <path d="m6.5 6.5 3 3" />
      <path d="m3.5 3.5 3 3" />
    </svg>
  );
};

const CopyIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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
  FaRegSquare,
  FiMenu,
  FiMousePointer,
  FiX,
  FiPlusCircle,
  FiSave,
  FiFolder,
  FiDownload,
  FiUpload,
  FiLogOut,
  ChevronDownIcon,
  FiGitMerge,
  FiBox,
  FiClock,
  FiSearch,
  FiTrash2,
  FiGrid,
  FiList,
  FiEdit2,
  FiDatabase,
  FiLayout,
  ResizeIcon,
  WandIcon,
  CopyIcon,
  ClearIcon,
  FiCheck,
  FiAlertTriangle,
  FiHome,
  FiPlus,
  FiInfo,
  FiStar,
  FiGlobe,
};
