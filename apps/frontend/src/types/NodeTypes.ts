import { NodeTypes } from "@xyflow/react";
import getNode from "../components/nodes/getNode";
import objectNode from "../components/nodes/objectNode";

export const nodeTypes = {
  GET: getNode,
  OBJECT: objectNode,
} satisfies NodeTypes;
  