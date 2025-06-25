// src/components/GlobalPerspDimnatList.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const GlobalPerspDimnatList = ({ associations, loading, error }) => {
    if (loading) return <p>Loading Perspective-Dimension associations...</p>;
    if (error) return <p className="error-message">Error: {error || "Failed to load associations."}</p>;

    if (!associations || !Array.isArray(associations) || associations.length === 0) {
        return <p>No Perspective-Dimension associations found matching your criteria.</p>;
    }

    return (
        <div className="global-persp-dimnat-list-container" style={{overflowX: "auto"}}>
            <table>
                <thead>
                <tr>
                    <th>Perspective ID</th>
                    <th>Perspective Name</th>
                    <th>Dimension ID</th>
                    <th>Dimension Name</th>
                    {/* Timestamp usually not shown in lists */}
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {/* associations is an array of PerspDimnatDetailDto */}
                {/* DTO should have: PerspId, PerspectiveName, DimId, DimensionName */}
                {associations.map((assoc) => (
                    <tr key={`${assoc.perspId}-${assoc.dimId}`}> {/* Use DTO keys */}
                        <td>{assoc.perspId}</td>
                        <td>
                            <Link to={`/perspectives/edit/${assoc.perspId}`}>
                                {assoc.perspectiveName || 'N/A'}
                            </Link>
                        </td>
                        <td>{assoc.dimId}</td>
                        <td>
                            <Link to={`/dimensions/edit/${assoc.dimId}`}>
                                {assoc.dimensionName || 'N/A'}
                            </Link>
                        </td>
                        <td>
                            <Link
                                to={`/perspectives/edit/${assoc.perspId}`}
                                className="button-link-inline"
                                title={`Manage associations for Perspective ${assoc.perspId}`}
                            >
                                Manage on Perspective
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default GlobalPerspDimnatList;