// src/api/perspectiveFactAssociationService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


// Matches your PerspectiveFactAssociationsController route
const API_BASE_URL = `${BASE_URL}/api/perspective-fact-associations`;

// Get all fact associations for a specific perspective
export const getFactAssociationsByPerspectiveId = async (perspIdPk) => {
    if (!perspIdPk && perspIdPk !== 0) throw new Error("Perspective ID is required."); // Allow 0 if it's a valid ID
    console.log(`perspectiveFactAssociationService: getFactAssociationsByPerspectiveId called for perspIdPk: ${perspIdPk}`);
    try {
        const response = await axios.get(API_BASE_URL, { params: { perspIdPk } });
        // Backend returns array of PerspectiveFactAssociationDto
        return response.data;
    } catch (error) {
        console.error("perspectiveFactAssociationService: Error in getFactAssociationsByPerspectiveId:", error.response?.data || error.message);
        throw error;
    }
};

export const getAllPerspectiveFactAssociations = async (params = {}) => {
    // params could be { perspIdPk, factIdPk, pageNumber, pageSize }
    console.log("perspectiveFactAssociationService: getAllPerspectiveFactAssociations called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // Backend returns array of PerspectiveFactAssociationDto
        // If backend paginates this global list, return headers too.
        // For now, assume it might return all if not paginated, or component handles pagination params.
        return { data: response.data, headers: response.headers };
    } catch (error) {
        console.error("perspectiveFactAssociationService: Error in getAllPerspectiveFactAssociations:", error.response?.data || error.message);
        throw error;
    }
};

// Get all perspective associations for a specific fact (useful if managing from Fact side)
export const getPerspectiveAssociationsByFactId = async (factIdPk) => {
    if (!factIdPk && factIdPk !== 0) throw new Error("Fact ID is required.");
    console.log(`perspectiveFactAssociationService: getPerspectiveAssociationsByFactId called for factIdPk: ${factIdPk}`);
    try {
        const response = await axios.get(API_BASE_URL, { params: { factIdPk } });
        return response.data;
    } catch (error) {
        console.error("perspectiveFactAssociationService: Error in getPerspectiveAssociationsByFactId:", error.response?.data || error.message);
        throw error;
    }
};


export const createPerspectiveFactAssociation = async (associationData) => {
    // associationData should match CreatePerspectiveFactAssociationDto: { PerspIdPk, FactIdPk }
    const payload = { ...associationData };
    // Timestamp is server-generated for the persp_fact table itself
    delete payload.PerspFactTimestamp;

    console.log("SENDING POST PAYLOAD to create perspective-fact association:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        // Backend returns created PerspectiveFactAssociationDto (or the base entity)
        return response.data;
    } catch (error) {
        console.error("perspectiveFactAssociationService: Error creating association:", error.response?.data || error.message);
        throw error;
    }
};

// DELETE an association by its composite key
export const deletePerspectiveFactAssociation = async (perspIdPk, factIdPk) => {
    console.log(`perspectiveFactAssociationService: Deleting association for PerspID ${perspIdPk}, FactID ${factIdPk}`);
    try {
        await axios.delete(`${API_BASE_URL}/${perspIdPk}/${factIdPk}`);
    } catch (error) {
        console.error(`perspectiveFactAssociationService: Error deleting association:`, error.response?.data || error.message);
        throw error;
    }
};

// No UPDATE function is typically needed for a simple join table.
// To "update" an association (e.g., link a perspective to a *different* fact),
// you would delete the old association and create a new one.