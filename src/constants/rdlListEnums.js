// src/constants/rdlListEnums.js
export const getDropdownOptions = (valuesArray, labelField = 'label', valueField = 'value') =>
    valuesArray.map(item => ({
        value: item[valueField] !== undefined ? item[valueField] : item,
        label: item[labelField] !== undefined ? item[labelField] : item
    }));

export const getOptionalDropdownOptions = (valuesArray, noneLabel = "--- Select (Optional) ---", labelField = 'label', valueField = 'value') => [
    { value: "", label: noneLabel },
    ...getDropdownOptions(valuesArray, labelField, valueField)
];
// Add any RDL List specific static options here if they exist