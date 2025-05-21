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
            console.error('Copy failed:', err);
            if (eventSource === 'button') alert('Copy failed. Check console.');
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



    const handlePasteTechNames = async () => {
        const defaultCustomer = DEFAULT_PASTE_PAYLOAD_BASE.customerCubeIdPk;
        const userConfirmation = window.confirm(
            `This will attempt to create new facts using 'Tech Names' from your clipboard. ` +
            `Other fields will use predefined defaults.\n\n` +
            `IMPORTANT: The Customer ID used will be '${defaultCustomer}'. ` +
            `Ensure this customer EXISTS in the database.\n\n` +
            `Do you want to proceed?`
        );
        if (!userConfirmation) return;

        setIsPasting(true);
        let pastedText;
        try {
            pastedText = await navigator.clipboard.readText();
        } catch (err) {
            console.error("Failed to read clipboard:", err);
            alert("Could not read from clipboard. Ensure permission and secure context (HTTPS/localhost).");
            setIsPasting(false);
            return;
        }

        const lines = pastedText.split(/\r\n|\r|\n/)
            .map(line => line.split('\t')[0].trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) {
            alert("No valid 'Tech Names' found in the first column of pasted text.");
            setIsPasting(false);
            return;
        }

        const uniqueTechNamesInBatch = Array.from(new Set(lines));
        if (uniqueTechNamesInBatch.length < lines.length) {
            alert(`Note: ${lines.length - uniqueTechNamesInBatch.length} duplicate Tech Names were found in your paste and only unique ones will be processed for this batch.`);
        }

        const results = { succeeded: [], failed: [] };
        for (const techName of uniqueTechNamesInBatch) {
            if (techName.length > 20) {
                results.failed.push({ name: techName, error: 'Tech Name exceeds 20 characters.' });
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
            feedbackMessage += `${successCount} fact(s) created successfully.\n`;
            if (onFactsAdded) onFactsAdded();
        }
         if (skippedCount > 0) {
             feedbackMessage += `${skippedCount} fact(s) were already existing and were skipped.\n`;
         }
        if (failureCount > 0) {
            feedbackMessage += `${failureCount} fact(s) failed to create (often due to already existing or other data issues).\n`;
            feedbackMessage += `Please check the browser console for detailed errors for each failed item.\n\nFailed items:\n`;
            results.failed.forEach(fail => {
                feedbackMessage += `- ${fail.name}: ${fail.error}\n`;
            });
            console.error("Failed to create some facts from paste:", results.failed);
        }

        if (!feedbackMessage) {
            feedbackMessage = "Paste processing complete. No new items were created (possibly all duplicates or all failed validation).";
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
                {isPasting ? 'Pasting...' : 'Paste Tech Names to Create'}
            </button>
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
                <button
                    className="primary"
                    onClick={handlePasteTechNames}
                    disabled={isPasting}
                >
                    {isPasting ? 'Pasting...' : 'Paste Tech Names to Create'}
                </button>
            </div>
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