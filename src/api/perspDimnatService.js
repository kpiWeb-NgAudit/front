// src/api/perspDimnatService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_BASE_URL = `${BASE_URL}/api/perspdimnats`;

// Get all dimension associations for a specific perspective
export const getDimensionAssociationsByPerspectiveId = async (perspectiveId) => {
    if (!perspectiveId && perspectiveId !== 0) throw new Error("Perspective ID is required.");
    console.log(`perspDimnatService: getDimensionAssociationsByPerspectiveId for perspectiveId: ${perspectiveId}`);
    try {
        // Utilise l'endpoint spécifique du contrôleur
        const response = await axios.get(`${API_BASE_URL}/byperspective/${perspectiveId}`);
        // Le contrôleur retourne un array de PerspDimnatDto
        return response.data;
    } catch (error) {
        console.error("perspDimnatService: Error in getDimensionAssociationsByPerspectiveId:", error.response?.data || error.message);
        throw error;
    }
};

// Pour la page de liste globale (si vous en créez une)
export const getAllPerspDimnatAssociations = async (params = {}) => {
    console.log("perspDimnatService: getAllPerspDimnatAssociations called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params }); // L'endpoint GET global
        // Le contrôleur retourne un array de PerspDimnatDetailDto
        return { data: response.data, headers: response.headers }; // Si pagination
    } catch (error) {
        console.error("perspDimnatService: Error in getAllPerspDimnatAssociations:", error.response?.data || error.message);
        throw error;
    }
};

export const createPerspDimnatAssociation = async (associationData) => {
    // associationData devrait correspondre à CreatePerspDimnatDto: { PerspId, DimId }
    const payload = { ...associationData };
    // Pas de timestamp à supprimer car le DTO de création est simple

    console.log("SENDING POST PAYLOAD to create persp-dimnat association:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        // Le backend retourne 201 sans corps, donc on peut retourner une confirmation ou la donnée envoyée
        return { ...payload, status: response.status };
    } catch (error) {
        console.error("perspDimnatService: Error creating association:", error.response?.data || error.message);
        throw error;
    }
};

export const deletePerspDimnatAssociation = async (perspectiveId, dimensionId) => {
    console.log(`perspDimnatService: Deleting association for Perspective ${perspectiveId}, Dimension ${dimensionId}`);
    try {
        await axios.delete(`${API_BASE_URL}/${perspectiveId}/${dimensionId}`);
        // Pas de contenu retourné en cas de succès (204)
    } catch (error) {
        console.error(`perspDimnatService: Error deleting association:`, error.response?.data || error.message);
        throw error;
    }
};