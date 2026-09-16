import {
  assembleChartRows as assembleRows,
  getTableRows,
  getRelationshipParts,
  findRelationship,
  resolveRelatedColumnValue,
} from "./chartDataUtils";

export {
  getTableRows,
  getRelationshipParts,
  findRelationship,
  resolveRelatedColumnValue,
};

export function assembleChartRows({ dataArray, x, y, group_by, relationships = [] }) {
  return assembleRows({
    dataArray,
    x,
    y,
    groupBy: group_by,
    relationships,
  });
}
