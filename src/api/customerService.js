// src/api/customerService.js
import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_BASE_URL = `${BASE_URL}/api/customer`;

// Dans src/api/customerService.js

export const getAllCustomers = async () => {
    console.log("customerService: Calling GET /api/customers (no limit)");
    try {
        // On fait un appel simple sans aucun paramètre pour tout récupérer
        const response = await axios.get(API_BASE_URL);
        console.log(`[API RESPONSE] Received ${response.data.length} customers.`);
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

export const getPaginatedCustomers = async (pageNumber = 1, pageSize = 10) => {
    // Cette fonction n'est plus compatible avec notre nouvelle logique simple.
    // Vous devriez la recoder si vous en avez besoin pour une page de liste de clients.
    // Pour l'instant, on se concentre sur le besoin des filtres.
    console.warn("getPaginatedCustomers is deprecated with the new controller logic.");
    return getAllCustomers(); // Pour l'instant, elle retourne tout.
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