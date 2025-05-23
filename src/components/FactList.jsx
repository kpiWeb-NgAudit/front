import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FACT_TYPES, FACT_ZONE_SPES, FACT_PARTITION_TYPES } from '../constants/enums';
import { DEFAULT_PASTE_PAYLOAD_BASE } from '../constants/defaults';
import { createFactFromPaste } from '../api/factService';
import './FactList.css';


const COLUMNS_CONFIG = [
    { key: 'factIdPk', header: 'ID', displayFn: data => data },
    { key: 'factTname', header: 'Tech Name', displayFn: data => data },
    { key: 'factType', header: 'Type', displayFn: data => FACT_TYPES[data] || data },
    { key: 'factShortcubename', header: 'Short Cube Name', displayFn: data => data },
    { key: 'customerCubeIdPk', header: 'Customer ID', displayFn: data => data },
    { key: 'factZonespe', header: 'Zone SPE', displayFn: data => FACT_ZONE_SPES[data] || data },
    { key: 'factPartitiontype', header: 'Partition Type', displayFn: data => FACT_PARTITION_TYPES[data] || data },
    {
        key: 'factLastupdate',
        header: 'Last Update',
        displayFn: data => data ? new Date(data).toLocaleString() : 'N/A'
    },
];
const ACTION_COLUMN_INDEX = COLUMNS_CONFIG.length;


