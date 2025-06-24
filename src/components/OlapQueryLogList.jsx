// Créez ce nouveau fichier : src/components/OlapQueryLogList.jsx

import React from 'react';

function OlapQueryLogList({ logs }) {
    if (!logs || logs.length === 0) {
        return <p>No logs found for the selected criteria.</p>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-striped table-sm">
                <thead>
                <tr>
                    <th>Start Time</th>
                    <th>User</th>
                    <th>Duration (ms)</th>
                    <th>Database</th>
                    <th>Dataset</th>
                    <th>Object Path</th>
                </tr>
                </thead>
                <tbody>
                {logs.map((log, index) => (
                    <tr key={index}> {/* Utiliser l'index comme clé est acceptable pour une liste statique */}
                        <td>{log.startTime ? new Date(log.startTime).toLocaleString() : 'N/A'}</td>
                        <td>{log.msolapUser || 'N/A'}</td>
                        <td>{log.duration}</td>
                        <td>{log.msolapDatabase}</td>
                        <td><small>{log.dataset}</small></td>
                        <td><small>{log.msolapObjectPath}</small></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default OlapQueryLogList;