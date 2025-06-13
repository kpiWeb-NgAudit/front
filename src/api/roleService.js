// src/api/roleService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/roles'; // Your RolesController base URL

export const getAllRoles = async (params = {}) => {
    // params can include { cubeIdPk: 'customerXYZ', pageNumber: 1, pageSize: 10 }
    console.log("roleService: getAllRoles called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        return { data: response.data, headers: response.headers }; // For pagination
    } catch (error) {
        console.error("roleService: Error in getAllRoles:", error.response?.data || error.message);
        throw error;
    }
};

export const getRoleById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`roleService: Error fetching role ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createRole = async (roleData) => {
    // roleData should match CreateRoleDto
    const payload = { ...roleData };
    delete payload.role_timestamp; // Not sent on create (DTO uses PascalCase: RoleTimestamp)

    // Remove potential navigation properties if they exist in form data
    delete payload.cube_id_pkNavigation;
    delete payload.role_users;
    delete payload.persp_roles;

    console.log("SENDING POST PAYLOAD to /api/roles:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data;
    } catch (error) {
        console.error("roleService: Error creating role:", error.response?.data || error.message);
        throw error;
    }
};

export const updateRole = async (id, roleData) => {
    // roleData should match UpdateRoleDto
    const payload = { ...roleData };

    // Normalize timestamp key to DTO expected key (RoleTimestamp)
    if (payload.role_timestamp && !payload.RoleTimestamp) {
        payload.RoleTimestamp = payload.role_timestamp;
    }
    delete payload.role_timestamp; // Remove snake_case version

    if (!payload.RoleTimestamp) {
        // For roles, timestamp might not be as strictly enforced for concurrency on every update field
        // but if your DTO requires it, this warning is good.
        console.warn("Warning: RoleTimestamp is missing for update operation. Payload:", payload);
    }

    // Remove navigation properties and PK from body for PUT
    delete payload.cube_id_pkNavigation;
    delete payload.role_users;
    delete payload.persp_roles;
    delete payload.RoleIdPk; // PK is in URL

    console.log(`FINAL PUT PAYLOAD to /api/roles/${id}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
        return response.data; // Or handle 204 No Content
    } catch (error) {
        console.error(`roleService: Error updating role ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteRole = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error(`roleService: Error deleting role ${id}:`, error.response?.data || error.message);
        throw error;
    }
};