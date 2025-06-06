// src/pages/AddCustomerPage.jsx
import React from 'react';
import CustomerForm from '../components/CustomerForm'; // <<<--- IMPORT CustomerForm
import { createCustomer } from '../api/customerService'; // <<<--- IMPORT API function
import { useNavigate } from 'react-router-dom';

function AddCustomerPage() {
    const navigate = useNavigate();

    const handleAddCustomer = async (customerData) => {
        try {
            // The CustomerForm's handleSubmit will prepare customerData.
            // Ensure it includes all required fields with valid defaults where necessary.
            // The createCustomer service might delete system-managed fields like cust_timestamp
            // or set defaults for cube_lastupdate/cube_lastprocess if not provided.
            const newCustomer = await createCustomer(customerData);
            alert(`Customer "${newCustomer.cube_name || newCustomer.cube_id_pk}" created successfully!`);
            navigate('/customers'); // Navigate to customer list on success
        } catch (error) {
            console.error('Failed to create customer:', error);
            // The error might be handled by CustomerForm's handleSubmit for field-specific messages.
            // This is a fallback alert.
            alert(`Error creating customer: ${error.response?.data?.message || error.response?.data?.title || error.message}`);
            throw error; // Re-throw to allow CustomerForm to potentially display more specific errors
        }
    };

    return (
        <div>
            <h2>Add New Customer</h2>
            <CustomerForm
                onSubmit={handleAddCustomer}
                isEditMode={false}
                // initialData is not needed for create mode, CustomerForm will use its getInitialFormState()
            />
        </div>
    );
}

export default AddCustomerPage;