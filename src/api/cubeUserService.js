// src/api/cubeUserService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/cubeusers'; // Your CubeUsersController base URL

// Get all user associations, typically filtered by cubeIdPk or userIdPk
export const getCubeUserAssociations = async (params = {}) => {
    // params: { cubeIdPk: 'CUST1', userIdPk: 'USERA' }
    console.log("cubeUserService: getCubeUserAssociations called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // Backend returns CubeUserDto which includes related names
        return response.data; // Returns an array of CubeUserDto
    } catch (error) {
        console.error("cubeUserService: Error in getCubeUserAssociations:", error.response?.data || error.message);
        throw error;
    }
};

// Get a specific association by its composite key
export const getCubeUserAssociation = async (cubeIdPk, userIdPk) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${cubeIdPk}/${userIdPk}`);
        return response.data; // Returns a single CubeUserDto
    } catch (error) {
        console.error(`cubeUserService: Error fetching association for ${cubeIdPk}-${userIdPk}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createCubeUserAssociation = async (associationData) => {
    // associationData should match CreateCubeUserDto:
    // { CubeIdPk, UserIdPk, RoleIdPk, CubeUserWhenSendStatsIfAdmin }
    const payload = { ...associationData };
    // Timestamp is server-generated for the cube_user table itself
    delete payload.CubeUserTimestamp; // Not part of CreateCubeUserDto

    console.log("SENDING POST PAYLOAD to /api/cubeusers:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data; // Returns the created CubeUserDto (or the base entity)
    } catch (error) {
        console.error("cubeUserService: Error creating association:", error.response?.data || error.message);
        throw error;
    }
};

export const updateCubeUserAssociation = async (cubeIdPk, userIdPk, updateData) => {
    // updateData should match UpdateCubeUserDto:
    // { RoleIdPk, CubeUserWhenSendStatsIfAdmin, CubeUserTimestamp }
    const payload = { ...updateData };

    // Ensure DTO key for timestamp if it came from form with different casing
    if (payload.cube_user_timestamp && !payload.CubeUserTimestamp) {
        payload.CubeUserTimestamp = payload.cube_user_timestamp;
    }
    delete payload.cube_user_timestamp;

    if (!payload.CubeUserTimestamp) {
        console.error("CRITICAL: CubeUserTimestamp is missing for update. Payload:", payload);
    }
    // PKs are in URL, not body for DTO
    delete payload.CubeIdPk;
    delete payload.UserIdPk;

    console.log(`FINAL PUT PAYLOAD to /api/cubeusers/${cubeIdPk}/${userIdPk}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${cubeIdPk}/${userIdPk}`, payload);
        // Backend returns NoContent (204)
        return response.status === 204 ? { ...updateData, CubeIdPk: cubeIdPk, UserIdPk: userIdPk } : response.data; // Return something usable or just status
    } catch (error) {
        console.error(`cubeUserService: Error updating association for ${cubeIdPk}-${userIdPk}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteCubeUserAssociation = async (cubeIdPk, userIdPk) => {
    try {
        await axios.delete(`${API_BASE_URL}/${cubeIdPk}/${userIdPk}`);
    } catch (error) {
        console.error(`cubeUserService: Error deleting association for ${cubeIdPk}-${userIdPk}:`, error.response?.data || error.message);
        throw error;
    }
};