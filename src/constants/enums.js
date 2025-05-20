// src/constants/enums.js

export const FACT_TYPES = {
    FTSTD: "Standard Fact Table",
    FTNOTIME: "Fact Table without Time Dimension",
    FTBUDOBJ: "Budget/Objective Fact Table",
    FTWRBACK: "Write-Back enabled Fact Table",
};

export const FACT_DATA_FILE_TYPES = {
    TEXT: "Text",
    EXCELWK1: "Excel Workbook v1",
    EXCELWK2: "Excel Workbook v2",
    EXCELWK3: "Excel Workbook v3",
};

export const FACT_ZONE_SPES = {
    FZSPEN: "No (N)",
    FZSPEY: "Yes (Y)",
};

export const FACT_PARTITION_TYPES = {
    FPTNUL: "Null (No Partitioning)",
    FPTYEA: "Yearly Partition",
    FPTYEA3: "Yearly Partition (Type 3)", // Assuming YEA3 means something specific
};

// Helper to get options for select, e.g., [{ value: "FTSTD", label: "Standard Fact Table" }]
export const getEnumOptions = (enumObject) =>
    Object.entries(enumObject).map(([value, label]) => ({ value, label }));