import { Icons } from '@/components/icons/icons';
import { useCopyText } from '@/hooks/utils/useCopyText';
import { memo } from 'react';

interface CopyButtonProps {
  text: string;
  size?: number;
}

export const CopyButton = memo(function CopyButton({ text, size = 20 }: CopyButtonProps) {
  const { isCopied, copy } = useCopyText();
  const CopyIcon = isCopied ? Icons.MdCheck : Icons.MdContentCopy;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(text);
  };

  return (
    <CopyIcon
      size={size}
      className="mt-1 cursor-pointer text-gray-500 hover:text-white transition-colors duration-150"
      onClick={handleClick}
    />
  );
});