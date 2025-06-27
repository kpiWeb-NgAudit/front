// src/api/rdlGroupService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_BASE_URL = `${BASE_URL}/api/rdlgroups`;

export const getAllRdlGroups = async () => {
    console.log("rdlGroupService: getAllRdlGroups called");
    try {
        const response = await axios.get(API_BASE_URL);
        // Backend GetRdlGroups returns ActionResult<IEnumerable<RdlGroupDto>>
        // So, response.data should be the array of RdlGroupDto
        return response.data; // Returns an array of RdlGroupDto
    } catch (error) {
        console.error("rdlGroupService: Error in getAllRdlGroups:", error.response?.data || error.message);
        throw error;
    }
};

// Optional: Get by ID if you ever need to display details of a single group
export const getRdlGroupById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`rdlGroupService: Error fetching RDL Group ${id}:`, error.response?.data || error.message);
        throw error;
    }
};