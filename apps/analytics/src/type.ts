export type RequestLog = {
};

type Query = {
  tableName: string,
  partition: string,
  filter?: string,
  limit?: number,
  offset?: number,
};

export type SplitUrl = Query & {
  fieldValue: string,
  charToSplit: string,
  match?: string,
  dateRange?: [Date, Date] | any,
};

export type ExtractUrlParams = Query & {
  fieldValue: string,
  keyToExtract: string,
};

export type CountDimension = Query & {
  fieldName: string,
  groupField?: boolean, /* if the field is grouped in GROUP BY */
};
