// src/pages/EditRdlListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RdlListForm from '../components/RdlListForm';
import { getRdlListById, updateRdlList } from '../api/rdlListService';

function EditRdlListPage() {
    console.log("EditRdlListPage: Component rendering or re-rendering.");
    const navigate = useNavigate();
    const { id } = useParams(); // rdlListIdPk (string from URL)
    const [rdlList, setRdlList] = useState(null); // Will hold the RdlListDto from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const numericId = parseInt(id);
    console.log("EditRdlListPage: Parsed numericId:", numericId);


    const fetchRdlList = useCallback(async () => {
        if (isNaN(numericId)) {
            console.error("EditRdlListPage: Invalid ID in URL params.");
            setError(new Error("Invalid RDL List ID."));
            setLoading(false);
            return;
        }
        console.log(`EditRdlListPage: Fetching RDL List with ID: ${numericId}`);
        setLoading(true); setError(null);
        try {
            const data = await getRdlListById(numericId); // Expects RdlListDto
            console.log("EditRdlListPage: Fetched RDL List data:", data);
            setRdlList(data);
        } catch (err) {
            console.error(`EditRdlListPage: Error fetching RDL List ${numericId}:`, err);
            setError(err.message || "Failed to load RDL List.");
        } finally {
            setLoading(false);
        }
    }, [numericId]);

    useEffect(() => {
        console.log("EditRdlListPage: useEffect for fetching RDL List triggered.");
        fetchRdlList();
    }, [fetchRdlList]);

    const handleUpdateRdlList = async (rdlListDataFromForm) => {
        console.log("EditRdlListPage: handleUpdateRdlList called with data:", rdlListDataFromForm);
        if (isNaN(numericId)) {
            console.error("EditRdlListPage: Invalid ID for update.");
            return Promise.reject(new Error("Invalid RDL List ID"));
        }
        try {
            // updateRdlList service function expects the DTO structure (PascalCase)
            await updateRdlList(numericId, rdlListDataFromForm);
            alert(`RDL List (ID: ${numericId}) updated successfully.`);
            // Navigate back, potentially preserving filters if they were part of the context
            const navigateTo = rdlListDataFromForm.CubeIdPk ? `/rdl-lists?cubeIdPk=${rdlListDataFromForm.CubeIdPk}` : '/rdl-lists';
            console.log("EditRdlListPage: Navigating to:", navigateTo);
            navigate(navigateTo);
        } catch (error) {
            console.error('EditRdlListPage: Failed to update RDL List:', error.response?.data || error.message || error);
            // Let RdlListForm display specific errors
            if (!error.response?.data?.errors && !error.response?.data?.title) {
                alert(`Error updating RDL List: ${error.response?.data?.message || error.message || 'An error occurred.'}`);
            }
            throw error;
        }
    };

    console.log("EditRdlListPage: Rendering. Loading:", loading, "Error:", error, "RdlList Data:", rdlList);

    if (loading) return <p>Loading RDL List data...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!rdlList && !loading) return <p>RDL List not found (ID: {id}). Please check the ID or go back.</p>;
    if (!rdlList) return null; // Should be caught by above, but safeguard

    return (
        <div>
            <h2>Edit RDL List (ID: {rdlList.rdlListIdPk})</h2>
            <RdlListForm
                onSubmit={handleUpdateRdlList}
                onCancel={() => {
                    console.log("EditRdlListPage: Cancel clicked. Navigating back.");
                    navigate(rdlList.cubeIdPk ? `/rdl-lists?cubeIdPk=${rdlList.cubeIdPk}` : '/rdl-lists');
                }}
                initialData={rdlList} // Pass the fetched RdlListDto
                isEditMode={true}
                // parentCubeIdPk is implicitly in rdlList.cubeIdPk and used by RdlListForm's getInitialState
                // and its useEffect when populating for edit mode.
                parentCubeIdPk={rdlList.cubeIdPk}
            />
        </div>
    );
}
export default EditRdlListPage;