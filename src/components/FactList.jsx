// src/components/FactList.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FACT_TYPES, FACT_ZONE_SPES, FACT_PARTITION_TYPES } from '../constants/enums';
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

const FactList = ({ facts, onDelete, loading, error }) => {
    const navigate = useNavigate();
    const [selectedCells, setSelectedCells] = useState(new Set());
    const [selectionAnchor, setSelectionAnchor] = useState(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const tableRef = useRef(null);

    const handleCellMouseDown = (rowIndex, colIndex, event) => {
        if (colIndex === ACTION_COLUMN_INDEX) return;
        setIsMouseDown(true);
        event.preventDefault();
        // focus the table so keyboard events are caught
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
            if (newSelected.size === 0) newSelected.add(`${selectionAnchor.rowIndex}-${selectionAnchor.colIndex}`);
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
            minRow = Math.min(minRow, r);
            maxRow = Math.max(maxRow, r);
            minCol = Math.min(minCol, c);
            maxCol = Math.max(maxCol, c);
        });

        let clipboardText = '';
        for (let r = minRow; r <= maxRow; r++) {
            const row = facts[r];
            const rowText = [];
            for (let c = minCol; c <= maxCol; c++) {
                if (selectedCells.has(`${r}-${c}`)) {
                    const colConfig = COLUMNS_CONFIG[c];
                    const cellData = row[colConfig.key];
                    rowText.push(colConfig.displayFn(cellData)?.toString() ?? '');
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

    // Global Ctrl+C handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedCells.size > 0) {
                e.preventDefault();
                handleCopySelected('keyboard');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedCells, handleCopySelected]);

    if (loading) return <p>Loading facts...</p>;
    if (error) return <p className="error-message">Error loading facts: {error.message}</p>;
    if (!facts.length) return <p>No facts found. <Link to="/add">Add one?</Link></p>;

    return (
        <div>
            <div className="toolbar">
                <button className="primary" onClick={() => navigate('/add')}>Add Fact</button>
                <button className="secondary" onClick={() => handleCopySelected('button')} disabled={!selectedCells.size}>
                    Copy Selected ({selectedCells.size})
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
                                    key={cellId}
                                    className={selected ? 'selected-cell' : ''}
                                    onMouseDown={e => handleCellMouseDown(rowIndex, colIndex, e)}
                                    onMouseMove={() => handleCellMouseMove(rowIndex, colIndex)}
                                >{col.displayFn(fact[col.key])}</td>
                            );
                        })}
                        <td className="actions">
                            <button className="secondary" onClick={() => navigate(`/edit/${fact.factIdPk}`)}>Edit</button>
                            <button className="danger" onClick={() => onDelete(fact.factIdPk)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default FactList;
