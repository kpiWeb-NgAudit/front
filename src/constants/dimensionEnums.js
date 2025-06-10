// src/constants/dimensionEnums.js

export const DIM_DB_FETCH_TYPES = ["GEO", "TIME", "NAT", "GEN", "SCD"];
export const DIM_PROC_CUBE_OPTIONS = ["DPROCN", "DPROCY"];
export const DIM_VISIBLE_OPTIONS = ["DVISN", "DVISY"];
export const DIM_CUBE_TYPES = ["Time", "Geography", "Accounts", "Regular"];
export const DIM_DELETE_ORPHEAN_OPTIONS = ["DORPHY", "DORPHN"];
export const DIM_COUNT_MEASURE_GROUP_OPTIONS = ["DCMGN", "DCMGY"];
export const DIM_VERSIONS = ["DIMV1", "DIMV2"];
export const DIM_EXIST_QUOTES_OPTIONS = ["DEQY", "DEQN"];

// Helper from customerEnums.js (can be moved to a shared utils file if you prefer)
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));

export const getOptionalDropdownOptions = (valuesArray, noneLabel = "--- Select (Optional) ---") => [
    { value: "", label: noneLabel },
    ...valuesArray.map(val => ({ value: val, label: val }))
];