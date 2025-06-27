// Créez ce nouveau fichier : src/api/roleDimcolService.js

import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_URL = `${BASE_URL}/api/roledimcols`;

// Pour la page de liste globale (GET /)
const getAllPermissions = (params) => {
    return axios.get(API_URL, { params });
};

// Pour le manager sur la page d'un rôle (GET /byrole/{roleId})
const getPermissionsByRole = (roleId) => {
    return axios.get(`${API_URL}/byrole/${roleId}`);
};

// POST
const addPermission = (data) => {
    return axios.post(API_URL, data);
};

// PUT
const updatePermission = (roleId, dimcolId, data) => {
    return axios.put(`${API_URL}/${roleId}/${dimcolId}`, data);
};

// DELETE
const deletePermission = (roleId, dimcolId) => {
    return axios.delete(`${API_URL}/${roleId}/${dimcolId}`);
};

const roleDimcolService = {
    getAllPermissions,
    getPermissionsByRole,
    addPermission,
    updatePermission,
    deletePermission,
};

export default roleDimcolService;