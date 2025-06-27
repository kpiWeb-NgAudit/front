// src/api/userService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_BASE_URL = `${BASE_URL}/api/users`;

export const getAllUsers = async (params = {}) => {
    console.log("userService: getAllUsers called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        return { data: response.data, headers: response.headers }; // For pagination
    } catch (error) {
        console.error("userService: Error in getAllUsers:", error.response?.data || error.message);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data; // Backend should not return password hash
    } catch (error) {
        console.error(`userService: Error fetching user ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createUser = async (userData) => {
    // userData should match CreateUserDto (includes Password, ConfirmPassword)
    const payload = { ...userData };
    // Server handles hashing, no special client-side deletion needed for password fields if DTO is correct
    // Remove navigation properties if they ever get in
    delete payload.cube_users;
    delete payload.role_users;


    console.log("SENDING POST PAYLOAD to /api/users:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data; // Returns created user (without password hash ideally)
    } catch (error) {
        console.error("userService: Error creating user:", error.response?.data || error.message);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    // userData should match UpdateUserDto (NO Password fields)
    const payload = { ...userData };

    // Normalize timestamp key
    if (payload.user_timestamp && !payload.UserTimestamp) {
        payload.UserTimestamp = payload.user_timestamp;
    }
    delete payload.user_timestamp;

    if (!payload.UserTimestamp) {
        console.warn("Warning: UserTimestamp missing for update. Payload:", payload);
    }

    // Ensure password fields are not sent for general update
    delete payload.Password;
    delete payload.ConfirmPassword;
    delete payload.OldPassword; // Just in case
    delete payload.NewPassword;
    delete payload.ConfirmNewPassword;

    // Remove navigation properties and PK
    delete payload.cube_users;
    delete payload.role_users;
    delete payload.UserIdPk; // PK is in URL

    console.log(`FINAL PUT PAYLOAD to /api/users/${id}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
        return response.data; // Or handle 204 No Content
    } catch (error) {
        console.error(`userService: Error updating user ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const changeUserPassword = async (id, passwordData) => {
    // passwordData should match UserPasswordChangeDto: { OldPassword, NewPassword, ConfirmNewPassword }
    console.log(`SENDING ChangePassword PAYLOAD to /api/users/${id}/change-password:`, JSON.stringify(passwordData, null, 2));
    try {
        const response = await axios.post(`${API_BASE_URL}/${id}/change-password`, passwordData);
        return response.data; // Usually a success message
    } catch (error) {
        console.error(`userService: Error changing password for user ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error(`userService: Error deleting user ${id}:`, error.response?.data || error.message);
        throw error;
    }
};