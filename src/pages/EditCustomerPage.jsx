// src/pages/EditCustomerPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm'; // For main customer properties
import CustomerRoleManager from '../components/CustomerRoleManager'; // <<< NEW IMPORT
import { getCustomerById, updateCustomer } from '../api/customerService';

function EditCustomerPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // This is cube_id_pk (string from URL)
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // id from params is the cube_id_pk (string)
    const customerId = id;

    const fetchCustomerDetails = useCallback(async () => {
        if (!customerId) {
            setError(new Error("Customer ID missing from URL."));
            setLoading(false);
            return;
        }
        setLoading(true); setError(null);
        try {
            const data = await getCustomerById(customerId);
            setCustomer(data);
        } catch (err) {
            setError(err.message || "Failed to load customer details.");
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchCustomerDetails();
    }, [fetchCustomerDetails]);

    const handleUpdateCustomerCoreDetails = async (customerFormData) => {
        if (!customerId) return Promise.reject(new Error("Customer ID missing"));
        try {
            // This updates the main customer properties
            const updatedCustomer = await updateCustomer(customerId, customerFormData);
            alert(`Customer "${updatedCustomer.cube_name || updatedCustomer.cube_id_pk}" core details updated.`);
            setCustomer(prev => ({...prev, ...updatedCustomer, cust_timestamp: updatedCustomer.cust_timestamp }));
        } catch (error) {
            alert(`Error updating customer details: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    if (loading) return <p>Loading customer data...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!customer && !loading) return <p>Customer not found (ID: {customerId}).</p>;
    if (!customer) return null;

    return (
        <div>
            <h2>Edit Customer (ID: {customer.cube_id_pk})</h2>
            <p style={{ fontStyle: 'italic', marginBottom: '15px' }}>
                Edit main customer properties. Associated Roles are managed below.
            </p>

            <CustomerForm
                onSubmit={handleUpdateCustomerCoreDetails}
                initialData={customer}
                isEditMode={true}
            />

            <hr style={{ margin: '30px 0', border: 0, borderTop: '1px solid #ccc' }} />

            {/* Manager for Roles associated with this Customer */}
            {customerId && <CustomerRoleManager customerId={customerId} />}
        </div>
    );
}
export default EditCustomerPage;