// src/api/themeService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/themes'; // Your ThemesController base URL

export const getAllThemes = async () => {
    // No pagination needed if the list is small and fixed
    console.log("themeService: getAllThemes called");
    try {
        const response = await axios.get(API_BASE_URL);
        // Backend GetThemes returns ActionResult<IEnumerable<ThemeDto>>
        // So, response.data should be the array of ThemeDto
        return response.data; // Returns an array of ThemeDto
    } catch (error) {
        console.error("themeService: Error in getAllThemes:", error.response?.data || error.message);
        throw error;
    }
};

export const getThemeById = async (id) => {
    // Handle the special case for empty string PK if needed by API
    const themeIdForApi = id === "" ? "_empty_" : id;
    try {
        const response = await axios.get(`${API_BASE_URL}/${themeIdForApi}`);
        return response.data; // Returns a single ThemeDto
    } catch (error) {
        console.error(`themeService: Error fetching theme ${id}:`, error.response?.data || error.message);
        throw error;
    }
};
