// src/api/rdlGroupFactColService.js
import axios from 'axios';

// Matches your RdlGroupFactColsController route
const API_BASE_URL = 'http://localhost:5208/api/rdlgroup-factcols';

export const getAllRdlGroupFactColAssociations = async (params = {}) => {
    // params: { rdlGroupIdPk: 'GROUP1', factcolIdPk: 123, pageNumber, pageSize }
    console.log("rdlGroupFactColService: getAllRdlGroupFactColAssociations called with params:", params);
    try {
        const response = await axios.get(API_BASE_URL, { params });
        // Assuming backend returns { data: Array<RdlGroupFactColDto>, headers: ... }
        // or just Array<RdlGroupFactColDto> if not paginated
        // Let's be consistent with other services and expect an object if pagination is possible
        return { data: response.data, headers: response.headers };
    } catch (error) {
        console.error("rdlGroupFactColService: Error in getAllRdlGroupFactColAssociations:", error.response?.data || error.message);
        throw error;
    }
};

// Get a specific association by its composite key
export const getRdlGroupFactColAssociation = async (rdlGroupIdPk, factcolIdPk) => {
    console.log(`rdlGroupFactColService: getRdlGroupFactColAssociation for RdlGroup ${rdlGroupIdPk}, FactCol ${factcolIdPk}`);
    try {
        const response = await axios.get(`${API_BASE_URL}/${rdlGroupIdPk}/${factcolIdPk}`);
        // Backend controller GetRdlGroupFactCol returns RdlGroupFactColDto
        return response.data;
    } catch (error) {
        console.error(`rdlGroupFactColService: Error fetching association for ${rdlGroupIdPk}-${factcolIdPk}:`, error.response?.data || error.message);
        throw error;
    }
};

// Create a new rdlgroup_factcol association
export const createRdlGroupFactCol = async (associationData) => {
    // associationData should match CreateRdlGroupFactColDto:
    // { RdlGroupIdPk, FactcolIdPk, RdlgroupfactcolRdlsimpleCalctype0, ..., RdlgroupfactcolRdlcomplexCalctype4 }
    const payload = { ...associationData };
    // Timestamp is server-generated for the rdlgroup_factcol table itself
    delete payload.RdlgroupFactcolTimestamp; // Not part of CreateRdlGroupFactColDto

    // Remove potential navigation properties if they were somehow included from form state
    delete payload.RdlGroup;
    delete payload.FactColumn;

    console.log("SENDING POST PAYLOAD to /api/rdlgroup-factcols to create association:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios.post(API_BASE_URL, payload);
        // Backend controller PostRdlGroupFactCol returns the created DTO
        return response.data;
    } catch (error) {
        console.error("rdlGroupFactColService: Error creating association:", error.response?.data || error.message);
        throw error;
    }
};

// Update an existing rdlgroup_factcol association's attributes
export const updateRdlGroupFactCol = async (rdlGroupIdPk, factcolIdPk, updateData) => {
    // updateData should match UpdateRdlGroupFactColDto:
    // { RdlgroupfactcolRdlsimpleCalctype0, ..., RdlgroupfactcolRdlcomplexCalctype4, RdlgroupFactcolTimestamp }
    const payload = { ...updateData };

    // Ensure DTO key for timestamp if it came from form with different casing
    if (payload.rdlgroup_factcol_timestamp && !payload.RdlgroupFactcolTimestamp) {
        payload.RdlgroupFactcolTimestamp = payload.rdlgroup_factcol_timestamp;
    }
    delete payload.rdlgroup_factcol_timestamp; // Remove original snake_case if present

    if (!payload.RdlgroupFactcolTimestamp) {
        console.error("CRITICAL: RdlgroupFactcolTimestamp is missing for update. Payload:", payload);
        // Backend will likely reject if timestamp is required by DTO for concurrency
    }
    // PKs are in URL, not body for DTO, and other FKs are not updatable for the association itself
    delete payload.RdlGroupIdPk;
    delete payload.FactcolIdPk;
    delete payload.RdlGroup;
    delete payload.FactColumn;


    console.log(`FINAL PUT PAYLOAD to /api/rdlgroup-factcols/${rdlGroupIdPk}/${factcolIdPk}:`, JSON.stringify(payload, null, 2));
    try {
        const response = await axios.put(`${API_BASE_URL}/${rdlGroupIdPk}/${factcolIdPk}`, payload);
        // Backend controller PutRdlGroupFactCol returns NoContent (204)
        if (response.status === 204) {
            // Return an object that might be useful for updating local state,
            // e.g., the original keys and the updated data.
            return {
                rdlGroupIdPk,
                factcolIdPk,
                ...updateData // This will have the new calctypes and the timestamp used for update
            };
        }
        return response.data; // Should not happen if backend returns 204
    } catch (error) {
        console.error(`rdlGroupFactColService: Error updating association for ${rdlGroupIdPk}-${factcolIdPk}:`, error.response?.data || error.message);
        throw error;
    }
};

// DELETE an association by its composite key
export const deleteRdlGroupFactCol = async (rdlGroupIdPk, factcolIdPk) => {
    console.log(`rdlGroupFactColService: Deleting association for RdlGroup ${rdlGroupIdPk}, FactCol ${factcolIdPk}`);
    try {
        // Backend controller DeleteRdlGroupFactCol uses route parameters for composite key
        await axios.delete(`${API_BASE_URL}/${rdlGroupIdPk}/${factcolIdPk}`);
        // No content returned on successful delete
    } catch (error) {
        console.error(`rdlGroupFactColService: Error deleting association:`, error.response?.data || error.message);
        throw error;
    }
};