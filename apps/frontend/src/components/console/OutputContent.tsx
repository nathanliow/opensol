import { formatJSON } from "@/utils/formatJSON";
import { memo, useMemo } from "react";

export const OutputContent = memo(({ output }: { output: string }) => {
  const formattedOutput = useMemo(() => formatJSON(output), [output]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
      {formattedOutput}
    </div>
  );
});

OutputContent.displayName = 'OutputContent';