// src/pages/ThemeListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getAllThemes } from '../api/themeService';
import ThemeList from '../components/ThemeList';

function ThemeListPage() {
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchThemes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllThemes(); // Returns array of ThemeDto
            if (Array.isArray(data)) {
                setThemes(data);
            } else {
                console.error("ThemeListPage: Fetched data for themes is not an array", data);
                setThemes([]);
                setError("Received invalid data format for themes.");
            }
        } catch (err) {
            console.error("Error fetching themes:", err);
            setError(err.message || "Failed to load themes.");
            setThemes([]);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array, fetch once on mount

    useEffect(() => {
        fetchThemes();
    }, [fetchThemes]); // fetchThemes is memoized and stable

    return (
        <div>
            <h1>System Themes (Read-Only)</h1>
            <p style={{marginBottom: '20px'}}>This is a list of predefined themes used in the application.</p>
            <ThemeList
                themes={themes}
                loading={loading}
                error={error}
                // No onEdit, onDelete, or onAdd props for read-only
            />
        </div>
    );
}

export default ThemeListPage;