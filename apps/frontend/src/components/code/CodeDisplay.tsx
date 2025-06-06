import { FC, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
 
 interface CodeDisplayProps {
   code: string;
 }
 
export const CodeDisplay: FC<CodeDisplayProps> = ({ code }) => {
   const [copied, setCopied] = useState(false);
 
   const handleCopy = async () => {
     await navigator.clipboard.writeText(code);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
   };
 
  return (
    <div className="relative">
      <SyntaxHighlighter
        language="javascript"
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '0.5rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};