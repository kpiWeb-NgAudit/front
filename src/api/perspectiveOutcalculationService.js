// src/api/perspectiveOutcalculationService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/perspective-outcalculations';

export const getAllPerspectiveOutcalculations = async (params = {}) => {
    // params: { perspIdPk: 1, outcalculation: 'XYZ', pageNumber, pageSize }
    console.log("perspectiveOutcalculationService: getAll called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // Expects { data: Array<PerspectiveOutcalculationDto>, headers: ... }
        return { data: response.data, headers: response.headers };
    } catch (error) {
        console.error("perspectiveOutcalculationService: Error in getAll:", error.response?.data || error.message);
        throw error;
    }
};

// Get a specific association by its composite key (might not be needed for top-level UI if no edit page)
export const getPerspectiveOutcalculation = async (perspIdPk, outcalculation) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${perspIdPk}/${encodeURIComponent(outcalculation)}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching association for Persp ${perspIdPk}, Outcalc ${outcalculation}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createPerspectiveOutcalculation = async (associationData) => {
    // associationData: { PerspIdPk, Outcalculation }
    const payload = { ...associationData };
    console.log("SENDING POST PAYLOAD to create perspective-outcalculation:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data; // Returns created PerspectiveOutcalculationDto
    } catch (error) {
        console.error("Error creating perspective-outcalculation:", error.response?.data || error.message);
        throw error;
    }
};

export const deletePerspectiveOutcalculation = async (perspIdPk, outcalculation) => {
    console.log(`Deleting perspective-outcalculation for Persp ${perspIdPk}, Outcalc ${outcalculation}`);
    try {
        await axios.delete(`${API_BASE_URL}/${perspIdPk}/${encodeURIComponent(outcalculation)}`);
    } catch (error) {
        console.error(`Error deleting perspective-outcalculation:`, error.response?.data || error.message);
        throw error;
    }
};