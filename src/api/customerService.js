// src/api/customerService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_BASE_URL = `${BASE_URL}/api/customer`;

export const getAllCustomers = async (params = {}) => { // Added params for consistency
    console.log("customerService: getAllCustomers called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params }); // API_BASE_URL for customers
        console.log("customerService: API response data for customers:", response.data);
        // THIS DIRECTLY RETURNS THE ARRAY (or whatever response.data is)
        // It DOES NOT return { data: ..., headers: ... } like your newer services
        return response.data;
    } catch (error) {
        console.error("customerService: Error in getAllCustomers:", error.response?.data || error.message);
        throw error;
    }
};

export const getCustomerById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
};


export const createCustomer = async (customerData) => {

    const payload = { ...customerData };

    delete payload.cube_lastupdate;
    delete payload.cube_lastprocess;
    delete payload.cust_timestamp;

    delete payload.cube_users;
    delete payload.cubesets;
    delete payload.dimdbextractsV2s;
    delete payload.dimensions;
    delete payload.exploitInstructions;
    delete payload.factdbextractsV2s;
    delete payload.facts;
    delete payload.perspectives;
    delete payload.rdllists;
    delete payload.roles;
    delete payload.sources;

    console.log("SENDING POST PAYLOAD to /api/customer:", JSON.stringify(payload, null, 2)); // <<<--- ADD THIS LOG



    const response = await axios.post(API_BASE_URL, payload);
    return response.data;
};


export const updateCustomer = async (id, customerData) => {

    const payload = { ...customerData };

    delete payload.cube_lastupdate;
    delete payload.cube_lastprocess
    // delete payload.cube_users;
    // delete payload.cubesets;

    if (!payload.cust_timestamp) {
        console.error("CRITICAL: cust_timestamp is missing for update operation. Payload:", payload);
        // Potentially throw an error here or alert the user, as concurrency check will likely fail or be bypassed.
    }

    // Log the payload to be certain
    console.log("FINAL PUT PAYLOAD to /api/customer/" + id + ":", JSON.stringify(payload, null, 2));

    delete payload.cube_users;
    delete payload.cubesets;
    delete payload.dimdbextractsV2s;
    delete payload.dimensions;
    delete payload.exploitInstructions;
    delete payload.factdbextractsV2s;
    delete payload.facts;
    delete payload.perspectives;
    delete payload.rdllists;
    delete payload.roles;
    delete payload.sources;


    await axios.put(`${API_BASE_URL}/${id}`, payload);

    return customerData;
};

export const deleteCustomer = async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
};