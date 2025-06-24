// src/constants/calcTypeFactColEnums.js

export const CALCFACTCOL_VISIBLE_OPTIONS = ["CFCVISN", "CFCVISY"];

// Values from factcol_chk_factcol_type (includes empty string for 'not set')
export const CALCFACTCOL_TYPEFORFORMAT_OPTIONS = [
    "", "DBLESTD", "DBLESTDINT", "DBLESTD1D", "DBLEPCT",
    "DBLECUR", "DBLECURINT", "INT"
];

export const CALCFACTCOL_SHOWTOTALINRDL_OPTIONS = ["RDLSHTOTY", "RDLSHTOTN"];


// Re-using the comprehensive list of Calculation Types
// This could also be fetched from the /api/calctypes endpoint if preferred dynamic
export const ALL_CALC_TYPE_IDENTIFIERS = [
    // "" is a valid value in CHECK constraint, meaning 'None' or 'Not Applicable'
    "",
    "CUSTCALC24", "CUSTCALC23", "CUSTCALC22", "CUSTCALC21", "CUSTCALC20",
    "CUSTCALC19", "CUSTCALC18", "CUSTCALC17", "CUSTCALC16", "CUSTCALC15",
    "CUSTCALC14", "CUSTCALC13", "CUSTCALC12", "CUSTCALC11", "CUSTCALC10",
    "CUSTCALC9", "CUSTCALC8", "CUSTCALC7", "CUSTCALC6", "CUSTCALC5",
    "CUSTCALC4", "CUSTCALC3", "CUSTCALC2", "CUSTCALC1", "CUSTCALC0",
    "MM12", "TTD_MONTH_EVOLPCT", "TTD_MONTH_EVOL", "TTD_MONTH", "TTD_FISCMONTH",
    "TTD_QUARTER_EVOLPCT", "TTD_QUARTER_EVOL", "TTD_QUARTER", "TTD_FISCQUARTER",
    "TTD_FISCYEAR_EVOLPCT", "TTD_FISCYEAR_EVOL", "TTD_YEAR_EVOLPCT", "TTD_YEAR_EVOL",
    "TTD_FISCYEAR", "TTD_YEAR", "EVOLPCT_DAY7", "EVOLPCT_MONTH",
    "EVOLPCT_QUARTER", "EVOLPCT_YEAR", "EVOL_DAY7", "EVOL_MONTH",
    "EVOL_QUARTER", "EVOL_YEAR", "EVOLPCT_FISCYEAR", "EVOL_FISCYEAR",
    "LASTYEAR", "LASTYEAR_YTD", "LASTYEAR_QTD", "LASTYEAR_MTD",
    "LASTFISCYEAR", "LASTFISCYEAR_YTD", "LASTFISCYEAR_QTD", "LASTFISCYEAR_MTD",
    "EVOLPCT_FISCQUARTER", "EVOL_FISCQUARTER", "EVOLPCT_FISCMONTH", "EVOL_FISCMONTH",
    "TTD_FISCQUARTER_EVOL", "TTD_FISCQUARTER_EVOLPCT", "TTD_FISCMONTH_EVOL", "TTD_FISCMONTH_EVOLPCT",
    "CM03", "CM03_LASTYEAR", "CM03_EVOL", "CM03_EVOLPCT",
    "CM06", "CM06_LASTYEAR", "CM06_EVOL", "CM06_EVOLPCT",
    "CM12", "CM12_LASTYEAR", "CM12_EVOL", "CM12_EVOLPCT"
];


// Helper functions
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val === "" ? "--- None ---" : val }));

// For optional fields where "" means null
export const getOptionalDropdownOptions = (valuesArray, noneLabel = "--- Not Set ---") => [
    { value: "", label: noneLabel },
    ...valuesArray.filter(val => val !== "").map(val => ({ value: val, label: val })) // Exclude empty string from main options if "" is "none"
];

// For Yes/No mapped to specific string values
export const getYesNoOptions = (yesValue, noValue, noneLabel = "--- Not Set ---", includeNone = true) => {
    const options = [
        { value: yesValue, label: "Yes" },
        { value: noValue, label: "No" }
    ];
    if (includeNone) {
        return [{ value: "", label: noneLabel }, ...options];
    }
    return options;
};