// src/pages/EditFactColumnPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FactColumnForm from '../components/FactColumnForm';
import { getFactColumnById, updateFactColumn } from '../api/factColumnService';

function EditFactColumnPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // FactColumn ID
    const [factColumn, setFactColumn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const numericId = parseInt(id);

    const fetchFactColumn = useCallback(async () => {
        if (isNaN(numericId)) { setError(new Error("Invalid ID.")); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const data = await getFactColumnById(numericId); // API returns FactColumnDto
            setFactColumn(data);
        } catch (err) { setError(err.message || "Failed to load."); }
        finally { setLoading(false); }
    }, [numericId]);

    useEffect(() => { fetchFactColumn(); }, [fetchFactColumn]);

    const handleUpdateFactColumn = async (factColumnData) => {
        if (isNaN(numericId)) return Promise.reject(new Error("Invalid ID"));
        try {
            await updateFactColumn(numericId, factColumnData);
            alert(`Fact Column (ID: ${numericId}) updated.`);
            navigate(factColumnData.FactIdPk ? `/fact-columns?factIdPk=${factColumnData.FactIdPk}` : '/fact-columns');
        } catch (error) {
            throw error;
        }
    };

    if (loading) return <p>Loading fact column data...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!factColumn && !loading) return <p>Fact Column not found.</p>;
    if (!factColumn) return null;

    return (
        <div>
            <h2>Edit Fact Column (ID: {factColumn.factcolIdPk})</h2>
            <FactColumnForm
                onSubmit={handleUpdateFactColumn}
                onCancel={() => navigate(factColumn.factIdPk ? `/fact-columns?factIdPk=${factColumn.factIdPk}` : '/fact-columns')}
                initialData={factColumn} // API DTO likely uses camelCase or PascalCase
                isEditMode={true}
                parentFactIdPk={factColumn.factIdPk} // For context in form
            />
        </div>
    );
}
export default EditFactColumnPage;