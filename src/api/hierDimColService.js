// src/api/hierDimColService.js
import axios from 'axios';

// Assuming your controller for hier_dimcol is at /api/hierdimcols
const API_BASE_URL = 'http://localhost:5208/api/hierdimcols';

// Get all column associations for a specific hierarchy
export const getHierDimColsByHierarchyId = async (hierIdPk) => {
    if (!hierIdPk) throw new Error("Hierarchy ID is required.");
    const response = await axios.get(API_BASE_URL, { params: { hierIdPk } });
    // Assuming this returns the array directly or needs { data: ..., headers: ... }
    // For simplicity, let's assume it returns { data: [] } similar to other services
    return response.data; // Adjust if your API returns pagination headers for this too
};

// Get a specific hier_dimcol by its composite key
export const getHierDimCol = async (hierIdPk, dimcolIdPk) => {
    const response = await axios.get(`${API_BASE_URL}/${hierIdPk}/${dimcolIdPk}`);
    return response.data;
};

// Create a new association
export const createHierDimCol = async (hierDimColData) => {
    // DTO for create expects: HierIdPk, DimcolIdPk, HierDimLevel, HierDimRdlTypePresnameCol
    const payload = { ...hierDimColData };
    delete payload.hier_dimcol_timestamp; // Not sent on create

    // Remove potential navigation properties if they exist in form data
    delete payload.hierarchy;
    delete payload.dimcolumn;

    console.log("SENDING POST PAYLOAD to /api/hierdimcols:", JSON.stringify(payload, null, 2));
    const response = await axios.post(API_BASE_URL, payload);
    return response.data;
};

// Update an existing association
export const updateHierDimCol = async (hierIdPk, dimcolIdPk, updateData) => {
    // DTO for update expects: HierDimLevel, HierDimRdlTypePresnameCol, HierDimColTimestamp
    const payload = { ...updateData };

    // Ensure correct casing for timestamp for DTO
    if (payload.hier_dimcol_timestamp && !payload.HierDimColTimestamp) {
        payload.HierDimColTimestamp = payload.hier_dimcol_timestamp;
    }
    delete payload.hier_dimcol_timestamp;

    if (!payload.HierDimColTimestamp) {
        console.error("CRITICAL: HierDimColTimestamp is missing for update. Payload:", payload);
    }
    // Remove any PKs if they accidentally got into updateData
    delete payload.HierIdPk;
    delete payload.DimcolIdPk;
    delete payload.hierarchy;
    delete payload.dimcolumn;


    console.log(`FINAL PUT PAYLOAD to /api/hierdimcols/${hierIdPk}/${dimcolIdPk}:`, JSON.stringify(payload, null, 2));
    const response = await axios.put(`${API_BASE_URL}/${hierIdPk}/${dimcolIdPk}`, payload);
    return response.data; // Or expect 204 No Content
};

// Delete an association
export const deleteHierDimCol = async (hierIdPk, dimcolIdPk) => {
    await axios.delete(`${API_BASE_URL}/${hierIdPk}/${dimcolIdPk}`);
};