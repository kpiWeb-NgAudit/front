// src/components/FactColumnCalcTypeManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllCalcTypeFactColAssociations,
    createCalcTypeFactColAssociation,
    updateCalcTypeFactColAssociation,
    deleteCalcTypeFactColAssociation
} from '../api/calcTypeFactColService';
import { getAllCalcTypes } from '../api/calcTypeService'; // To get all available CalcTypes for the "Add" form
import CalcTypeAssociationList from './CalcTypeAssociationList';
import CalcTypeAssociationForm from './CalcTypeAssociationForm';

const FactColumnCalcTypeManager = ({ factcolIdPk }) => {
    const [associations, setAssociations] = useState([]); // Stores CalcTypeFactColDto[] from API
    const [availableCalcTypes, setAvailableCalcTypes] = useState([]); // All CalcTypeDto from calctypes table
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAssociation, setEditingAssociation] = useState(null); // For pre-filling edit form

    const fetchAllDataForManager = useCallback(async () => {
        if (!factcolIdPk && factcolIdPk !== 0) {
            setAssociations([]); setAvailableCalcTypes([]); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const [assocRes, allCalcTypesRes] = await Promise.allSettled([
                // Use the corrected function name and pass factcolIdPk in params
                getAllCalcTypeFactColAssociations({ factcolIdPk: factcolIdPk }),
                getAllCalcTypes()
            ]);

            if(assocRes.status === 'fulfilled' && assocRes.value && Array.isArray(assocRes.value.data)) {
                setAssociations(assocRes.value.data); // Access .data because getAll... returns {data, headers}
            } else if (assocRes.status === 'rejected') {
                console.error("FactColumnCalcTypeManager: Error fetching associations:", assocRes.reason);
                setError(prev => ({...prev, associations: assocRes.reason?.message || "Failed to load associations."}));
                setAssociations([]); // Ensure it's an array on error
            } else if (assocRes.status === 'fulfilled' && !Array.isArray(assocRes.value?.data)) {
                // This case handles if the service returned an object but .data wasn't an array
                console.error("FactColumnCalcTypeManager: Fetched association data is not in expected format:", assocRes.value);
                setAssociations([]);
                setError(prev => ({...prev, associations: "Invalid data format for associations."}));
            }


            if(allCalcTypesRes.status === 'fulfilled' && Array.isArray(allCalcTypesRes.value)) {
                setAvailableCalcTypes(allCalcTypesRes.value);
            } else if (allCalcTypesRes.status === 'rejected') {
                console.error("FactColumnCalcTypeManager: Error fetching available calc types:", allCalcTypesRes.reason);
                setError(prev => ({...prev, dropdowns: allCalcTypesRes.reason?.message || "Failed to load calculation types for selection."}));
                setAvailableCalcTypes([]);
            }

        } catch (err) {
            setError(prev => ({...prev, general: err.message || "Failed to load data for manager."}));
            setAssociations([]);
            setAvailableCalcTypes([]);
        }
        finally { setLoading(false); }
    }, [factcolIdPk]);

    useEffect(() => {
        fetchAllDataForManager();
    }, [fetchAllDataForManager]);

    useEffect(() => {
        fetchAllDataForManager();
    }, [fetchAllDataForManager]);

    const handleAddOrUpdate = async (formDataFromSubForm) => {
        try {
            if (editingAssociation) { // Update
                await updateCalcTypeFactColAssociation(factcolIdPk, editingAssociation.CalcTypeType, formDataFromSubForm);
                alert('CalcType settings updated successfully!');
            } else { // Create
                await createCalcTypeFactColAssociation(formDataFromSubForm);
                alert('CalcType associated and settings saved successfully!');
            }
            setShowForm(false);
            setEditingAssociation(null);
            fetchAllDataForManager(); // Refresh the list
        } catch (error) {
            console.error("Error saving CalcType association:", error);
            throw error;
        }
    };

    const handleDelete = async (fcId, ctType) => { // fcId will be current factcolIdPk
        if (!window.confirm(`Disassociate CalcType '${ctType}' from Fact Column ID ${fcId}?`)) return;
        try {
            await deleteCalcTypeFactColAssociation(fcId, ctType);
            alert('Association deleted successfully.');
            fetchAllDataForManager(); // Refresh list
        } catch (err) {
            alert(`Error deleting association: ${err.response?.data?.message || err.message}`);
        }
    };

    const openEditForm = (association) => { // association is a CalcTypeFactColDto
        console.log("Manager: Opening edit form with association:", association);
        setEditingAssociation({ // Ensure this matches what CalcTypeAssociationForm expects for initialData
            FactcolIdPk: association.factcolIdPk, // Should match current factcolIdPk
            CalcTypeType: association.calcTypeType,
            CalcfactcolCubeSuffix: association.calcfactcolCubeSuffix,
            CalcfactcolPresSuffix: association.calcfactcolPresSuffix,
            CalcfactcolVisible: association.calcfactcolVisible,
            CalcfactcolTypeForFormat: association.calcfactcolTypeForFormat,
            CalcfactcolShowTotalInRdl: association.calcfactcolShowTotalInRdl,
            CalcfactcolMdxFormula: association.calcfactcolMdxFormula,
            CalcfactcolComments: association.calcfactcolComments,
            CalcfactcolDisplayFolder: association.calcfactcolDisplayFolder,
            // Map the 10 specific calc types if they are part of CalcTypeFactColDto
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
            CalcfactcolTimestamp: association.calcfactcolTimestamp
        });
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingAssociation(null); // Clear any previous edit data
        setShowForm(true);
    };

    if (!factcolIdPk && factcolIdPk !== 0) return <p>Fact Column ID is required to manage CalcType associations.</p>;

    return (
        <div className="factcol-calctype-manager" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <h3>Calculation Type Settings for Fact Column ID: {factcolIdPk}</h3>
            {!showForm && (
                <button className="primary" onClick={openAddForm} style={{ marginBottom: '10px' }} disabled={loading}>
                    Define/Override CalcType Settings
                </button>
            )}

            {showForm && (
                <CalcTypeAssociationForm
                    onSubmit={handleAddOrUpdate}
                    onCancel={() => { setShowForm(false); setEditingAssociation(null); }}
                    initialData={editingAssociation || {}} // For add, FactcolIdPk is passed via prop
                    availableCalcTypes={availableCalcTypes} // Pass all system calctypes from calctypes table
                    existingCalcTypeAssociationsForFactCol={associations} // Pass current associations to prevent duplicates
                    isEditMode={!!editingAssociation}
                    currentFactColIdPk={factcolIdPk} // The fixed FactColumn ID for this context
                />
            )}

            <CalcTypeAssociationList
                associations={associations} // These are CalcTypeFactColDto[]
                onEdit={openEditForm}
                onDelete={handleDelete}
                loading={loading}
                error={error?.associations || error?.general} // Pass relevant error
            />
        </div>
    );
};

export default FactColumnCalcTypeManager;