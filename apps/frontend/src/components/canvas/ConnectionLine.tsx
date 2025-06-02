import { useConnection, Position, getSmoothStepPath } from '@xyflow/react';

export default function ConnectionLine({ fromX, fromY, toX, toY }: { fromX: number; fromY: number; toX: number; toY: number }) {
  const { fromHandle } = useConnection();
  
  const sourcePosition = fromHandle?.position || Position.Right;
  const targetPosition = sourcePosition === Position.Left ? Position.Right : 
                        sourcePosition === Position.Right ? Position.Left :
                        sourcePosition === Position.Top ? Position.Bottom : Position.Top;
  
  const [path] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition,
    targetX: toX,
    targetY: toY,
    targetPosition,
  });
 
  return (
    <g>
      <path
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeDasharray="5,5"
        className="animated"
        d={path}
        opacity={0.8}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="white"
        r={4}
        stroke="white"
        strokeWidth={2}
        opacity={0.9}
      />
    </g>
  );
};