// src/constants/dimColumnEnums.js

export const DIMCOL_USE_OPTIONS = [
    "ORD", "CAL", "VRT", "VRT2", "VRT3", "VRT4", "VRT5", "VRT6", "VRT7",
    "OBJ", "NK", "PK"
];
export const DIMCOL_PURGEWHENVIRT_OPTIONS = ["VPURG"]; // This is a single option if set
export const DIMCOL_TYPE_OPTIONS = [
    "DATE", "CHAR250", "CHAR500", "CHAR2000", "CHAR100", "CHAR20", "INT"
];
export const DIMCOL_CUBEPROC_OPTIONS = ["PROCN", "PROCY"];
export const DIMCOL_CUBEVISIBLE_OPTIONS = ["DCVISN", "DCVISY"];
export const DIMCOL_RDLSHOWFILTER_OPTIONS = ["RSFIN", "RSFIY"]; // Same as hierarchy
export const DIMCOL_CONSTRAINTTYPE_OPTIONS = [
    "DCCFSCMN", "DCCFSCQT", "DCCFSCYR", "DCCTWD", "DCCFIN0", "DCCFINH11",
    "DCCFINH12", "DCCFINCASH", "DCCFINH01", "DCCFINH02", "DCCFINH03", "DCCNO"
];
export const DIMCOL_DRILLTHROUGH_OPTIONS = ["DCDTHRYES", "DCDTHRNO"];
export const DIMCOL_INDEXDATAMART_OPTIONS = ["IDXDY", "IDXDN"];

// Re-use helper functions
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));

export const getOptionalDropdownOptions = (valuesArray, noneLabel = "--- Select (Optional) ---") => [
    { value: "", label: noneLabel },
    ...valuesArray.map(val => ({ value: val, label: val }))
];