// src/components/CustomerList.jsx (Recap of its structure)
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Potentially import enums if you want to display mapped values for some fields in the list
// import { CUST_LANGUAGES_MAP, CUST_CUBE_TYPES_MAP } from '../constants/customerEnums';

const CustomerList = ({ customers, onDelete, loading, error }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString(); // Or toLocaleString() for date and time
        } catch (e) {
            return dateString;
        }
    };

    if (loading) return <p>Loading customers...</p>;
    if (error) return <p className="error-message">Error loading customers: {error.message || JSON.stringify(error)}</p>;

    // The "Add New Customer" button is now part of this component's responsibility
    const noCustomersContent = (
        <div>
            <p>No customers found.</p>
            <button className="primary" onClick={() => navigate('/customers/add')} style={{ marginTop: '10px' }}>
                Add New Customer
            </button>
        </div>
    );

    if (!customers || customers.length === 0) {
        return noCustomersContent;
    }

    return (
        <div>
            <button className="primary" onClick={() => navigate('/customers/add')} style={{ marginBottom: '20px' }}>
                Add New Customer
            </button>
            <table>
                <thead>
                <tr>
                    <th>ID (cube_id_pk)</th>
                    <th>Name (cube_name)</th>
                    <th>Number (cube_number)</th>
                    <th>Type (cust_cubetype)</th>
                    {/* Add more columns as desired for the list view */}
                    <th>Country (cust_country)</th>
                    <th>Language (cust_language)</th>
                    <th>Last Update</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {customers.map((customer) => (
                    <tr key={customer.cube_id_pk}>
                        <td>{customer.cube_id_pk}</td>
                        <td>{customer.cube_name}</td>
                        <td>{customer.cube_number}</td>
                        <td>{customer.cust_cubetype}</td> {/* Or use a map: CUST_CUBE_TYPES_MAP[customer.cust_cubetype] || customer.cust_cubetype */}
                        <td>{customer.cust_country}</td>
                        <td>{customer.cust_language}</td> {/* Or use a map */}
                        <td>{formatDate(customer.cube_lastupdate)}</td>
                        <td className="actions">
                            <button className="secondary" onClick={() => navigate(`/customers/edit/${customer.cube_id_pk}`)}>Edit</button>
                            <button
                                className="danger"
                                onClick={() => {
                                    // Confirmation is now handled in CustomerListPage's handleDeleteCustomer
                                    onDelete(customer.cube_id_pk);
                                }}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerList;