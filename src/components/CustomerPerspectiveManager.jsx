// src/components/CustomerPerspectiveManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllPerspectives,
    createPerspective,
    updatePerspective,
    deletePerspective
} from '../api/perspectiveService';
import PerspectiveList from './PerspectiveList';
import PerspectiveForm from './PerspectiveForm';

const CustomerPerspectiveManager = ({ customerId }) => {
    const [perspectives, setPerspectives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingPerspective, setEditingPerspective] = useState(null);

    const fetchPerspectives = useCallback(async () => {
        if (!customerId) { setPerspectives([]); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const response = await getAllPerspectives({ cubeIdPk: customerId, pageSize: 200 });
            setPerspectives(response.data || []);
        } catch (err) {
            setError(err.message || "Failed to load perspectives.");
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchPerspectives();
    }, [fetchPerspectives]);

    const handleAddOrUpdate = async (formDataFromSubForm) => {
        try {
            if (editingPerspective) {
                await updatePerspective(editingPerspective.PerspIdPk, formDataFromSubForm);
                alert('Perspective updated successfully!');
            } else {
                const dataToCreate = { ...formDataFromSubForm, CubeIdPk: customerId };
                await createPerspective(dataToCreate);
                alert('Perspective added successfully!');
            }
            setShowForm(false);
            setEditingPerspective(null);
            fetchPerspectives();
        } catch (error) {
            throw error; // Let form display errors
        }
    };

    const handleDelete = async (perspectiveIdPk) => {
        if (!window.confirm(`Delete Perspective ID ${perspectiveIdPk}? This might affect linked facts.`)) return;
        try {
            await deletePerspective(perspectiveIdPk);
            alert('Perspective deleted successfully.');
            fetchPerspectives();
        } catch (err) {
            alert(`Error deleting perspective: ${err.response?.data?.message || err.message}`);
        }
    };

    const openEditForm = (perspective) => { // perspective is a PerspectiveDto
        setEditingPerspective({ // Map to form's expected PascalCase initialData
            PerspIdPk: perspective.perspIdPk,
            PerspName: perspective.perspName,
            PerspComments: perspective.perspComments,
            CubeIdPk: perspective.cubeIdPk, // Should match customerId
            PerspTimestamp: perspective.perspTimestamp
        });
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingPerspective(null);
        setShowForm(true);
    };

    if (!customerId) return <p>Customer ID required for Perspective Manager.</p>;

    return (
        <div className="customer-perspective-manager" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <h3>Perspectives for Customer: {customerId}</h3>
            {!showForm && (
                <button className="primary" onClick={openAddForm} style={{ marginBottom: '10px' }}>
                    Add New Perspective
                </button>
            )}
            {showForm && (
                <PerspectiveForm
                    onSubmit={handleAddOrUpdate}
                    onCancel={() => { setShowForm(false); setEditingPerspective(null); }}
                    initialData={editingPerspective || {}} // For add, CubeIdPk comes from parentCubeIdPk
                    parentCubeIdPk={customerId}
                    isEditMode={!!editingPerspective}
                />
            )}
            <PerspectiveList
                perspectives={perspectives}
                onEdit={openEditForm}
                onDelete={handleDelete}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default CustomerPerspectiveManager;