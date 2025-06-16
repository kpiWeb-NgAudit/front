// src/constants/cubeUserEnums.js

export const CUBE_USER_WHEN_SEND_STATS_OPTIONS = [
    "RSAT", "RFRI", "RTHU", "RWED", "RTUE", "RMON", "RNEVER"
];

// Re-use helper functions (or move to a shared utils.js if not already done)
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));