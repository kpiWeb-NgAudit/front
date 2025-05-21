// src/api/factService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/facts';



export const getAllFacts = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getFactById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createFact = async (factData) => {
    const response = await axios.post(API_URL, factData);
    return response.data;
};

export const updateFact = async (id, factData) => {
    const response = await axios.put(`${API_URL}/${id}`, factData);
    return response.data;
};

export const deleteFact = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

export const createFactFromPaste = async (factPasteData) => {
    const response = await axios.post(`${API_URL}/paste-create`, factPasteData);
    return response.data;
};