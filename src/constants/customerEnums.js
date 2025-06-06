// src/constants/customerEnums.js

export const CUST_CUBE_TYPES = ["CTFIN2012", "CTYFI3467", "CTYPEFIN", "CTYPECOM", "CTYAMLK"];
export const CUST_OS_TYPES = ["OTHER", "UNIX", "WIN"];
export const CUST_DB_TYPES = ["SqlServ", "Oracle", "ODBC"];
export const CUST_ERP_TYPES = ["GERS", "ADOV6", "SAGE500", "DEMOADO", "ADO140", "ADO130", "KPITEST", "DEMOSTD", "DEMOFIN", "OTHER"];
export const CUST_REFRESH_FRQS = ["RSAT", "RSATMON", "RFRISAT", "RFRI", "RTHU", "RWED", "RTUE", "RMON", "RALL", "RNEVER"];
export const CUST_REFRESH_FRQ_MONTHS = ["RM2805", "RM28", "RM7", "RM6", "RM5", "RM4", "RM3", "RM2", "RM1", "RNEVER"];
export const CUST_RDL_INTERWIDLENS = ["RIWL_NO", "RIWL_A4"];
export const CUST_LANGUAGES = ["ENG", "FRA"];
export const CUST_RDL_CURRENCY_FORMATS = ["RCFC2", "RCFC0"];
export const CUBE_DAILY_TASK_TRIGGERS = ["DTT0", "DTT1", "DTT2", "DTT3", "DTT22", "DTTOND"];
export const CUBE_LOCAL_CUB_GENERATES = ["LCGN", "LCGY"];
export const CUST_SHOW_FISC_MEASURE_AND_SETS = ["SFMSN", "SFMSY"];
export const CUST_SHOW_PCT_DIFFERENCE_BASE100S = ["SPDBN", "SPDBY"];
export const CUBE_DIM_TIME_PK_MANAGERS = ["DTPKV3", "DTPKV2", "DTPKV1"];
export const CUBE_GLOBAL_PERSPECTIVES = ["GPHID", "GPSHOW", "GPPART"];
export const CUBE_DISTINCT_COUNT_PARTITIONS = ["DCPNO", "DCPYES"];
export const CUBE_TYPE_NORMAL_REPLICAS = ["REPLICASLAVE", "REPLICAMASTER", "NORMAL"];

// Helper to create options for select dropdowns for required fields
export const getDropdownOptions = (valuesArray) =>
    valuesArray.map(val => ({ value: val, label: val }));

// Helper for optional fields, includes a "none" or empty option
export const getOptionalDropdownOptions = (valuesArray, noneLabel = "--- Select (Optional) ---") => [
    { value: "", label: noneLabel }, // Representing null or empty string for optional
    ...valuesArray.map(val => ({ value: val, label: val }))
];