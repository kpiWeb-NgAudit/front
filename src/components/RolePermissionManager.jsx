// Créez ce nouveau fichier : src/components/RolePermissionManager.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import roleDimcolService from '../api/roleDimcolService';
import RolePermissionForm from './RolePermissionForm';
import * as dimColumnService from "../api/dimColumnService.js";

function RolePermissionManager({ roleId }) {
    const [permissions, setPermissions] = useState([]);
    const [allDimCols, setAllDimCols] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [permsRes, dimColsRes] = await Promise.all([
                roleDimcolService.getPermissionsByRole(roleId),
                dimColumnService.getAllDimColumns() // Vous devez créer cette méthode
            ]);
            setPermissions(permsRes.data);
            setAllDimCols(dimColsRes.data);
        } catch (err) {
            setError("Failed to load permissions data.");
        } finally {
            setLoading(false);
        }
    }, [roleId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFormSubmit = async (formData) => {
        try {
            if (isAdding) {
                await roleDimcolService.addPermission({ ...formData, roleId: parseInt(roleId) });
            } else {
                const dataToUpdate = { ...formData, timestamp: editingItem.timestamp };
                await roleDimcolService.updatePermission(editingItem.roleId, editingItem.dimcolId, dataToUpdate);
            }
            setIsAdding(false); setEditingItem(null);
            fetchData();
        } catch (err) {
            alert("Error saving permission: " + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (item) => {
        if(window.confirm(`Delete permission for ${item.dimcolName}?`)) {
            try {
                await roleDimcolService.deletePermission(item.roleId, item.dimcolId);
                fetchData();
            } catch (err) {
                alert("Error deleting permission.");
            }
        }
    };

    const filteredPermissions = useMemo(() => {
        if (!filterText) return permissions;
        return permissions.filter(p =>
            p.dimcolName.toLowerCase().includes(filterText.toLowerCase()) ||
            p.dimensionName.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [permissions, filterText]);

    if (loading) return <p>Loading role permissions...</p>;
    if (error) return <p className="alert alert-danger">{error}</p>;

    return (
        <div className="mt-4 p-3 border rounded">
            <h4>Dimension Column Permissions</h4>
            <hr />
            {!(isAdding || editingItem) && (
                <div className="row g-3 mb-3">
                    <div className="col-sm-8">
                        <input type="text" className="form-control" placeholder="Filter permissions by column or dimension name..."
                               value={filterText} onChange={e => setFilterText(e.target.value)} />
                    </div>
                    <div className="col-sm-4">
                        <button className="btn btn-primary w-100" onClick={() => setIsAdding(true)}>+ Add Permission</button>
                    </div>
                </div>
            )}
            {(isAdding || editingItem) && (
                <RolePermissionForm
                    initialData={editingItem}
                    allDimColumns={allDimCols}
                    existingPermissionIds={permissions.map(p => p.dimcolId)}
                    onSubmit={handleFormSubmit}
                    onCancel={() => { setIsAdding(false); setEditingItem(null); }}
                />
            )}
            <div className="table-responsive">
                <table className="table table-sm">
                    {/* ... thead ... */}
                    <tbody>
                    {filteredPermissions.map(p => (
                        <tr key={p.dimcolId}>
                            <td>{p.dimensionName}</td>
                            <td>{p.dimcolName}</td>
                            <td>{p.allowSet ? '✅' : '❌'}</td>
                            <td>{p.visualTotals === null ? 'N/A' : (p.visualTotals ? '✅' : '❌')}</td>
                            <td>
                                <button className="btn btn-sm btn-secondary me-2" onClick={() => setEditingItem(p)}>Edit</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RolePermissionManager;