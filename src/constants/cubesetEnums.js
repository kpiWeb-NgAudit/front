// src/constants/cubesetEnums.js

export const CUBESET_HIDDEN_OPTIONS = ["CSHDN", "CSHDY", "CSVISY", "CSVISN"];
export const CUBESET_DYNAMIC_OPTIONS = ["CSDYNN", "CSDYNY"];
export const CUBESET_RDLSHOWFILTER_OPTIONS = ["RSFIN", "RSFIY"]; // Same as dimension/role

// Re-use helper functions
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));