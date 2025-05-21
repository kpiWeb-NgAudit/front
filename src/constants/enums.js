export const FactTypeEnum = {
    FTSTD: "FTSTD",
    FTNOTIME: "FTNOTIME",
    FTBUDOBJ: "FTBUDOBJ",
    FTWRBACK: "FTWRBACK",
};
export const FACT_TYPES = {
    FTSTD: "Standard Fact Table",
    FTNOTIME: "Fact Table without Time Dimension",
    FTBUDOBJ: "Budget/Objective Fact Table",
    FTWRBACK: "Write-Back enabled Fact Table",
};

export const FactZoneSpeEnum = {
    FZSPEN: "FZSPEN",
    FZSPEY: "FZSPEY",
};
export const FACT_ZONE_SPES = {
    FZSPEN: "No (N)",
    FZSPEY: "Yes (Y)",
};

export const FactPartitionTypeEnum = {
    FPTNUL: "FPTNUL",
    FPTYEA: "FPTYEA",
    FPTYEA3: "FPTYEA3",
};
export const FACT_PARTITION_TYPES = {
    FPTNUL: "Null (No Partitioning)",
    FPTYEA: "Yearly Partition",
    FPTYEA3: "Yearly Partition (Type 3)",
};

export const FactFactDataFileTypeEnum = { // Added this if needed for defaults
    TEXT: "TEXT",
    EXCELWK1: "EXCELWK1",
    EXCELWK2: "EXCELWK2",
    EXCELWK3: "EXCELWK3"
};
export const FACT_DATA_FILE_TYPES = {
    TEXT: "Text",
    EXCELWK1: "Excel Workbook v1",
    EXCELWK2: "Excel Workbook v2",
    EXCELWK3: "Excel Workbook v3",
};

// Helper for <select> options in forms, not directly used in FactList display
export const getEnumOptions = (enumObject) =>
    Object.entries(enumObject).map(([value, label]) => ({ value, label }));