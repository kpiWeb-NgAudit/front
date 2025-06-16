// src/constants/userEnums.js

export const USER_TYPES = ["UTSTD", "UTADM", "UTSUBSCR"];
export const USER_RBUILDER_OPTIONS = ["RBNO", "RBYES"];
export const USER_RPTADMIN_OPTIONS = ["RPTADMNO", "RPTADMYES"];
export const USER_DATAMARTACCESS_OPTIONS = ["UDMANO", "UDMAYES"];

// Re-use helper functions
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));

// For boolean-like string enums where you want a Yes/No display
export const getYesNoOptions = (yesValue, noValue) => [
    { value: yesValue, label: "Yes" },
    { value: noValue, label: "No" }
];