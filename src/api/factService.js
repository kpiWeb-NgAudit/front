// src/api/factService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/facts'; // Adjust if your port/base changes

// Fetch all facts with optional query parameters
export const getAllFacts = async (params = {}) => {
    // params could be { cubeIdPk: 'someCustomer', pageNumber: 1, pageSize: 20 }
    const response = await axios.get(API_BASE_URL, { params });
    // You might want to return response.headers as well if you need pagination info
    return { data: response.data, headers: response.headers };
};

export const getFactById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
};

export const createFact = async (factData) => {
    const payload = { ...factData };

    // Fields managed by the server on creation
    delete payload.fact_lastupdate;
    delete payload.fact_timestamp;

    // Navigation properties (if they accidentally get into formData)
    delete payload.cube_id_pkNavigation;
    delete payload.factcolumns;
    delete payload.factmeasures;
    delete payload.persp_facts;


    console.log("SENDING POST PAYLOAD to /api/facts:", JSON.stringify(payload, null, 2));
    const response = await axios.post(API_BASE_URL, payload);
    return response.data;
};

export const updateFact = async (id, factData) => {
    const payload = { ...factData };

    delete payload.fact_lastupdate; // Server sets this

    if (!payload.FactTimestamp && !payload.fact_timestamp) { // Check both potential casings from form/data
        console.error("CRITICAL: FactTimestamp/fact_timestamp is missing for update operation. Payload:", payload);
    } else if (payload.fact_timestamp && !payload.FactTimestamp) { // Ensure DTO casing if backend casing exists
        payload.FactTimestamp = payload.fact_timestamp;
    }
    delete payload.fact_timestamp; // Remove snake_case if present


    // Navigation properties
    delete payload.cube_id_pkNavigation;
    delete payload.factcolumns;
    delete payload.factmeasures;
    delete payload.persp_facts;


    console.log(`FINAL PUT PAYLOAD to /api/facts/${id}:`, JSON.stringify(payload, null, 2));
    const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
    return response.data;
};

export const deleteFact = async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
};