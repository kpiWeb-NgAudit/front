// Créez ce nouveau fichier : src/components/FactDbExtractForm.jsx

import React, { useState, useEffect } from 'react';

function FactDbExtractForm({ initialData, onSubmit, onCancel, customerId }) {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState({
        prodDataSourceId: '',
        customerId: customerId || '', // Pré-remplir si fourni
        comments: '',
        dbSelectSqlClause: ''
    });

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                comments: initialData.comments || '',
                dbSelectSqlClause: initialData.dbSelectSqlClause || ''
            });
        } else {
            setFormData({ prodDataSourceId: '', customerId: customerId || '', comments: '', dbSelectSqlClause: '' });
        }
    }, [initialData, isEditMode, customerId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="card card-body mt-3">
            <h5>{isEditMode ? 'Edit' : 'Add'} Fact DB Extract</h5>
            {!isEditMode && (
                <>
                    <div className="mb-3">
                        <label className="form-label">Prod Data Source ID</label>
                        <input type="number" name="prodDataSourceId" className="form-control" value={formData.prodDataSourceId} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Customer ID</label>
                        <input type="text" name="customerId" className="form-control" value={formData.customerId} onChange={handleChange} required />
                    </div>
                </>
            )}
            <div className="mb-3">
                <label className="form-label">Comments</label>
                <textarea name="comments" className="form-control" rows="2" value={formData.comments} onChange={handleChange}></textarea>
            </div>
            <div className="mb-3">
                <label className="form-label">DB Select SQL Clause</label>
                <textarea name="dbSelectSqlClause" className="form-control" rows="5" value={formData.dbSelectSqlClause} onChange={handleChange} required></textarea>
            </div>
            <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
            </div>
        </form>
    );
}
export default FactDbExtractForm;