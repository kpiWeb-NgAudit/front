// src/components/RdlGroupFactColAssociationManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllRdlGroupFactColAssociations, // This service gets associations, effectively RdlGroupFactColDto[]
    createRdlGroupFactCol,
    updateRdlGroupFactCol,
    deleteRdlGroupFactCol
} from '../api/rdlGroupFactColService';
import { getAllFactColumns } from '../api/factColumnService'; // To populate dropdown for adding
import RdlGroupFactColAssociationForm from './RdlGroupFactColAssociationForm'; // The form for add/edit

// A simple list component for displaying current associations
const CurrentAssociationsList = ({ associations, onEdit, onDelete, loading, error }) => {
    if (loading) return <p>Loading associations...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (associations.length === 0) return <p>No fact columns currently associated with this RDL Group with specific calc types.</p>;

    return (
        <table>
            <thead>
            <tr>
                <th>Fact Column ID</th>
                <th>Fact Column Name</th>
                {/* Optionally display a summary of calc types or a "Details" button */}
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {associations.map(assoc => (
                <tr key={`${assoc.rdlGroupIdPk}-${assoc.factcolIdPk}`}>
                    <td>{assoc.factcolIdPk}</td>
                    <td>{assoc.factColumnName || 'N/A'}</td>
                    <td className="actions">
                        <button className="secondary" onClick={() => onEdit(assoc)}>Edit Calc Types</button>
                        <button className="danger" onClick={() => onDelete(assoc.rdlGroupIdPk, assoc.factcolIdPk)}>Disassociate</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};


const RdlGroupFactColAssociationManager = ({ rdlGroupIdPk }) => {
    const [associations, setAssociations] = useState([]); // Stores RdlGroupFactColDto[]
    const [availableFactCols, setAvailableFactCols] = useState([]); // All fact columns for "Add" dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAssociation, setEditingAssociation] = useState(null); // For pre-filling edit form

    const fetchAllData = useCallback(async () => {
        if (!rdlGroupIdPk) { setAssociations([]); setAvailableFactCols([]); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const [assocRes, factColRes] = await Promise.allSettled([
                getAllRdlGroupFactColAssociations({ rdlGroupIdPk: rdlGroupIdPk }), // Fetch by current RDL Group
                getAllFactColumns({ pageSize: 2000 }) // Fetch all available fact columns
            ]);

            if(assocRes.status === 'fulfilled') setAssociations(assocRes.value?.data || []);
            else console.error("Error fetching associations:", assocRes.reason);

            if(factColRes.status === 'fulfilled') setAvailableFactCols(factColRes.value?.data || []);
            else console.error("Error fetching available fact columns:", factColRes.reason);

        } catch (err) { setError(err.message || "Failed to load data."); }
        finally { setLoading(false); }
    }, [rdlGroupIdPk]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const handleAddOrUpdate = async (formDataFromSubForm) => {
        try {
            if (editingAssociation) { // Update
                await updateRdlGroupFactCol(rdlGroupIdPk, editingAssociation.FactcolIdPk, formDataFromSubForm);
                alert('Calculation types updated!');
            } else { // Create new association
                // formDataFromSubForm already has RdlGroupIdPk (passed as currentRdlGroupIdPk) and FactcolIdPk
                await createRdlGroupFactCol(formDataFromSubForm);
                alert('Fact Column association added with calc types!');
            }
            setShowForm(false); setEditingAssociation(null); fetchAllData();
        } catch (error) { throw error; }
    };

    const handleDelete = async (groupId, factColId) => {
        if (!window.confirm(`Disassociate Fact Column ID ${factColId} from RDL Group ID ${groupId}?`)) return;
        try {
            await deleteRdlGroupFactCol(groupId, factColId);
            alert('Association deleted.'); fetchAllData();
        } catch (err) { alert(`Error: ${err.response?.data?.message || err.message}`); }
    };

    const openEditForm = (association) => { // association is RdlGroupFactColDto
        setEditingAssociation({
            RdlGroupIdPk: association.rdlGroupIdPk,
            FactcolIdPk: association.factcolIdPk,
            RdlgroupfactcolRdlsimpleCalctype0: association.rdlgroupfactcolRdlsimpleCalctype0,
            RdlgroupfactcolRdlsimpleCalctype1: association.rdlgroupfactcolRdlsimpleCalctype1,
            RdlgroupfactcolRdlsimpleCalctype2: association.rdlgroupfactcolRdlsimpleCalctype2,
            RdlgroupfactcolRdlsimpleCalctype3: association.rdlgroupfactcolRdlsimpleCalctype3,
            RdlgroupfactcolRdlsimpleCalctype4: association.rdlgroupfactcolRdlsimpleCalctype4,
            RdlgroupfactcolRdlcomplexCalctype0: association.rdlgroupfactcolRdlcomplexCalctype0,
            RdlgroupfactcolRdlcomplexCalctype1: association.rdlgroupfactcolRdlcomplexCalctype1,
            RdlgroupfactcolRdlcomplexCalctype2: association.rdlgroupfactcolRdlcomplexCalctype2,
            RdlgroupfactcolRdlcomplexCalctype3: association.rdlgroupfactcolRdlcomplexCalctype3,
            RdlgroupfactcolRdlcomplexCalctype4: association.rdlgroupfactcolRdlcomplexCalctype4,
            RdlgroupFactcolTimestamp: association.rdlgroupFactcolTimestamp
        });
        setShowForm(true);
    };

    const openAddForm = () => { setEditingAssociation(null); setShowForm(true); };

    if (!rdlGroupIdPk) return <p>RDL Group ID required.</p>;

    return (
        <div className="rdlgroup-factcol-manager">
            <h3>Fact Column Calculation Types for RDL Group: {rdlGroupIdPk}</h3>
            {!showForm && <button className="primary" onClick={openAddForm}>Associate Fact Column & Set Calc Types</button>}
            {showForm && (
                <RdlGroupFactColAssociationForm
                    onSubmit={handleAddOrUpdate}
                    onCancel={() => { setShowForm(false); setEditingAssociation(null); }}
                    initialData={editingAssociation || {}} // For add, RdlGroupIdPk is passed via prop
                    availableFactCols={availableFactCols}
                    existingAssociationsForGroup={associations}
                    isEditMode={!!editingAssociation}
                    currentRdlGroupIdPk={rdlGroupIdPk} // Pass the fixed RDL Group ID
                />
            )}
            <CurrentAssociationsList
                associations={associations}
                onEdit={openEditForm}
                onDelete={handleDelete}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default RdlGroupFactColAssociationManager;