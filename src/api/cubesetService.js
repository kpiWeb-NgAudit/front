// src/api/cubesetService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_BASE_URL = `${BASE_URL}/api/cubesets`;

export const getAllCubesets = async (params = {}) => {
    // params can include { cubeIdPk: 'customerXYZ', pageNumber: 1, pageSize: 10 }
    console.log("cubesetService: getAllCubesets called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        console.log(`%c[API RESPONSE] Received ${response.data.length} cubesets. Data:`, 'background: #222; color: #bada55', response.data);
        return { data: response.data, headers: response.headers }; // For pagination
    } catch (error) {
        console.error("cubesetService: Error in getAllCubesets:", error.response?.data || error.message);
        throw error;
    }
};

export const getNextPresOrder = async (cubeIdPk) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/next-order/${cubeIdPk}`);
        return response.data; // Devrait retourner un nombre, ex: 5
    } catch (error) {
        console.error(`cubesetService: Error fetching next presentation order for ${cubeIdPk}:`, error.response?.data || error.message);
        throw error; // Laissez le composant gérer l'erreur
    }
};

export const getCubesetById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`cubesetService: Error fetching cubeset ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createCubeset = async (cubesetData) => {
    // cubesetData should match CreateCubesetDto
    const payload = { ...cubesetData };
    delete payload.cubeset_timestamp; // Not sent on create (DTO uses PascalCase: CubesetTimestamp)

    // Remove potential navigation property if it exists in form data
    delete payload.customer;

    console.log("SENDING POST PAYLOAD to /api/cubesets:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data;
    } catch (error) {
        console.error("cubesetService: Error creating cubeset:", error.response?.data || error.message);
        throw error;
    }
};

export const updateCubeset = async (id, cubesetData) => {
    // cubesetData should match UpdateCubesetDto
    const payload = { ...cubesetData };

    // Normalize timestamp key
    if (payload.cubeset_timestamp && !payload.CubesetTimestamp) {
        payload.CubesetTimestamp = payload.cubeset_timestamp;
    }
    delete payload.cubeset_timestamp;

    if (!payload.CubesetTimestamp) {
        console.warn("Warning: CubesetTimestamp missing for update. Payload:", payload);
    }

    delete payload.customer; // Remove navigation property
    delete payload.CubesetIdPk; // PK is in URL

    console.log(`FINAL PUT PAYLOAD to /api/cubesets/${id}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
        return response.data; // Or handle 204 No Content
    } catch (error) {
        console.error(`cubesetService: Error updating cubeset ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteCubeset = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error(`cubesetService: Error deleting cubeset ${id}:`, error.response?.data || error.message);
        throw error;
    }
};