import React, { useState, useEffect } from 'react';
import engineService from '../api/Engine/engineService';
import { getAllCustomers } from '../api/customerService';

// Un petit composant helper pour le message de statut
const StatusBanner = ({ status, message }) => {
    if (!status) return null;

    const statusConfig = {
        success: {
            className: 'alert-success',
            icon: '✅',
            defaultMessage: 'Task completed successfully.'
        },
        error: {
            className: 'alert-danger',
            icon: '❌',
            defaultMessage: 'Task failed. Check logs for details.'
        }
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
        <div className={`alert ${config.className} d-flex align-items-center`} role="alert">
            <span className="me-2" style={{ fontSize: '1.5rem' }}>{config.icon}</span>
            <div>
                <strong>{message || config.defaultMessage}</strong>
            </div>
        </div>
    );
};


function CheckDatamartPage() {
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); // Erreur de communication API
    const [finalStatus, setFinalStatus] = useState(null); // 'success' ou 'error'

    const [customers, setCustomers] = useState([]);
    const [selectedCube, setSelectedCube] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const customerData = await getAllCustomers();
                setCustomers(customerData || []);
            } catch (err) {
                setError('Failed to load customer list for the filter.');
            }
        };
        fetchCustomers();
    }, []);

    const analyzeOutput = (logText) => {
        if (!logText) return 'error';

        const successPattern = /The task has terminated successfully/i;
        const errorPattern = /ERROR:|KPIW-\d{4}|Error-\d{4}/i;

        if (errorPattern.test(logText)) {
            return 'error';
        }
        if (successPattern.test(logText)) {
            return 'success';
        }

        // Si aucun des deux n'est trouvé, on peut considérer que c'est une erreur par précaution
        // car la phrase de succès est manquante.
        return 'error';
    };

    const handleRunCheckDatamart = async () => {
        setIsLoading(true);
        setError('');
        setOutput('');
        setFinalStatus(null);

        const commandText = selectedCube ? `-checkdmart ${selectedCube}` : '-checkdmart (for all cubes)';
        setOutput(`Starting engine command: ${commandText}...`);

        try {
            const result = await engineService.runCheckDatamart(selectedCube);
            setOutput(result); // Affiche les logs bruts
            setFinalStatus(analyzeOutput(result)); // Analyse les logs et définit le statut
        } catch (err) {
            setError(err.message || 'An unknown error occurred.');
            setOutput(prev => prev + '\n\n--- API COMMUNICATION FAILED ---');
            setFinalStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Check Datamart Integrity</h2>
            <p>
                Run the <code>-checkdmart</code> command. You can run it for a specific customer
                or for the entire datamart.
            </p>

            <div className="card card-body mb-4">
                {/* ... (le formulaire avec le select et le bouton reste le même) ... */}
                <div className="row align-items-end">
                    <div className="col-md-8">
                        <label htmlFor="customerFilterCheckDmart" className="form-label">
                            Run for a Specific Customer (Optional)
                        </label>
                        <select
                            id="customerFilterCheckDmart"
                            className="form-select"
                            value={selectedCube}
                            onChange={(e) => setSelectedCube(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">All Customers</option>
                            {customers.map(cust => (
                                <option key={cust.cube_id_pk} value={cust.cube_id_pk}>
                                    {cust.cube_name} ({cust.cube_id_pk})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <button
                            className="btn btn-primary w-100"
                            onClick={handleRunCheckDatamart}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Running...' : 'Run Command'}
                        </button>
                    </div>
                </div>
            </div>

            {/* <<< BLOC D'AFFICHAGE DU STATUT FINAL >>> */}
            {!isLoading && <StatusBanner status={finalStatus} />}

            {error && (
                <div className="alert alert-danger mt-4">
                    <strong>API Error:</strong> {error}
                </div>
            )}

            {output && (
                <div className="card mt-4">
                    <div className="card-header">Engine Output</div>
                    <div className="card-body">
                        <pre className="bg-dark text-white p-3 rounded" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            <code>{output}</code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CheckDatamartPage;