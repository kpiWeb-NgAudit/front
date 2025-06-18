// src/api/rdlListService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/rdllists';

export const getAllRdlLists = async (params = {}) => {
    // params: { cubeIdPk, themeIdPk, rdlTypeIdPk, pageNumber, pageSize }
    console.log("rdlListService: getAllRdlLists called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // API returns array of RdlListDto directly in response.data based on your cURL
        return { data: response.data, headers: response.headers }; // Assuming pagination headers might be added later
    } catch (error) {
        console.error("rdlListService: Error in getAllRdlLists:", error.response?.data || error.message);
        throw error;
    }
};

export const getRdlListById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data; // Returns a single RdlListDto
    } catch (error) {
        console.error(`rdlListService: Error fetching RDL List ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createRdlList = async (rdlListData) => {
    // rdlListData should match CreateRdlListDto
    const payload = { ...rdlListData }; // DTOs use PascalCase
    delete payload.RdlListTimestamp; // Not in CreateRdlListDto

    // Remove potential navigation properties if they were somehow included
    delete payload.CustomerName;
    delete payload.ThemeLabel;
    delete payload.RdlTypeName;
    // And actual nav props if form state picked them up
    delete payload.cube_id_pkNavigation;
    delete payload.theme_id_pkNavigation;
    delete payload.rdltype_id_pkNavigation;


    console.log("SENDING POST PAYLOAD to /api/rdllists:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        // Expecting a 201 Created with the full RdlListDto of the created item
        return response.data;
    } catch (error) {
        console.error("rdlListService: Error creating RDL List:", error.response?.data || error.message);
        throw error;
    }
};

export const updateRdlList = async (id, rdlListData) => {
    // rdlListData should match UpdateRdlListDto
    const payload = { ...rdlListData };

    // Normalize timestamp key
    if (payload.rdlListTimestamp && !payload.RdlListTimestamp) { // if form uses snake_case
        payload.RdlListTimestamp = payload.rdlListTimestamp;
    } else if (payload.rdllist_timestamp && !payload.RdlListTimestamp) { // if entity snake_case from initialData
        payload.RdlListTimestamp = payload.rdllist_timestamp;
    }
    delete payload.rdlListTimestamp; // DTO uses PascalCase
    delete payload.rdllist_timestamp;


    if (!payload.RdlListTimestamp) {
        console.warn("Warning: RdlListTimestamp missing for update. Payload:", payload);
    }
    // Remove PK from body for PUT
    delete payload.RdlListIdPk;
    // Remove display names
    delete payload.CustomerName;
    delete payload.ThemeLabel;
    delete payload.RdlTypeName;
    delete payload.cube_id_pkNavigation;
    delete payload.theme_id_pkNavigation;
    delete payload.rdltype_id_pkNavigation;

    console.log(`FINAL PUT PAYLOAD to /api/rdllists/${id}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
        return response.data; // Or handle 204 No Content
    } catch (error) {
        console.error(`rdlListService: Error updating RDL List ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteRdlList = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error(`rdlListService: Error deleting RDL List ${id}:`, error.response?.data || error.message);
        throw error;
    }
};