// src/components/ThemeList.jsx
import React from 'react';
// No useNavigate needed for read-only list actions

const ThemeList = ({ themes, loading, error }) => {
    if (loading) return <p>Loading themes...</p>;
    if (error) return <p className="error-message">Error loading themes: {error.message || JSON.stringify(error)}</p>;

    if (!themes || themes.length === 0) {
        return <p>No themes found or defined in the system.</p>;
    }

    return (
        <div className="theme-list-container">
            <table>
                <thead>
                <tr>
                    <th>ID (ThemeIdPk)</th>
                    <th>Label (ThemeLabel)</th>
                    {/* Timestamp is usually not shown in a user-facing list */}
                </tr>
                </thead>
                <tbody>
                {/* Assuming API returns DTO with PascalCase: ThemeIdPk, ThemeLabel */}
                {themes.map((theme) => (
                    <tr key={theme.themeIdPk}>
                        <td>{theme.themeIdPk === "" ? "'' (Empty String ID)" : theme.themeIdPk}</td>
                        <td>{theme.themeLabel}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ThemeList;