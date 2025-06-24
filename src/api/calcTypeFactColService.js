import axios from 'axios';

const API_BASE_URL = 'http://localhost:5208/api/calctype-factcols';

// Renamed and generalized for fetching lists with optional filters
export const getAllCalcTypeFactColAssociations = async (params = {}) => {
    // params can include: { factcolIdPk, calcTypeType, pageNumber, pageSize }
    console.log("calcTypeFactColService: getAllCalcTypeFactColAssociations called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // Assuming backend's main GET endpoint handles these params and returns an array of DTOs
        // and potentially pagination headers if implemented on backend.
        return { data: response.data, headers: response.headers }; // Consistent return
    } catch (error) {
        console.error("calcTypeFactColService: Error in getAllCalcTypeFactColAssociations:", error.response?.data || error.message);
        throw error;
    }
};

// Get a specific association by its composite key (this name is fine for this purpose)
export const getCalcTypeFactColAssociation = async (factcolIdPk, calcTypeType) => {
    console.log(`calcTypeFactColService: getCalcTypeFactColAssociation for FactCol ${factcolIdPk}, CalcType ${calcTypeType}`);
    try {
        const response = await axios.get(`${API_BASE_URL}/${factcolIdPk}/${encodeURIComponent(calcTypeType)}`);
        return response.data;
    } catch (error) {
        console.error(`calcTypeFactColService: Error fetching specific association for FactCol ${factcolIdPk}, CalcType ${calcTypeType}:`, error.response?.data || error.message);
        throw error;
    }
};

export const createCalcTypeFactColAssociation = async (associationData) => {
    // ... (as before)
    const payload = { ...associationData };
    delete payload.CalcfactcolTimestamp;
    delete payload.FactColumn; // If these are nav props
    delete payload.CalcType;   // If these are nav props
    console.log("SENDING POST PAYLOAD to create calctype-factcol association:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        return response.data;
    } catch (error) {
        console.error("calcTypeFactColService: Error creating association:", error.response?.data || error.message);
        throw error;
    }
};

export const updateCalcTypeFactColAssociation = async (factcolIdPk, calcTypeType, updateData) => {
    // ... (as before)
    const payload = { ...updateData };
    if (payload.calcfactcol_timestamp && !payload.CalcfactcolTimestamp) {
        payload.CalcfactcolTimestamp = payload.calcfactcol_timestamp;
    }
    delete payload.calcfactcol_timestamp;
    if (!payload.CalcfactcolTimestamp) {
        console.error("CRITICAL: CalcfactcolTimestamp is missing. Payload:", payload);
    }
    delete payload.FactcolIdPk;
    delete payload.CalcTypeType;
    delete payload.FactColumn;
    delete payload.CalcType;
    console.log(`FINAL PUT PAYLOAD to ${API_BASE_URL}/${factcolIdPk}/${encodeURIComponent(calcTypeType)}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${factcolIdPk}/${encodeURIComponent(calcTypeType)}`, payload);
        return response.status === 204 ? { ...updateData, factcolIdPk, calcTypeType } : response.data;
    } catch (error) {
        console.error(`calcTypeFactColService: Error updating association for FactCol ${factcolIdPk}, CalcType ${calcTypeType}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteCalcTypeFactColAssociation = async (factcolIdPk, calcTypeType) => {

    try {
        await axios.delete(`${API_BASE_URL}/${factcolIdPk}/${encodeURIComponent(calcTypeType)}`);
    } catch (error) {
        console.error(`calcTypeFactColService: Error deleting association for FactCol ${factcolIdPk}, CalcType ${calcTypeType}:`, error.response?.data || error.message);
        throw error;
    }
};