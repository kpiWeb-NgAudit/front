// src/constants/rdlGroupFactColEnums.js

export const RDL_CALC_TYPE_OPTIONS = [
    "", // Empty string is a valid option
    "CUSTCALC4", "CUSTCALC3", "CUSTCALC2", "CUSTCALC1", "CUSTCALC0", "MM12",
    "TTD_MONTH_EVOLPCT", "TTD_MONTH_EVOL", "TTD_MONTH", "TTD_FISCMONTH",
    "TTD_QUARTER_EVOLPCT", "TTD_QUARTER_EVOL", "TTD_QUARTER", "TTD_FISCYEAR_EVOL",
    "TTD_YEAR_EVOLPCT", "TTD_YEAR_EVOL", "TTD_FISCYEAR", "TTD_YEAR",
    "EVOLPCT_DAY7", "EVOLPCT_MONTH", "EVOLPCT_QUARTER", "EVOLPCT_YEAR",
    "EVOL_DAY7", "EVOL_MONTH", "EVOL_QUARTER", "EVOL_YEAR"
];

// Helper function to get options for a dropdown
export const getCalcTypeDropdownOptions = (includeEmpty = true) => {
    const options = RDL_CALC_TYPE_OPTIONS.map(val => ({ value: val, label: val || "None" }));
    if (!includeEmpty) {
        return options.filter(opt => opt.value !== "");
    }
    return options;
};

// General dropdown helper if not already in a shared utils file
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));