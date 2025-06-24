// src/pages/CalcTypeListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getAllCalcTypes } from '../api/calcTypeService';
import CalcTypeList from '../components/CalcTypeList';

function CalcTypeListPage() {
    const [calcTypes, setCalcTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCalcTypes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllCalcTypes(); // Returns array of CalcTypeDto
            if (Array.isArray(data)) {
                setCalcTypes(data);
            } else {
                console.error("CalcTypeListPage: Fetched data is not an array", data);
                setCalcTypes([]);
                setError("Received invalid data format for calculation types.");
            }
        } catch (err) {
            console.error("Error fetching calculation types:", err);
            setError(err.message || "Failed to load calculation types.");
            setCalcTypes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCalcTypes();
    }, [fetchCalcTypes]);

    return (
        <div>
            <h1>System Calculation Types (Read-Only)</h1>
            <p style={{marginBottom: '20px'}}>
                This is a list of predefined calculation types used in various configurations (e.g., RDL Group Fact Column settings).
            </p>
            <CalcTypeList
                calcTypes={calcTypes}
                loading={loading}
                error={error}
            />
        </div>
    );
}

export default CalcTypeListPage;