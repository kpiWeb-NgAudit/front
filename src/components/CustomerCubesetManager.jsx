// src/components/CustomerCubesetManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllCubesets,
    createCubeset,
    updateCubeset,
    deleteCubeset
} from '../api/cubesetService';
import CubesetList from './CubesetList';
import CubesetForm from './CubesetForm';

const CustomerCubesetManager = ({ customerId }) => {
    const [cubesets, setCubesets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCubeset, setEditingCubeset] = useState(null);

    const fetchCubesets = useCallback(async () => {
        if (!customerId) {
            setCubesets([]); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const response = await getAllCubesets({ cubeIdPk: customerId, pageSize: 200 });
            setCubesets(response.data || []);
        } catch (err) {
            setError(err.message || "Failed to load cubesets.");
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchCubesets();
    }, [fetchCubesets]);

    const handleAddOrUpdateCubeset = async (formDataFromSubForm) => {
        try {
            if (editingCubeset) {
                await updateCubeset(editingCubeset.CubesetIdPk, formDataFromSubForm); // Use DTO key
                alert('Cubeset updated successfully!');
            } else {
                const dataToCreate = { ...formDataFromSubForm, CubeIdPk: customerId };
                await createCubeset(dataToCreate);
                alert('Cubeset added successfully!');
            }
            setShowForm(false);
            setEditingCubeset(null);
            fetchCubesets();
        } catch (error) {
            throw error; // Let CubesetForm display specific errors
        }
    };

    const handleDeleteCubeset = async (cubesetIdPk) => {
        if (!window.confirm(`Delete Cubeset ID ${cubesetIdPk}?`)) return;
        try {
            await deleteCubeset(cubesetIdPk);
            alert('Cubeset deleted successfully.');
            fetchCubesets();
        } catch (err) {
            alert(`Error deleting cubeset: ${err.response?.data?.message || err.message}`);
        }
    };

    const openEditForm = (cubeset) => {
        setEditingCubeset({ // Map entity (snake_case) to form state (PascalCase)
            CubesetIdPk: cubeset.cubeset_id_pk,
            CubesetName: cubeset.cubeset_name,
            CubesetCubeName: cubeset.cubeset_cubename,
            CubesetAsInstruction: cubeset.cubeset_asinstruction,
            CubesetHidden: cubeset.cubeset_hidden,
            CubesetDynamic: cubeset.cubeset_dynamic,
            CubesetRdlShowFilter: cubeset.cubeset_rdlshowfilter,
            CubesetPresOrder: cubeset.cubeset_presorder,
            CubesetComments: cubeset.cubeset_comments,
            CubeIdPk: cubeset.cube_id_pk, // Should match customerId prop
            CubesetTimestamp: cubeset.cubeset_timestamp
        });
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingCubeset(null);
        setShowForm(true);
    };

    if (!customerId) return <p>Customer ID not provided to Cubeset Manager.</p>;

    return (
        <div className="customer-cubeset-manager" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <h3>Cubesets for Customer: {customerId}</h3>
            {!showForm && (
                <button className="primary" onClick={openAddForm} style={{ marginBottom: '10px' }}>
                    Add New Cubeset
                </button>
            )}

            {showForm && (
                <CubesetForm
                    onSubmit={handleAddOrUpdateCubeset}
                    onCancel={() => { setShowForm(false); setEditingCubeset(null); }}
                    initialData={editingCubeset || {}}
                    parentCubeIdPk={customerId}
                    isEditMode={!!editingCubeset}
                />
            )}

            <CubesetList
                cubesets={cubesets}
                onEdit={openEditForm}
                onDelete={handleDeleteCubeset}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default CustomerCubesetManager;