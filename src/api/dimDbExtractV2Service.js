// src/api/dimDbExtractV2Service.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/dimdbextractsv2';

// Get all extracts, typically filtered by dimIdPk
export const getAllDimDbExtractsV2 = async (params = {}) => {
    // params: { dimIdPk: 1, prodDataSourceId: 0, cubeIdPk: "CUST1" }
    console.log("dimDbExtractV2Service: getAllDimDbExtractsV2 called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // Backend returns array of DimDbExtractV2Dto
        return response.data;
    } catch (error) {
        console.error("dimDbExtractV2Service: Error in getAllDimDbExtractsV2:", error.response?.data || error.message);
        throw error;
    }
};

// Get a specific extract by its composite key using query parameters
export const getDimDbExtractV2 = async (dimIdPk, prodDataSourceId, dateInsert) => {
    // Ensure dateInsert is in ISO format for the query param
    const dateInsertIso = typeof dateInsert === 'string' ? dateInsert : new Date(dateInsert).toISOString();
    const params = { dimIdPk, prodDataSourceId, dateInsert: dateInsertIso };
    console.log("dimDbExtractV2Service: getDimDbExtractV2 called with params:", params);
    try {
        // Using the "/item" sub-route as defined in the controller for specific GET
        const response = await axios.get(`${API_BASE_URL}/item`, { params });
        return response.data; // Returns a single DimDbExtractV2Dto
    } catch (error) {
        console.error(`dimDbExtractV2Service: Error fetching specific extract:`, error.response?.data || error.message);
        throw error;
    }
};

export const createDimDbExtractV2 = async (extractData) => {
    // extractData should match CreateDimDbExtractV2Dto
    const payload = { ...extractData };
    // Timestamp is server-generated
    delete payload.DimDbExtrV2Timestamp;
    // Navigation properties should not be here
    delete payload.Dimension;
    delete payload.Customer;

    console.log("SENDING POST PAYLOAD to /api/dimdbextractsv2:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data; // Returns the created DimDbExtractV2Dto (or entity)
    } catch (error) {
        console.error("dimDbExtractV2Service: Error creating extract:", error.response?.data || error.message);
        throw error;
    }
};

export const updateDimDbExtractV2 = async (dimIdPk, prodDataSourceId, dateInsert, updateData) => {
    // updateData should match UpdateDimDbExtractV2Dto
    const payload = { ...updateData };

    // Normalize timestamp key
    if (payload.dimDbExtrV2Timestamp && !payload.DimDbExtrV2Timestamp) {
        payload.DimDbExtrV2Timestamp = payload.dimDbExtrV2Timestamp;
    }
    delete payload.dimDbExtrV2Timestamp;

    if (!payload.DimDbExtrV2Timestamp) {
        console.error("CRITICAL: DimDbExtrV2Timestamp is missing for update. Payload:", payload);
    }
    // PKs are in query params for PUT, not body
    delete payload.DimIdPk;
    delete payload.DimDbExtrV2ProdDataSourceId;
    delete payload.DimDbExtrV2DateInsert;
    delete payload.Dimension;
    delete payload.Customer;


    const dateInsertIso = typeof dateInsert === 'string' ? dateInsert : new Date(dateInsert).toISOString();
    const params = { dimIdPk, prodDataSourceId, dateInsert: dateInsertIso };

    console.log(`FINAL PUT PAYLOAD to ${API_BASE_URL} with params:`, params, "and body:", JSON.stringify(payload, null, 2));
    try {
        // Controller's PUT uses query parameters for PK
        const response = await axios.put(API_BASE_URL, payload, { params });
        // Backend returns NoContent (204)
        return response.status === 204 ? { ...updateData, ...params } : response.data;
    } catch (error) {
        console.error(`dimDbExtractV2Service: Error updating extract:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteDimDbExtractV2 = async (dimIdPk, prodDataSourceId, dateInsert) => {
    const dateInsertIso = typeof dateInsert === 'string' ? dateInsert : new Date(dateInsert).toISOString();
    const params = { dimIdPk, prodDataSourceId, dateInsert: dateInsertIso };
    console.log("dimDbExtractV2Service: Deleting with params:", params);
    try {
        // Controller's DELETE uses query parameters for PK
        await axios.delete(API_BASE_URL, { params });
    } catch (error) {
        console.error(`dimDbExtractV2Service: Error deleting extract:`, error.response?.data || error.message);
        throw error;
    }
};