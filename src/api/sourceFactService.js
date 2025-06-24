// src/api/sourceFactService.js
import axios from 'axios';

const API_URL = 'http://localhost:5208/api/sourcefacts'; // Assurez-vous que l'URL de base est correcte

// Récupérer toutes les associations pour une source donnée
const getSourceFactsBySource = (sourceId) => {
    return axios.get(`${API_URL}/bysource/${sourceId}`);
};

// Ajouter une nouvelle association
const addSourceFact = (data) => {
    return axios.post(API_URL, data);
};

// Mettre à jour une association existante
const updateSourceFact = (sourceId, factId, data) => {
    // Le DTO de mise à jour attend nbDaysLoad, autodoc, et timestamp
    return axios.put(`${API_URL}/${sourceId}/${factId}`, data);
};

// Supprimer une association
const deleteSourceFact = (sourceId, factId) => {
    return axios.delete(`${API_URL}/${sourceId}/${factId}`);
};

const getAllSourceFacts = () => {
    return axios.get(API_URL);
};

const sourceFactService = {
    getAllSourceFacts,
    getSourceFactsBySource,
    addSourceFact,
    updateSourceFact,
    deleteSourceFact,
};

export default sourceFactService;