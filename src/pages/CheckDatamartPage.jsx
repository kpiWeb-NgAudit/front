import React, { useState, useEffect, useMemo } from 'react';
import engineService from '../api/Engine/engineService';
import { getAllCustomers } from '../api/customerService';

// Le composant StatusBanner reste le même.

const StatusBanner = ({ status, customMessage }) => {
    if (!status) return null;

    const config = {
        success: {
            className: 'alert-success',
            icon: '✅',
            defaultMessage: 'The task has terminated successfully.'
        },
        error: {
            className: 'alert-danger',
            icon: '❌',
            defaultMessage: 'Task finished with errors or warnings. Please check the logs.'
        }
    }[status];

    if (!config) return null;

    return (
        <div className={`alert ${config.className} d-flex align-items-center`} role="alert">
            <span className="me-2" style={{ fontSize: '1.5rem' }}>{config.icon}</span>
            <div>
                <strong>{customMessage || config.defaultMessage}</strong>
            </div>
        </div>
    );
};


function CheckDatamartPage() {
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(''); // Erreur de communication API
    const [finalStatus, setFinalStatus] = useState(null); // 'success' ou 'error'

    const [customers, setCustomers] = useState([]);
    const [selectedCube, setSelectedCube] = useState('');

    // Dans CheckDatamartPage.jsx, à l'intérieur du useEffect

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                // L'appel est maintenant garanti de retourner un tableau.
                const customerData = await getAllCustomers();
                setCustomers(customerData); // Pas besoin de `|| []` ici.
            } catch (err) {
                // Ce catch ne devrait plus être atteint si le service gère déjà l'erreur,
                // mais c'est une bonne sécurité.
                setApiError('Failed to load customer list for the filter.');
                setCustomers([]); // Assurer que c'est un tableau vide en cas d'erreur inattendue.
            }
        };
        fetchCustomers();
    }, []);

    const analyzeOutput = (logText) => {
        if (!logText) return 'error';
        const successPattern = /The task has terminated successfully/i;
        const errorPattern = /ERROR:|KPIW-\d{4}|Error-\d{4}/i;

        if (errorPattern.test(logText)) return 'error';
        if (successPattern.test(logText)) return 'success';


        if (/Warning-\d{4}/i.test(logText)) return 'error';

        return 'error';
    };

    // Dans CheckDatamartPage.jsx

    // Dans src/pages/CheckDatamartPage.jsx

    const handleRunCheckDatamart = async () => {
        // Réinitialisation
        setIsLoading(true);
        setApiError('');
        setFinalStatus(null);
        setOutput('');

        try {
            const result = await engineService.runCheckDatamart(selectedCube);
            setOutput(result);
            setFinalStatus(analyzeOutput(result));
        } catch (err) {
            // <<< GESTION D'ERREUR SIMPLIFIÉE ET SÛRE >>>
            // `err` est maintenant GARANTI d'être un objet Error avec une propriété .message
            // grâce à notre service blindé.
            const errorMessage = err.message;

            setApiError(errorMessage);
            setOutput(`--- COMMAND FAILED ---\n\n${errorMessage}`);
            setFinalStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    // <<< CORRECTION 2 : Gérer le formatage des logs >>>
    // On utilise useMemo pour ne recalculer le formatage que si 'output' change.
    const formattedOutput = useMemo(() => {
        // Remplace les sauts de ligne Windows (\r\n) et Unix (\n) par des éléments <br />
        // mais c'est déjà géré par `white-space: pre-wrap` dans le style de la balise <pre>.
        // Le simple fait d'afficher le texte dans une balise <pre> ou <code> suffit.
        return output;
    }, [output]);

    return (
        <div className="container mt-4">
            <h2>Check Datamart Integrity</h2>
            <p>
                Run the <code>-checkdmart</code> command. You can run it for a specific customer
                or for the entire datamart.
            </p>

            <div className="card card-body mb-4">
                {/* Le formulaire ne change pas */}
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

            {/* <<< CORRECTION 1 : AFFICHAGE DU STATUT FINAL >>> */}
            {/* On n'affiche la bannière de statut que si le processus n'est pas en cours */}
            {!isLoading && <StatusBanner status={finalStatus} />}

            {/* La bannière d'erreur API est séparée */}
            {apiError && (
                <div className="alert alert-danger mt-4">
                    <strong>API Communication Error:</strong> {apiError}
                </div>
            )}

            {/* Affiche les logs bruts si la variable output n'est pas vide */}
            {output && (
                <div className="card mt-4">
                    <div className="card-header">Engine Output</div>
                    <div className="card-body">
                        {/* La balise <pre> avec le style 'pre-wrap' est la clé pour le formatage */}
                        <pre className="bg-dark text-white p-3 rounded" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '500px', overflowY: 'auto' }}>
                            <code>{formattedOutput}</code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CheckDatamartPage;