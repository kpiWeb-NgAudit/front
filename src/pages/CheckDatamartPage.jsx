// src/pages/CheckDatamartPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import engineService from '../api/Engine/engineService';
import { getAllCustomers } from '../api/customerService';

// Un petit composant helper pour la bannière de statut final
const StatusBanner = ({ status }) => {
    if (!status) return null;

    const statusConfig = {
        success: {
            className: 'alert-success',
            icon: '✅',
            message: 'Task completed successfully.'
        },
        error: {
            className: 'alert-danger',
            icon: '❌',
            message: 'Task finished with errors or warnings. Please check the logs.'
        }
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
        <div className={`alert ${config.className} d-flex align-items-center mt-4`} role="alert">
            <span className="me-2" style={{ fontSize: '1.5rem' }}>{config.icon}</span>
            <div>
                <strong>{config.message}</strong>
            </div>
        </div>
    );
};


function CheckDatamartPage() {
    const [outputLines, setOutputLines] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(''); // Pour les erreurs de communication
    const [finalStatus, setFinalStatus] = useState(null); // 'success' ou 'error'

    const [customers, setCustomers] = useState([]);
    const [selectedCube, setSelectedCube] = useState('');

    // Référence à la div des logs pour le scroll automatique
    const logContainerRef = useRef(null);
    // Référence pour l'intervalle afin de pouvoir l'annuler proprement
    const intervalRef = useRef(null);

    // Effet pour scroller vers le bas à chaque nouvelle ligne
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [outputLines]);

    // Effet pour charger les clients une seule fois
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const customerData = await getAllCustomers();
                setCustomers(customerData || []);
            } catch (err) {
                setApiError('Failed to load the customer list.');
            }
        };
        fetchCustomers();
    }, []);

    // Effet de nettoyage pour s'assurer que l'intervalle est arrêté si le composant est démonté
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
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

        // Par défaut, si la phrase de succès n'est pas trouvée, c'est une erreur.
        return 'error';
    };

    const streamOutput = (fullLog) => {
        const lines = fullLog.split('\n');
        let currentLine = 0;

        // Arrêter un intervalle précédent s'il existe
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            if (currentLine < lines.length) {
                setOutputLines(prevLines => [...prevLines, lines[currentLine]]);
                currentLine++;
            } else {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setFinalStatus(analyzeOutput(fullLog));
                setIsLoading(false);
            }
        }, 50); // Délai en ms entre chaque ligne
    };

    const handleRunCheckDatamart = async () => {
        setIsLoading(true);
        setApiError('');
        setOutputLines([]);
        setFinalStatus(null);

        const commandText = selectedCube
            ? `-checkdmart ${selectedCube}`
            : '-checkdmart (for all cubes)';
        setOutputLines([`> Starting engine command: ${commandText}...`]);

        try {
            const result = await engineService.runCheckDatamart(selectedCube);
            streamOutput(result);
        } catch (err) {
            setApiError(err.message || 'An unknown API error occurred.');
            setOutputLines(prev => [...prev, '\n--- API COMMUNICATION FAILED ---']);
            setFinalStatus('error');
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Check Datamart Integrity</h2>
            <p>
                This action runs the <code>-checkdmart</code> command. You can run it for a specific customer
                or for the entire datamart by leaving the filter empty.
            </p>

            <div className="card card-body mb-4">
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
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    {' '}Running...
                                </>
                            ) : (
                                'Run Command'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <StatusBanner status={finalStatus} />

            {apiError && (
                <div className="alert alert-danger mt-4">
                    <strong>API Error:</strong> {apiError}
                </div>
            )}

            {outputLines.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header fw-bold">
                        Engine Output
                    </div>
                    <div
                        className="card-body bg-dark text-white p-3 rounded-bottom"
                        ref={logContainerRef}
                        style={{ height: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.875em' }}
                    >
                        {outputLines.map((line, index) => (
                            <div key={index} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CheckDatamartPage;