// src/components/DimensionExtractManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllDimDbExtractsV2,
    createDimDbExtractV2,
    updateDimDbExtractV2,
    deleteDimDbExtractV2
} from '../api/dimDbExtractV2Service';
import DimDbExtractV2List from './DimDbExtractV2List';
import DimDbExtractV2Form from './DimDbExtractV2Form';

const DimensionExtractManager = ({ dimensionId, parentCubeIdPk }) => { // dimensionId is dim_id_pk
    const [extracts, setExtracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingExtract, setEditingExtract] = useState(null);

    const fetchExtracts = useCallback(async () => {
        if (!dimensionId) {
            setExtracts([]); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const data = await getAllDimDbExtractsV2({ dimIdPk: dimensionId });
            setExtracts(data || []);
        } catch (err) {
            setError(err.message || "Failed to load extract definitions.");
        } finally {
            setLoading(false);
        }
    }, [dimensionId]);

    useEffect(() => {
        fetchExtracts();
    }, [fetchExtracts]);

    const handleAddOrUpdate = async (formDataFromSubForm) => {
        try {
            if (editingExtract) { // Update
                // PK parts for update come from editingExtract (the DTO of the item being edited)
                await updateDimDbExtractV2(
                    editingExtract.dimIdPk,
                    editingExtract.dimDbExtrV2ProdDataSourceId,
                    editingExtract.dimDbExtrV2DateInsert,
                    formDataFromSubForm // This contains comments, sql, timestamp, (and CubeIdPk if updatable by DTO)
                );
                alert('Extract definition updated successfully!');
            } else { // Create
                // For create, ensure all PK parts are in formDataFromSubForm
                // DimIdPk and CubeIdPk are passed via initialData to the form
                await createDimDbExtractV2(formDataFromSubForm);
                alert('Extract definition added successfully!');
            }
            setShowForm(false);
            setEditingExtract(null);
            fetchExtracts();
        } catch (error) {
            console.error("Error saving extract definition:", error);
            throw error; // Let form display specific errors
        }
    };

    const handleDelete = async (dimId, prodSourceId, dateInsert) => {
        if (!window.confirm(`Delete this extract definition (SourceID: ${prodSourceId}, Date: ${new Date(dateInsert).toLocaleString()})?`)) return;
        try {
            await deleteDimDbExtractV2(dimId, prodSourceId, dateInsert);
            alert('Extract definition deleted.');
            fetchExtracts();
        } catch (err) {
            alert(`Error deleting: ${err.response?.data?.message || err.message}`);
        }
    };

    const openEditForm = (extractDto) => { // extractDto is DimDbExtractV2Dto
        setEditingExtract(extractDto); // Pass the DTO as initialData
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingExtract(null);
        setShowForm(true);
    };

    if (!dimensionId) return <p>Dimension ID not provided to manager.</p>;

    return (
        <div className="dimension-extract-manager" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <h3>Data Extract Definitions for Dimension ID: {dimensionId}</h3>
            {!showForm && (
                <button className="primary" onClick={openAddForm} style={{ marginBottom: '10px' }}>
                    Add New Extract Definition
                </button>
            )}

            {showForm && (
                <DimDbExtractV2Form
                    onSubmit={handleAddOrUpdate}
                    onCancel={() => { setShowForm(false); setEditingExtract(null); }}
                    // For ADD: pass parent dimension's ID and its customer ID
                    // For EDIT: pass the full extract DTO
                    initialData={editingExtract || { DimIdPk: dimensionId, CubeIdPk: parentCubeIdPk }}
                    isEditMode={!!editingExtract}
                />
            )}

            <DimDbExtractV2List
                extracts={extracts}
                onEdit={openEditForm}
                onDelete={handleDelete}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default DimensionExtractManager;