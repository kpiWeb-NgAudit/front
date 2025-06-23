// src/constants/factColumnEnums.js

export const FACTCOL_USE_OPTIONS = ["FCA", "NM", "FA", "FK"];
export const FACTCOL_TYPE_OPTIONS = [
    "DBLESTD", "DBLESTDINT", "DBLESTD1D", "DBLEPCT",
    "DBLECUR", "DBLECURINT", "INT"
];
export const FACTCOL_CUBEVISIBLE_OPTIONS = ["FCVISN", "FCVISY"];
export const FACTCOL_CUBEAGGREGAT_OPTIONS = [
    "AGAVG", "AGCNT", "AGDCNT", "AGSUM",
    "AGLNE", "AGFNE", "AGNULL"
];
export const FACTCOL_INDEXDATAMART_OPTIONS = ["IDXDY", "IDXDN"];

// Re-use helper functions
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));

export const getOptionalDropdownOptions = (valuesArray, noneLabel = "--- Select (Optional) ---") => [
    { value: "", label: noneLabel },
    ...valuesArray.map(val => ({ value: val, label: val }))
];

// For boolean-like string enums where you want a Yes/No display
export const getYesNoOptions = (yesValue, noValue) => [
    { value: yesValue, label: "Yes" },
    { value: noValue, label: "No" }
];