import { memo } from "react";
import { CopyButton } from "../ui/CopyButton";
import { CodeDisplay } from "../code/CodeDisplay";

export interface CodeTab {
  id: string;
  name: string;
  content: string;
}

export const CodeContent = memo(({ 
  codeTabs, 
  activeCodeTab, 
  setActiveCodeTab, 
  getActiveCodeContent 
}: {
  codeTabs: CodeTab[];
  activeCodeTab: string;
  setActiveCodeTab: (tab: string) => void;
  getActiveCodeContent: () => string;
}) => (
  <div className="relative flex flex-col h-full">
    <div className="absolute top-14 right-4 z-50">
      <div className="flex justify-end px-4 items-center gap-4">
        <CopyButton text={getActiveCodeContent()} />
      </div>
    </div>
    
    <div className="flex w-full border-b-2 border-[#333333] overflow-x-auto mb-4">
      {codeTabs.map(tab => {
        return (
          <button
            key={tab.id}
            onClick={() => setActiveCodeTab(tab.id)}
            className={`px-6 py-2 mr-1 rounded-t-lg flex-shrink-0 ${
              activeCodeTab === tab.id
                ? 'bg-[#2D2D2D] text-blue-400 font-bold border-b-2 border-blue-500'
                : 'bg-[#1E1E1E] text-gray-400 hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>

    <div className="flex-1 overflow-auto">
      <CodeDisplay code={getActiveCodeContent()} />
    </div>
  </div>
));

CodeContent.displayName = 'CodeContent';