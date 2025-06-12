
export const HIER_DIM_RDL_TYPE_PRESNAME_COL_OPTIONS = [
    "HDTH0HN_D", "HDTH0HN_A", "HDTHIER_D", "HDTHIER_A", "HDTNAME"
];

// Re-use helper functions if they are in a shared utils or another enum file
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));