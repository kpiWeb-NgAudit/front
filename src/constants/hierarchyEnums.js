// src/constants/hierarchyEnums.js

export const HIER_VISIBLE_CUBE_OPTIONS = ["DHVN", "DHVY"];
export const HIER_RDL_SHOW_FILTER_OPTIONS = ["RSFIN", "RSFIY"];

// Re-use helper functions (or move to a shared utils.js if not already done)
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));
