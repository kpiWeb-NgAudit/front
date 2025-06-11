// src/constants/factEnums.js

export const FACT_TYPES = ["FTSTD", "FTNOTIME", "FTBUDOBJ", "FTWRBACK"];
export const FACT_PROC_CUBE_OPTIONS = ["FPROCN", "FPROCY"];
export const FACT_DATA_FILE_TYPES = ["TEXT", "EXCELWK1", "EXCELWK2", "EXCELWK3"]; // Nullable
export const FACT_ZONE_SPE_OPTIONS = ["FZSPEN", "FZSPEY"];
export const FACT_PARTITION_TYPES = ["FPTYEA", "FPTYEA3", "FPTNUL"];

// Re-use helper functions (or move to a shared utils.js)
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));

export const getOptionalDropdownOptions = (valuesArray, noneLabel = "--- Select (Optional) ---") => [
    { value: "", label: noneLabel }, // For truly optional selects where "" means null
    ...valuesArray.map(val => ({ value: val, label: val }))
];

// For boolean (bit) fields that are nullable
export const getNullableBooleanOptions = (trueLabel = "Yes", falseLabel = "No", noneLabel = "--- Select (Optional) ---") => [
    { value: "", label: noneLabel },      // Represents null
    { value: "true", label: trueLabel },  // Represents true
    { value: "false", label: falseLabel } // Represents false
];