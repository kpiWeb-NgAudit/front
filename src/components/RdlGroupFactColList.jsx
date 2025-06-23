// src/components/RdlGroupFactColList.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Keep if you want to link to parent entity lists

const RdlGroupFactColList = ({ associations, loading, error }) => {
    if (loading) return <p>Loading RDL Group - Fact Column associations...</p>;
    if (error) return <p className="error-message">Error: {error.message || JSON.stringify(error)}</p>;

    if (!associations || !Array.isArray(associations) || associations.length === 0) {
        return <p>No associations found matching your criteria.</p>;
    }

    const displayCalcType = (calctype) => calctype || 'N/A';

    return (
        <div className="rdlgroup-factcol-list-container" style={{overflowX: "auto"}}>
            <table>
                <thead>
                <tr>
                    <th>RDL Group (ID)</th>
                    <th>Fact Column (ID)</th>
                    <th>Simple Calc 0</th>
                    <th>Simple Calc 1</th>
                    <th>Simple Calc 2</th>
                    <th>Simple Calc 3</th>
                    <th>Simple Calc 4</th>
                    <th>Complex Calc 0</th>
                    <th>Complex Calc 1</th>
                    <th>Complex Calc 2</th>
                    <th>Complex Calc 3</th>
                    <th>Complex Calc 4</th>
                    {/* <th>Actions</th> // REMOVED ACTIONS COLUMN */}
                </tr>
                </thead>
                <tbody>
                {associations.map((assoc) => (
                    <tr key={`${assoc.rdlGroupIdPk}-${assoc.factcolIdPk}`}>
                        <td>
                            {/* Option 1: Link to RDL Group List/Detail (if you have one) */}
                            {/* <Link to={`/rdl-groups#${assoc.rdlGroupIdPk}`}> {/* Might need a detail page or just list */ }
                            {/*    {assoc.rdlGroupName || 'N/A'} ({assoc.rdlGroupIdPk})
                            </Link> */}

                            {/* Option 2: Just display text */}
                            {assoc.rdlGroupName || 'N/A'} ({assoc.rdlGroupIdPk})
                        </td>
                        <td>
                            {/* Option 1: Link to Fact Column List/Detail (if you have one) */}
                            {/* <Link to={`/fact-columns?factIdPk=${assoc.factColumnParentFactIdPk}&highlight=${assoc.factcolIdPk}`}> */}
                            {/*    {assoc.factColumnName || 'N/A'} ({assoc.factcolIdPk})
                            </Link> */}

                            {/* Option 2: Just display text */}
                            {assoc.factColumnName || 'N/A'} ({assoc.factcolIdPk})
                        </td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlsimpleCalctype0)}</td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlsimpleCalctype1)}</td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlsimpleCalctype2)}</td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlsimpleCalctype3)}</td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlsimpleCalctype4)}</td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlcomplexCalctype0)}</td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlcomplexCalctype1)}</td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlcomplexCalctype2)}</td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlcomplexCalctype3)}</td>
                        <td>{displayCalcType(assoc.rdlgroupfactcolRdlcomplexCalctype4)}</td>
                        {/* No actions cell here */}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RdlGroupFactColList;