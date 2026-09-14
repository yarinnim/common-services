export const getWhereClause = (pFilter: string): string[] => {
  try {
    const filter = JSON.parse(pFilter);
    const keys = Object.keys(filter);
    if (keys.length === 0) return [];

    const result = keys.map((key: string) => {
      const value = filter[key];
      return `${key} ${value}`;
    });
    return result;
  } catch(error: any) {
    const { message } = error;
    console.error({ message });
    return [];
  }
};

export const senitizeFields = (pFields: string[]): string => {
  if (pFields.length === 0) return '';

  const fields = pFields.reduce((accu: string[], field: string) => {
    if (field.trim().length === 0) return accu;
    return [...accu, field];
  }, []);

  return fields.join(', ');
};

export const senitizeGroupBy = (strGroupBy: string): string => {
  const str = strGroupBy.replace(/\s/g, '')
    .replace(/,,/, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '');
  return str.toString();
};
