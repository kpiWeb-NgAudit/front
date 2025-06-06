// src/pages/CustomerListPage.jsx
import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { Link } from 'react-router-dom';
import { getAllCustomers, deleteCustomer as apiDeleteCustomer } from '../api/customerService'; // Import delete
import CustomerList from '../components/CustomerList'; // <<<--- IMPORT CustomerList

function CustomerListPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCustomers = useCallback(async () => { // Wrapped in useCallback
        // console.log("CustomerListPage: Attempting to fetch customers..."); // Keep for debugging if needed
        try {
            setLoading(true);
            setError(null);
            const data = await getAllCustomers();
            // console.log("CustomerListPage: Data received from API:", data);
            setCustomers(data || []);
        } catch (err) {
            console.error("CustomerListPage: Error fetching customers:", err);
            setError(err);
        } finally {
            setLoading(false);
            // console.log("CustomerListPage: Fetching complete.");
        }
    }, []); // Empty dependency array for fetchCustomers

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]); // fetchCustomers is now stable due to useCallback

    const handleDeleteCustomer = async (id) => {
        if (!window.confirm(`Are you sure you want to delete customer with ID: ${id}? This action cannot be undone.`)) {
            return;
        }
        try {
            await apiDeleteCustomer(id);
            // Re-fetch the list to show the updated state
            // Or, for optimistic update:
            setCustomers(prevCustomers => prevCustomers.filter(customer => customer.cube_id_pk !== id));
            alert(`Customer with ID: ${id} deleted successfully.`);
        } catch (err) {
            console.error(`Failed to delete customer ${id}:`, err);
            alert(`Error deleting customer: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div>
            <h1>Customers Management</h1>
            {/*
        The CustomerList component itself has an "Add New Customer" button now,
        so we might not need one here, unless you want it duplicated.
        Let's assume CustomerList handles its own "Add" button.
      */}
            {/* <Link to="/customers/add" className="button primary" style={{marginBottom: '20px', display: 'inline-block'}}>
        Add New Customer
      </Link> */}

            <CustomerList
                customers={customers}
                onDelete={handleDeleteCustomer}
                loading={loading}
                error={error}
            />
        </div>
    );
}

export default CustomerListPage;