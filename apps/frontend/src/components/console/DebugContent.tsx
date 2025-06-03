import { memo } from "react";

export const DebugContent = memo(({ debug }: { debug: string }) => (
  <pre className="whitespace-pre-wrap">{debug}</pre>
));

DebugContent.displayName = 'DebugContent';