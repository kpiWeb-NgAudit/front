// src/pages/EditCustomerPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import CustomerForm from '../components/CustomerForm'; // <<< IMPORT CustomerForm
import { getCustomerById, updateCustomer } from '../api/customerService'; // <<< IMPORT API functions
import { useParams, useNavigate } from 'react-router-dom';

function EditCustomerPage() {
    const { id } = useParams(); // Get 'id' (which is cube_id_pk) from URL
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCustomer = useCallback(async () => {
        if (!id) return; // Should not happen if route is matched correctly
        // console.log(`EditCustomerPage: Fetching customer with id: ${id}`);
        try {
            setLoading(true);
            setError(null);
            const data = await getCustomerById(id);
            // console.log("EditCustomerPage: Data received for customer:", data);
            setCustomer(data);
        } catch (err) {
            console.error(`EditCustomerPage: Error fetching customer ${id}:`, err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [id]); // Dependency on 'id' from URL params

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    const handleUpdateCustomer = async (customerData) => {
        if (!customer) return; // Should have customer data loaded

        // The customerData from the form should contain all fields.
        // The updateCustomer service needs the original cust_timestamp for concurrency.
        // CustomerForm's useEffect should populate formData with initialData, including cust_timestamp.
        // And handleSubmit in CustomerForm should include cust_timestamp in submissionData for edit mode.
        const payload = {
            ...customerData,
            cube_id_pk: customer.cube_id_pk, // Ensure pk is not changed by form
            cust_timestamp: customer.cust_timestamp // Send back the original timestamp for concurrency
        };

        try {
            await updateCustomer(id, payload); // id here is customer.cube_id_pk
            alert('Customer updated successfully!');
            navigate('/customers');
        } catch (error) {
            console.error('Failed to update customer:', error);
            // The error might already be handled and displayed by CustomerForm's handleSubmit
            // If not, or for a general fallback:
            alert(`Error updating customer: ${error.response?.data?.message || error.response?.data?.title || error.message}`);
            throw error; // Re-throw to allow CustomerForm to potentially handle specific field errors
        }
    };

    if (loading) return <p>Loading customer data for editing...</p>;
    if (error) {
        return (
            <div className="error-page">
                <h2>Error Loading Customer</h2>
                <p>Could not load customer data: {error.response?.data?.title || error.response?.data?.message ||  error.message}</p>
                <p>The customer (ID: {id}) may not exist or there was a server issue.</p>
                <button onClick={() => navigate('/customers')}>Back to Customer List</button>
            </div>
        );
    }
    if (!customer) return <p>Customer not found or finished loading without data.</p>; // Should be caught by error typically

    return (
        <div>
            <h2>Edit Customer (ID: {customer.cube_id_pk})</h2>
            <CustomerForm
                onSubmit={handleUpdateCustomer}
                initialData={customer} // Pass the fetched customer data
                isEditMode={true}
            />
        </div>
    );
}

export default EditCustomerPage;