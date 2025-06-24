// src/api/calcTypeService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/calctypes'; // Your CalcTypesController base URL

export const getAllCalcTypes = async () => {
    console.log("calcTypeService: getAllCalcTypes called");
    try {
        const response = await axios.get(API_BASE_URL);
        // Backend GetCalcTypes returns ActionResult<IEnumerable<CalcTypeDto>>
        // So, response.data should be the array of CalcTypeDto
        return response.data; // Returns an array of CalcTypeDto
    } catch (error) {
        console.error("calcTypeService: Error in getAllCalcTypes:", error.response?.data || error.message);
        throw error;
    }
};

export const getCalcTypeById = async (id) => {
    // Handle the special case for empty string PK if your API controller needs it
    // const typeIdForApi = id === "" ? "_empty_" : id; // If API uses a placeholder
    const typeIdForApi = id; // Assuming API can handle empty string in route if needed, or it's not a valid ID to fetch
    try {
        const response = await axios.get(`${API_BASE_URL}/${typeIdForApi}`);
        return response.data; // Returns a single CalcTypeDto
    } catch (error) {
        console.error(`calcTypeService: Error fetching CalcType ${id}:`, error.response?.data || error.message);
        throw error;
    }
};