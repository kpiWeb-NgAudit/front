// (Example, if you move it to a shared utils or re-declare in roleEnums.js)
// src/constants/sharedEnums.js or src/utils/formHelpers.js
export const getNullableBooleanOptions = (trueLabel = "Yes", falseLabel = "No", noneLabel = "--- (Not Set) ---") => [
    { value: "", label: noneLabel },      // Represents null
    { value: "true", label: trueLabel },  // Represents true
    { value: "false", label: falseLabel } // Represents false
];