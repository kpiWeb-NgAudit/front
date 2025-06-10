// src/api/dimensionService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/dimensions'; // Adjust if your port/base changes

// Fetch all dimensions with optional query parameters
export const getAllDimensions = async (params = {}) => {
    // params could be { cubeIdPk: 'someCustomer', sortBy: 'dimTname', pageNumber: 1, pageSize: 20 }
    const response = await axios.get(API_BASE_URL, { params });
    // If your API returns pagination data in headers, you might want to process it here or in the component
    // For now, just returning the data array
    return response.data;
};

export const getDimensionById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
};

export const createDimension = async (dimensionData) => {
    const payload = { ...dimensionData };

    // Fields managed by the server on creation
    delete payload.dim_lastupdate;
    delete payload.dim_timestamp;

    // Navigation properties (if they accidentally get into formData)
    delete payload.cube_id_pkNavigation;
    delete payload.dimcolumns;
    delete payload.hierarchies;
    delete payload.persp_dimnats;

    console.log("SENDING POST PAYLOAD to /api/dimensions:", JSON.stringify(payload, null, 2));
    const response = await axios.post(API_BASE_URL, payload);
    return response.data;
};

export const updateDimension = async (id, dimensionData) => {
    const payload = { ...dimensionData };

    // Field managed by the server on update
    delete payload.dim_lastupdate;

    // Ensure timestamp is present for concurrency
    if (!payload.dim_timestamp) {
        console.error("CRITICAL: dim_timestamp is missing for update operation. Payload:", payload);
        // This could lead to update failures or overwriting concurrent changes
    }

    // Navigation properties
    delete payload.cube_id_pkNavigation;
    delete payload.dimcolumns;
    delete payload.hierarchies;
    delete payload.persp_dimnats;

    console.log(`FINAL PUT PAYLOAD to /api/dimensions/${id}:`, JSON.stringify(payload, null, 2));
    const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
    return response.data; // PUT might return NoContent (204) or the updated object (200)
    // If 204, response.data will be undefined. Adjust if necessary.
};

export const deleteDimension = async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
    // Delete typically returns 204 No Content, so no response.data
};