// src/api/rdlTypeService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/rdltypes';

export const getAllRdlTypes = async (params = {}) => { // Added params for potential filtering
    // params could be { rdlGroupIdPk: 'GENERAL' }
    console.log("rdlTypeService: getAllRdlTypes called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // Backend GetRdlTypes returns ActionResult<IEnumerable<RdlTypeDto>>
        return response.data; // Returns an array of RdlTypeDto
    } catch (error) {
        console.error("rdlTypeService: Error in getAllRdlTypes:", error.response?.data || error.message);
        throw error;
    }
};

// Optional: Get by ID
// export const getRdlTypeById = async (id) => {
//     const typeIdForApi = id === "" ? "_empty_" : id; // Handle special empty string case if API needs it
//     try {
//         const response = await axios.get(`${API_BASE_URL}/${typeIdForApi}`);
//         return response.data;
//     } catch (error) {
//         console.error(`rdlTypeService: Error fetching RDL Type ${id}:`, error.response?.data || error.message);
//         throw error;
//     }
// };