const FactList = ({ facts, onDelete, loading, error, onFactsAdded }) => {
    const navigate = useNavigate();
    const [selectedCells, setSelectedCells] = useState(new Set());
    const [selectionAnchor, setSelectionAnchor] = useState(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const tableRef = useRef(null);
    const [isPasting, setIsPasting] = useState(false); // Feedback for paste operation
    const [showPasteInfo, setShowPasteInfo] = useState(false); // State for info popover visibility




    const handleCellMouseDown = (rowIndex, colIndex, event) => {
        if (colIndex === ACTION_COLUMN_INDEX) return;
        setIsMouseDown(true);
        event.preventDefault();
        if (tableRef.current) tableRef.current.focus();

        if (event.shiftKey && selectionAnchor) {
            const newSelected = new Set();
            const r1 = Math.min(selectionAnchor.rowIndex, rowIndex);
            const r2 = Math.max(selectionAnchor.rowIndex, rowIndex);
            const c1 = Math.min(selectionAnchor.colIndex, colIndex);
            const c2 = Math.max(selectionAnchor.colIndex, colIndex);
            for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) newSelected.add(`${r}-${c}`);
            setSelectedCells(newSelected);
        } else {
            setSelectedCells(new Set([`${rowIndex}-${colIndex}`]));
            setSelectionAnchor({ rowIndex, colIndex });
        }
    };

    const handleCellMouseMove = (rowIndex, colIndex) => {
        if (!isMouseDown || colIndex === ACTION_COLUMN_INDEX) return;
        if (selectionAnchor) {
            const newSelected = new Set();
            const r1 = Math.min(selectionAnchor.rowIndex, rowIndex);
            const r2 = Math.max(selectionAnchor.rowIndex, rowIndex);
            const c1 = Math.min(selectionAnchor.colIndex, colIndex);
            const c2 = Math.max(selectionAnchor.colIndex, colIndex);
            for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) newSelected.add(`${r}-${c}`);
            if (newSelected.size === 0 && selectionAnchor.rowIndex === rowIndex && selectionAnchor.colIndex === colIndex) {
                newSelected.add(`${selectionAnchor.rowIndex}-${selectionAnchor.colIndex}`);
            }
            setSelectedCells(newSelected);
        }
    };

    const handleMouseUp = useCallback(() => {
        setIsMouseDown(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseUp]);

    useEffect(() => {
        setSelectedCells(new Set());
        setSelectionAnchor(null);
    }, [facts]);

    const handleCopySelected = useCallback(async (eventSource = 'button') => {
        if (selectedCells.size === 0) {
            if (eventSource === 'button') alert('No cells selected.');
            return;
        }
        let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
        selectedCells.forEach(cellId => {
            const [r, c] = cellId.split('-').map(Number);
            minRow = Math.min(minRow, r); maxRow = Math.max(maxRow, r);
            minCol = Math.min(minCol, c); maxCol = Math.max(maxCol, c);
        });
        let clipboardText = '';
        for (let r = minRow; r <= maxRow; r++) {
            const row = facts[r];
            const rowText = [];
            for (let c = minCol; c <= maxCol; c++) {
                if (selectedCells.has(`${r}-${c}`)) {
                    const colConfig = COLUMNS_CONFIG[c];
                    if (row && colConfig) {
                        const cellData = row[colConfig.key];
                        rowText.push(colConfig.displayFn(cellData)?.toString() ?? '');
                    } else {
                        rowText.push('');
                    }
                } else {
                    rowText.push('');
                }
            }
            clipboardText += rowText.join('\t') + '\n';
        }
        clipboardText = clipboardText.trimEnd();
        try {
            await navigator.clipboard.writeText(clipboardText);
            if (eventSource === 'button') alert(`Copied ${selectedCells.size} cells!`);
        } catch (err) {
            console.error('Échec de la copie:', err);
            if (eventSource === 'button') alert('Échec de la copie. Vérifiez la console.');
        }
    }, [selectedCells, facts]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                if (tableRef.current && tableRef.current.contains(document.activeElement) && selectedCells.size > 0) {
                    e.preventDefault();
                    handleCopySelected('keyboard');
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedCells, handleCopySelected]);


    const pasteInfoContent = (
        <div className="paste-info-popover">
            <h4>Comment utiliser " Coller les Tech Names pour créer":</h4>
            <ol>
                <li>Préparez une liste de "Technical Names" dans une seule colonne dans Excel ou un éditeur de texte (un nom par ligne).</li>
                <li>Copiez cette colonne/liste dans votre presse-papiers (Ctrl+C ou Cmd+C).</li>
                <li>Cliquez sur le bouton "Coller les Tech Names à créer" button.</li>
                <li>Confirmer l'opération .</li>
            </ol>
            <p>
                De nouveaux "Facts" seront créés avec ces Technical Names.
                D'autres champs utiliseront des valeurs par défaut prédéfinies (par exemple, Customer ID: {DEFAULT_PASTE_PAYLOAD_BASE.customerCubeIdPk}).
            </p>
            <p>
                <strong>Note:</strong> Si un Technical Name existe déjà pour le customer par défaut, cet élément ne sera pas recréé et sera signalé comme un échec.
                Assurez-vous que chaque Technical Name collé comporte 20 caractères maximum.
            </p>
            <button onClick={() => setShowPasteInfo(false)} style={{marginTop: '10px'}}>Close</button>
        </div>
    );



    const handlePasteTechNames = async () => {
        const defaultCustomer = DEFAULT_PASTE_PAYLOAD_BASE.customerCubeIdPk;
        const userConfirmation = window.confirm(
            `Cela tentera de créer de nouveaux facts utilisant des 'Tech Names' à partir de votre clipboard. ` +
            `D'autres champs utiliseront des valeurs par défaut prédéfinies.\n\n` +
            `IMPORTANT: Le Customer ID utilisé sera '${defaultCustomer}'. ` +
            `Assurez-vous que ce customer EXISTE dans la base de données.\n\n` +
            `Voulez-vous continuer ?`
        );
        if (!userConfirmation) return;

        setIsPasting(true);
        let pastedText;
        try {
            pastedText = await navigator.clipboard.readText();
        } catch (err) {
            console.error("Échec de la lecture clipboard:", err);
            alert("Impossible de lire depuis le clipboard. Vérifiez les autorisations et le contexte sécurisé (HTTPS/localhost).");
            setIsPasting(false);
            return;
        }

        const lines = pastedText.split(/\r\n|\r|\n/)
            .map(line => line.split('\t')[0].trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) {
            alert("Aucun 'Tech Names' valide n'a été trouvé dans la première colonne du texte collé.");
            setIsPasting(false);
            return;
        }

        const uniqueTechNamesInBatch = Array.from(new Set(lines));
        if (uniqueTechNamesInBatch.length < lines.length) {
            alert(`Note: ${lines.length - uniqueTechNamesInBatch.length} des Tech Names en double ont été trouvés dans votre pâte et seuls les noms uniques seront traités pour ce lot.`);
        }

        const results = { succeeded: [], failed: [] };
        for (const techName of uniqueTechNamesInBatch) {
            if (techName.length > 20) {
                results.failed.push({ name: techName, error: 'Le Tech Name dépasse 20 caractères' });
                continue;
            }

            const payload = {
                ...DEFAULT_PASTE_PAYLOAD_BASE,
                factTname: techName,

            };

            try {
                const createdFact = await createFactFromPaste(payload);
                results.succeeded.push(createdFact);
            } catch (err) {
                const errorMessage = err.response?.data?.message ||
                    (err.response?.data?.errors && err.response.data.errors[0]?.defaultMessage) ||
                    err.message || 'Unknown API error';
                results.failed.push({ name: techName, error: errorMessage });
            }
        }

        let successCount = results.succeeded.filter(Boolean).length;
        let failureCount = results.failed.length;
        let skippedCount = uniqueTechNamesInBatch.length - successCount - failureCount;

        let feedbackMessage = "";
        if (successCount > 0) {
            feedbackMessage += `${successCount} fact(s) créé(s) avec succès.\n`;
            if (onFactsAdded) onFactsAdded();
        }
         if (skippedCount > 0) {
             feedbackMessage += `${skippedCount} fact(s) existaient déjà et ont été ignorés.\n`;
         }
        if (failureCount > 0) {
            feedbackMessage += `${failureCount} fact(s) non créé(s) (souvent en raison de problèmes de données déjà existants ou autres).\n`;
            feedbackMessage += `Veuillez vérifier la console du navigateur pour connaître les erreurs détaillées pour chaque élément ayant échoué..\n\nElements ayant echoue:\n`;
            results.failed.forEach(fail => {
                feedbackMessage += `- ${fail.name}: ${fail.error}\n`;
            });
            console.error("Impossible de créer certains facts à partir du collage:", results.failed);
        }

        if (!feedbackMessage) {
            feedbackMessage = "Traitement du collage terminé. Aucun nouvel élément n'a été créé (probablement tous des doublons ou des validations échouées).";
        }
        alert(feedbackMessage);
        setIsPasting(false);
    };


    // --- RENDER LOGIC ---
    const noFactsContent = (
        <div>
            <p>No facts found. <Link to="/add">Add one manually?</Link></p>
            <button
                className="primary"
                onClick={handlePasteTechNames}
                disabled={isPasting}
                style={{ marginTop: '10px' }}
            >
                {isPasting ? 'Coller...' : 'Collez les Tech Names à créer'}
            </button>
            <span
                className="info-icon"
                onClick={() => setShowPasteInfo(prev => !prev)}
                title="Comment utiliser la fonction Coller"
            >
                {/* Option 1: SVG Icon (simple circle i) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.064.293.006.399.287.47l.45.082.082-.38-.29-.071c-.294-.07-.352-.176-.288-.469l.738-3.468c.064-.293-.006-.399-.287-.47l-.45-.082.082-.38zm.058-3.496a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                    </svg>
                {/* Option 2: Character Icon */}
                {/* ⓘ */}
                </span>
            {showPasteInfo && pasteInfoContent}
        </div>
    );

    if (loading) return <p>Loading facts...</p>;
    if (error) return <p className="error-message">Error loading facts: {error.message}</p>;
    if (!facts.length) return noFactsContent;

    return (
        <div>
            <div className="toolbar" style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="primary" onClick={() => navigate('/add')}>Add Fact</button>
                <button
                    className="secondary"
                    onClick={() => handleCopySelected('button')}
                    disabled={!selectedCells.size || isPasting}
                >
                    Copy Selected ({selectedCells.size})
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}> {/* Group button and icon */}
                    <button
                    className="primary"
                    onClick={handlePasteTechNames}
                    disabled={isPasting}
                    >
                    {isPasting ? 'Coller...' : 'Collez les Tech Names à créer'}
                    </button>
                        <span
                            className="info-icon"
                            onClick={() => setShowPasteInfo(prev => !prev)} // Toggle visibility
                            title="Comment utiliser la fonction Coller" // Simple hover title
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                            {/* Option 1: SVG Icon (simple circle i) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" /* Increased size */
                                viewBox="0 0 16 16" style={{ verticalAlign: 'middle' }}>
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.064.293.006.399.287.47l.45.082.082-.38-.29-.071c-.294-.07-.352-.176-.288-.469l.738-3.468c.064-.293-.006-.399-.287-.47l-.45-.082.082-.38zm.058-3.496a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                            </svg>
                            {/* Option 2: Character Icon */}
                            {/* <span style={{ fontSize: '20px', lineHeight: '1' }}>ⓘ</span> */}
                        </span>
                </div>
            </div>
            {/* Conditionally render the popover */}
            {showPasteInfo && pasteInfoContent}
            <table ref={tableRef} className="selectable-table" tabIndex={0}>
                <thead>
                <tr>
                    {COLUMNS_CONFIG.map(col => <th key={col.key}>{col.header}</th>)}
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {facts.map((fact, rowIndex) => (
                    <tr key={fact.factIdPk}>
                        {COLUMNS_CONFIG.map((col, colIndex) => {
                            const cellId = `${rowIndex}-${colIndex}`;
                            const selected = selectedCells.has(cellId);
                            return (
                                <td
                                    key={cellId} // Use cellId for key for stability if col.key isn't unique across columns
                                    className={selected ? 'selected-cell' : ''}
                                    onMouseDown={e => handleCellMouseDown(rowIndex, colIndex, e)}
                                    onMouseMove={() => handleCellMouseMove(rowIndex, colIndex)}
                                >{col.displayFn(fact[col.key])}</td>
                            );
                        })}
                        <td className="actions">
                            <button className="secondary" onClick={() => navigate(`/edit/${fact.factIdPk}`)}>Edit</button>
                            <button
                                className="danger"
                                onClick={() => {
                                    if (window.confirm(`Delete fact "${fact.factTname || 'ID: '+fact.factIdPk}"?`)) {
                                        onDelete(fact.factIdPk);
                                    }
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

export default FactList;