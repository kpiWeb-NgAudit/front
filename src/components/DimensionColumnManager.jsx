// src/components/DimensionColumnManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllDimColumns,
    createDimColumn,
    updateDimColumn,
    deleteDimColumn
} from '../api/dimColumnService';
import DimColumnList from './DimColumnList';
import DimColumnForm from './DimColumnForm';

const DimensionColumnManager = ({ dimensionId }) => { // Receives parent dimensionId
    const [dimColumns, setDimColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingDimColumn, setEditingDimColumn] = useState(null); // Holds data for edit

    const fetchDimColumns = useCallback(async () => {
        if (!dimensionId) {
            setDimColumns([]);
            setLoading(false);
            return;
        }
        setLoading(true); setError(null);
        try {
            // Fetch only columns for the current dimensionId
            const response = await getAllDimColumns({ dimensionId: dimensionId, pageSize: 1000 }); // Adjust pageSize
            setDimColumns(response.data || []);
        } catch (err) {
            console.error(`Error fetching dim columns for dimension ${dimensionId}:`, err);
            setError(err.message || "Failed to load dimension columns.");
        } finally {
            setLoading(false);
        }
    }, [dimensionId]);

    useEffect(() => {
        fetchDimColumns();
    }, [fetchDimColumns]);

    const handleAddOrUpdateDimColumn = async (formData) => {
        try {
            if (editingDimColumn) { // Update
                await updateDimColumn(editingDimColumn.DimcolIdPk, formData); // Use DTO key
                alert('Dimension Column updated successfully!');
            } else { // Create
                // Ensure parentDimensionId is part of formData if not already
                const dataToCreate = { ...formData, DimIdPk: dimensionId };
                await createDimColumn(dataToCreate);
                alert('Dimension Column added successfully!');
            }
            setShowForm(false);
            setEditingDimColumn(null);
            fetchDimColumns(); // Refresh list
        } catch (error) {
            console.error("Error saving dimension column:", error);
            // Error will be displayed by DimColumnForm's internal error handling
            throw error; // Re-throw to let DimColumnForm handle it
        }
    };

    const handleDeleteDimColumn = async (dimcolIdPk) => {
        if (!window.confirm(`Delete Dimension Column ID ${dimcolIdPk}? This might affect hierarchies.`)) return;
        try {
            await deleteDimColumn(dimcolIdPk);
            alert('Dimension Column deleted successfully.');
            fetchDimColumns(); // Refresh list
        } catch (err) {
            alert(`Error deleting dimension column: ${err.response?.data?.message || err.response?.data || err.message}`);
        }
    };

    const openEditForm = (dimCol) => {
        // Map the dimCol (likely from DTO/entity with backend names) to what DimColumnForm expects
        setEditingDimColumn({ // Ensure these keys match DimColumnForm's initialData/formData keys
            DimcolIdPk: dimCol.dimcol_id_pk,
            DimcolCname: dimCol.dimcol_cname,
            DimcolUse: dimCol.dimcol_use,
            DimcolPurgewhenvirt: dimCol.dimcol_purgewhenvirt,
            DimcolType: dimCol.dimcol_type,
            DimcolShortCubeName: dimCol.dimcol_shortcubename,
            DimcolShortPresName: dimCol.dimcol_shortpresname,
            DimcolWorkOrder: dimCol.dimcol_workorder,
            DimcolCubeType: dimCol.dimcol_cubetype,
            DimcolCubeProc: dimCol.dimcol_cubeproc,
            DimcolCubeSort: dimCol.dimcol_cubesort,
            DimcolCubeFormula: dimCol.dimcol_cubeformula,
            DimcolCubeVisible: dimCol.dimcol_cubevisible,
            DimcolRdlShowFilter: dimCol.dimcol_rdlshowfilter,
            DimcolConstraintType: dimCol.dimcol_constrainttype,
            DimcolDrillThrough: dimCol.dimcol_drillthrough,
            DimcolAttributeRelation: dimCol.dimcol_attributerelation,
            DimcolPropertyName: dimCol.dimcol_propertyname,
            DimcolPropertyValue: dimCol.dimcol_propertyvalue,
            DimcolDisplayFolder: dimCol.dimcol_displayfolder,
            DimcolDefaultMember: dimCol.dimcol_defaultmember,
            DimcolIndexDataMart: dimCol.dimcol_indexdatamart,
            DimcolComments: dimCol.dimcol_comments,
            DimIdPk: dimCol.dim_id_pk, // Parent Dimension ID
            DimcolTimestamp: dimCol.dimcol_timestamp
        });
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingDimColumn(null); // Clear any edit data
        setShowForm(true);
    };

    if (!dimensionId) { // Should not happen if EditDimensionPage passes it correctly
        return <p>Dimension ID not provided to manager.</p>;
    }

    return (
        <div className="dimension-column-manager" style={{ marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <h3>Dimension Columns for Dimension ID: {dimensionId}</h3>
            {!showForm && (
                <button className="primary" onClick={openAddForm} style={{ marginBottom: '10px' }}>
                    Add New Dimension Column
                </button>
            )}

            {showForm && (
                <DimColumnForm
                    onSubmit={handleAddOrUpdateDimColumn}
                    onCancel={() => { setShowForm(false); setEditingDimColumn(null); }}
                    initialData={editingDimColumn || {}} // Pass empty object for add, or prefill for edit
                    parentDimensionId={dimensionId} // Explicitly pass parentDimensionId
                    isEditMode={!!editingDimColumn}
                />
            )}

            <DimColumnList
                dimColumns={dimColumns}
                onEdit={openEditForm}
                onDelete={handleDeleteDimColumn}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default DimensionColumnManager;