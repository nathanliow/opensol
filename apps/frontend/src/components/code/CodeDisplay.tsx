import { FC, useState } from 'react';
 import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
 import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
 import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
 
 interface CodeDisplayProps {
   code: string;
 }
 
 const CodeDisplay: FC<CodeDisplayProps> = ({ code }) => {
   const [copied, setCopied] = useState(false);
 
   const handleCopy = async () => {
     await navigator.clipboard.writeText(code);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
   };
 
   return (
     <div className="relative">
       <button
         onClick={handleCopy}
         className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
         title={copied ? "Copied!" : "Copy code"}
       >
         {copied ? (
           <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
         ) : (
           <ClipboardIcon className="h-5 w-5 text-gray-400" />
         )}
       </button>
       <SyntaxHighlighter
         language="javascript"
         style={vscDarkPlus}
         customStyle={{
           margin: 0,
           borderRadius: '0.5rem',
           padding: '1rem',
         }}
       >
         {code}
       </SyntaxHighlighter>
     </div>
   );
 };
 
 export default CodeDisplay;