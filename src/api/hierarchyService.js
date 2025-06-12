// src/api/hierarchyService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/hierarchies';

export const getAllHierarchies = async (params = {}) => {
    // params could be { dimIdPk: 123, pageNumber: 1, pageSize: 10 }
    const response = await axios.get(API_BASE_URL, { params });
    return { data: response.data, headers: response.headers }; // For pagination
};

export const getHierarchyById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
};

export const createHierarchy = async (hierarchyData) => {
    const payload = { ...hierarchyData };

    // Fields managed by the server on creation
    delete payload.hier_timestamp; // Backend uses PascalCase DTO: HierTimestamp

    // Navigation properties
    delete payload.dim_id_pkNavigation;
    delete payload.hierlevels;
    delete payload.persp_hiers;


    console.log("SENDING POST PAYLOAD to /api/hierarchies:", JSON.stringify(payload, null, 2));
    const response = await axios.post(API_BASE_URL, payload);
    return response.data;
};

export const updateHierarchy = async (id, hierarchyData) => {
    const payload = { ...hierarchyData };

    // Ensure correct casing for timestamp for DTO if it came from form state with different casing
    if (payload.hier_timestamp && !payload.HierTimestamp) {
        payload.HierTimestamp = payload.hier_timestamp;
    }
    delete payload.hier_timestamp; // Remove snake_case if present

    if (!payload.HierTimestamp) {
        console.error("CRITICAL: HierTimestamp is missing for update. Payload:", payload);
    }

    // Navigation properties
    delete payload.dim_id_pkNavigation;
    delete payload.hierlevels;
    delete payload.persp_hiers;

    console.log(`FINAL PUT PAYLOAD to /api/hierarchies/${id}:`, JSON.stringify(payload, null, 2));
    const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
    return response.data;
};

export const deleteHierarchy = async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
};