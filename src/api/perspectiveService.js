// src/api/perspectiveService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/perspectives';

export const getAllPerspectives = async (params = {}) => {
    // params: { cubeIdPk: 'customerXYZ', pageNumber: 1, pageSize: 10 }
    console.log("perspectiveService: getAllPerspectives called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // Backend GetPerspectives returns PerspectiveDto which includes CustomerName
        return { data: response.data, headers: response.headers }; // For pagination
    } catch (error) {
        console.error("perspectiveService: Error in getAllPerspectives:", error.response?.data || error.message);
        throw error;
    }
};

export const getPerspectiveById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data; // Returns a single PerspectiveDto
    } catch (error) {
        console.error(`perspectiveService: Error fetching perspective ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createPerspective = async (perspectiveData) => {
    // perspectiveData should match CreatePerspectiveDto
    const payload = { ...perspectiveData }; // DTO uses PascalCase
    delete payload.PerspTimestamp; // Not in CreatePerspectiveDto
    delete payload.CustomerName;   // Display-only field in DTOs
    delete payload.cube_id_pkNavigation; // Remove navigation prop if present

    console.log("SENDING POST PAYLOAD to /api/perspectives:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data; // Returns created PerspectiveDto
    } catch (error) {
        console.error("perspectiveService: Error creating perspective:", error.response?.data || error.message);
        throw error;
    }
};

export const updatePerspective = async (id, perspectiveData) => {
    // perspectiveData should match UpdatePerspectiveDto
    const payload = { ...perspectiveData }; // DTO uses PascalCase

    // Normalize timestamp key
    if (payload.persp_timestamp && !payload.PerspTimestamp) {
        payload.PerspTimestamp = payload.persp_timestamp;
    }
    delete payload.persp_timestamp;

    if (!payload.PerspTimestamp) {
        console.warn("Warning: PerspTimestamp missing for update. Payload:", payload);
    }
    delete payload.CustomerName;
    delete payload.PerspIdPk; // PK is in URL
    delete payload.cube_id_pkNavigation;


    console.log(`FINAL PUT PAYLOAD to /api/perspectives/${id}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
        return response.data; // Or handle 204 No Content
    } catch (error) {
        console.error(`perspectiveService: Error updating perspective ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deletePerspective = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error(`perspectiveService: Error deleting perspective ${id}:`, error.response?.data || error.message);
        throw error;
    }
};