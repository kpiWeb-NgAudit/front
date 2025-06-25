// Créez ce nouveau fichier : src/api/factDbExtractV2Service.js

import axios from 'axios';

const API_URL = 'http://localhost:5208/api/factdbextractsV2';

// Pour la page de liste globale (GET /)
const getAllExtracts = (params) => {
    return axios.get(API_URL, { params });
};

// Pour le manager sur la page d'un fait (GET /byfact/{factId})
const getExtractsByFact = (factId) => {
    return axios.get(`${API_URL}/byfact/${factId}`);
};

// POST
const addExtract = (data) => {
    return axios.post(API_URL, data);
};

// PUT
const updateExtract = (key, data) => {
    const { factId, prodDataSourceId, dateInsert } = key;
    // La date doit être encodée pour l'URL
    const encodedDate = encodeURIComponent(dateInsert);
    return axios.put(`${API_URL}/${factId}/${prodDataSourceId}/${encodedDate}`, data);
};

// DELETE
const deleteExtract = (key) => {
    const { factId, prodDataSourceId, dateInsert } = key;
    const encodedDate = encodeURIComponent(dateInsert);
    return axios.delete(`${API_URL}/${factId}/${prodDataSourceId}/${encodedDate}`);
};

const factDbExtractV2Service = {
    getAllExtracts,
    getExtractsByFact,
    addExtract,
    updateExtract,
    deleteExtract,
};

export default factDbExtractV2Service;