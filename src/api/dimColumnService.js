// src/api/dimColumnService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_BASE_URL = `${BASE_URL}/api/dimcolumns`;

export const getAllDimColumns = async (params = {}) => {
    // params can include { dimensionId: 123, pageNumber: 1, pageSize: 20 }
    console.log("dimColumnService: getAllDimColumns called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        return { data: response.data, headers: response.headers }; // For pagination
    } catch (error) {
        console.error("dimColumnService: Error in getAllDimColumns:", error.response?.data || error.message);
        throw error;
    }
};

export const getDimColumnById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`dimColumnService: Error fetching dimcolumn ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createDimColumn = async (dimColumnData) => {
    // dimColumnData should match CreateDimColumnDto
    const payload = { ...dimColumnData };
    delete payload.dimcol_timestamp; // Not sent on create (DTO uses PascalCase: DimcolTimestamp)
    delete payload.dimension;       // Remove potential navigation property
    delete payload.hier_dimcols;    // Remove potential navigation property

    console.log("SENDING POST PAYLOAD to /api/dimcolumns:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data;
    } catch (error) {
        console.error("dimColumnService: Error creating dimcolumn:", error.response?.data || error.message);
        throw error;
    }
};

export const updateDimColumn = async (id, dimColumnData) => {
    // dimColumnData should match UpdateDimColumnDto
    const payload = { ...dimColumnData };

    // Normalize timestamp key to DTO expected key (DimcolTimestamp)
    if (payload.dimcol_timestamp && !payload.DimcolTimestamp) {
        payload.DimcolTimestamp = payload.dimcol_timestamp;
    }
    delete payload.dimcol_timestamp; // Remove snake_case version

    if (!payload.DimcolTimestamp) {
        console.warn("Warning: DimcolTimestamp is missing for update operation. Payload:", payload);
        // Depending on backend, this might be okay if timestamp is nullable or not strictly for concurrency here
    }
    delete payload.dimension;
    delete payload.hier_dimcols;
    delete payload.DimcolIdPk; // PK is in URL, not body for update typically


    console.log(`FINAL PUT PAYLOAD to /api/dimcolumns/${id}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
        return response.data; // Or handle 204 No Content
    } catch (error) {
        console.error(`dimColumnService: Error updating dimcolumn ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteDimColumn = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error(`dimColumnService: Error deleting dimcolumn ${id}:`, error.response?.data || error.message);
        throw error;
    }
};