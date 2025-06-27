// src/api/sourceService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_BASE_URL = `${BASE_URL}/api/sources`;

export const getAllSources = async (params = {}) => {
    // params: { cubeIdPk: 'customerXYZ', pageNumber: 1, pageSize: 10 }
    console.log("sourceService: getAllSources called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        return { data: response.data, headers: response.headers }; // For pagination
    } catch (error) {
        console.error("sourceService: Error in getAllSources:", error.response?.data || error.message);
        throw error;
    }
};

export const getSourceById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data; // Backend returns the source entity
    } catch (error) {
        console.error(`sourceService: Error fetching source ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createSource = async (sourceData) => {
    // sourceData should match CreateSourceDto
    const payload = { ...sourceData }; // DTO uses PascalCase
    // Timestamp is server-generated, not in CreateSourceDto
    delete payload.SourceTimestamp; // Or source_timestamp if that's the form key
    delete payload.cube_id_pkNavigation; // Remove navigation prop

    console.log("SENDING POST PAYLOAD to /api/sources:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data;
    } catch (error) {
        console.error("sourceService: Error creating source:", error.response?.data || error.message);
        throw error;
    }
};

export const updateSource = async (id, sourceData) => {
    // sourceData should match UpdateSourceDto
    const payload = { ...sourceData }; // DTO uses PascalCase

    // Normalize timestamp key for DTO
    if (payload.source_timestamp && !payload.SourceTimestamp) {
        payload.SourceTimestamp = payload.source_timestamp;
    }
    delete payload.source_timestamp;

    if (!payload.SourceTimestamp) {
        console.warn("Warning: SourceTimestamp missing for update. Payload:", payload);
    }
    delete payload.cube_id_pkNavigation;
    delete payload.SourceIdPk; // PK is in URL

    console.log(`FINAL PUT PAYLOAD to /api/sources/${id}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
        return response.data; // Or handle 204 No Content
    } catch (error) {
        console.error(`sourceService: Error updating source ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteSource = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error(`sourceService: Error deleting source ${id}:`, error.response?.data || error.message);
        throw error;
    }
};