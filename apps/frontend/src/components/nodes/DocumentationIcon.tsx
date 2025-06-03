import { FC } from "react";
import { Icons } from "../icons/icons";

/**
 * Documentation Icon component
 */
export const DocumentationIcon: FC<{
  documentationUrl?: string;
}> = ({ documentationUrl }) => {
  if (!documentationUrl || documentationUrl.trim() === '') return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(documentationUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <button
      onClick={handleClick}
      className="absolute right-1 top-1 w-5 h-5 rounded-full text-black cursor-pointer flex items-center justify-center z-20"
      title={`Open documentation: ${documentationUrl}`}
      type="button"
    >
      <Icons.FiInfo size={16} />
    </button>
  );
};