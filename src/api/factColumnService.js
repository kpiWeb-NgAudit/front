// src/api/factColumnService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_BASE_URL = `${BASE_URL}/api/factcolumns`;

export const getAllFactColumns = async (params = {}) => {
    // params: { factIdPk: 1, pageNumber: 1, pageSize: 10 }
    console.log("factColumnService: getAllFactColumns called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // Backend GetFactColumns returns FactColumnDto which includes related names
        return { data: response.data, headers: response.headers }; // For pagination
    } catch (error) {
        console.error("factColumnService: Error in getAllFactColumns:", error.response?.data || error.message);
        throw error;
    }
};

export const getFactColumnById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data; // Returns a single FactColumnDto
    } catch (error) {
        console.error(`factColumnService: Error fetching fact column ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createFactColumn = async (factColumnData) => {
    // factColumnData should match CreateFactColumnDto
    const payload = { ...factColumnData };
    delete payload.FactcolTimestamp; // Not in CreateFactColumnDto
    delete payload.FactName;         // Display only
    delete payload.DimensionColumnName; // Display only
    delete payload.Fact;             // Nav prop
    delete payload.DimColumn;        // Nav prop


    console.log("SENDING POST PAYLOAD to /api/factcolumns:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data; // Returns created FactColumnDto
    } catch (error) {
        console.error("factColumnService: Error creating fact column:", error.response?.data || error.message);
        throw error;
    }
};

export const updateFactColumn = async (id, factColumnData) => {
    // factColumnData should match UpdateFactColumnDto
    const payload = { ...factColumnData };

    if (payload.factcol_timestamp && !payload.FactcolTimestamp) {
        payload.FactcolTimestamp = payload.factcol_timestamp;
    }
    delete payload.factcol_timestamp;

    if (!payload.FactcolTimestamp) {
        console.warn("Warning: FactcolTimestamp missing for update. Payload:", payload);
    }
    delete payload.FactcolIdPk; // PK from route
    delete payload.FactName;
    delete payload.DimensionColumnName;
    delete payload.Fact;
    delete payload.DimColumn;

    console.log(`FINAL PUT PAYLOAD to /api/factcolumns/${id}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error(`factColumnService: Error updating fact column ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteFactColumn = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error(`factColumnService: Error deleting fact column ${id}:`, error.response?.data || error.message);
        throw error;
    }
};