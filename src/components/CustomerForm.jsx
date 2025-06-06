// src/components/CustomerForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CUST_CUBE_TYPES, CUST_OS_TYPES, CUST_DB_TYPES, CUST_ERP_TYPES,
    CUST_REFRESH_FRQS, CUST_REFRESH_FRQ_MONTHS, CUST_RDL_INTERWIDLENS,
    CUST_LANGUAGES, CUST_RDL_CURRENCY_FORMATS, CUBE_DAILY_TASK_TRIGGERS,
    CUBE_LOCAL_CUB_GENERATES, CUST_SHOW_FISC_MEASURE_AND_SETS,
    CUST_SHOW_PCT_DIFFERENCE_BASE100S, CUBE_DIM_TIME_PK_MANAGERS,
    CUBE_GLOBAL_PERSPECTIVES, CUBE_DISTINCT_COUNT_PARTITIONS,
    CUBE_TYPE_NORMAL_REPLICAS,
    getDropdownOptions, getOptionalDropdownOptions
} from '../constants/customerEnums';

const CustomerForm = ({ onSubmit, initialData = null, isEditMode = false }) => {
    const navigate = useNavigate();
    const getInitialFormState = () => ({
        cube_id_pk: '',
        cube_number: 0,
        cube_name: '',
        cust_geocode: '',
        cust_town: '',
        cust_country: '',
        cust_cubetype: CUST_CUBE_TYPES[0] || '',
        cust_ostype: '',
        cust_dbtype: '',
        cust_erptype: CUST_ERP_TYPES[0] || '',
        cust_connect_str: '',

        cube_ftpuser: '',
        cube_ftppasswd: '',
        cust_refreshfrq: CUST_REFRESH_FRQS[0] || '',
        cust_refreshfrqmonth: CUST_REFRESH_FRQ_MONTHS[0] || '',
        cust_charseparator: '',
        cust_limitrdlfilter: 0,
        cust_rdlinterwidlen: CUST_RDL_INTERWIDLENS[0] || '',
        cube_identity: '',
        cust_language: CUST_LANGUAGES[0] || '',
        cube_nbproddatasources: 0,
        cube_proddatasource_prefix: '',
        cust_beginmonthfiscal: 1, // Default to 1 (January)
        cust_rdlcurrencyformat: CUST_RDL_CURRENCY_FORMATS[0] || '',
        cube_dailytasktrigger: CUBE_DAILY_TASK_TRIGGERS[0] || '',
        cube_localcubgenerate: CUBE_LOCAL_CUB_GENERATES[0] || '',
        cube_optimratio: '',
        cube_nbdimtimevcol: 0,
        cube_nbdimgeovcol: 0,
        cust_internalnotes: '',
        cust_externalnotes: '',
        cust_contact1: '',
        cust_contact2: '',
        cust_contact3: '',
        cust_showfiscmeasureandset: CUST_SHOW_FISC_MEASURE_AND_SETS[0] || '',
        cust_showpctdifferencebase100: CUST_SHOW_PCT_DIFFERENCE_BASE100S[0] || '',
        cube_dimtimepkmanager: CUBE_DIM_TIME_PK_MANAGERS[0] || '',
        cube_globalperspective: CUBE_GLOBAL_PERSPECTIVES[0] || '',
        cube_scope_mdxinstruction: '',
        cube_drillthroughnbrows: 0,
        cube_factcoldefaultmeasure: '',
        cube_distinctcountpartition: CUBE_DISTINCT_COUNT_PARTITIONS[0] || '',
        cube_typenormalreplica: CUBE_TYPE_NORMAL_REPLICAS[0] || '',
        cube_paramwhenreplica: '',
        cube_comments: '',

    });

    const [formData, setFormData] = useState(getInitialFormState());
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode && initialData) {

            const populatedData = { ...getInitialFormState() };
            for (const key in initialData) {
                if (initialData.hasOwnProperty(key) && populatedData.hasOwnProperty(key)) {
                    if (initialData[key] === null || typeof initialData[key] === 'undefined') {
                        populatedData[key] = '';
                    } else if (typeof initialData[key] === 'number') {
                        populatedData[key] = String(initialData[key]);
                    } else if (typeof initialData[key] === 'boolean') {
                        populatedData[key] = initialData[key];
                    }
                    else {
                        populatedData[key] = initialData[key];
                    }
                }
            }

            setFormData(populatedData);
        } else if (!isEditMode) {
            setFormData(getInitialFormState());
        }
    }, [initialData, isEditMode]);

    const validate = () => {
        const newErrors = {};
        const {
            cube_id_pk, cube_number, cube_name, cust_geocode, cust_town, cust_country,
            cust_cubetype, /* cust_ostype is optional */ /* cust_dbtype is optional */ cust_erptype,
            cust_connect_str, cube_ftpuser, cube_ftppasswd, cust_refreshfrq,
            cust_refreshfrqmonth, /* cust_charseparator is optional */ /* cust_limitrdlfilter is int */
            cust_rdlinterwidlen, cube_identity, cust_language, /* cube_nbproddatasources is int */
            /* cube_proddatasource_prefix is optional */ /* cust_beginmonthfiscal is int */
            cust_rdlcurrencyformat, cube_dailytasktrigger, cube_localcubgenerate,
            /* cube_optimratio is optional */ /* cube_nbdimtimevcol is int */ /* cube_nbdimgeovcol is int */
            /* cust_internalnotes is optional */ /* cust_externalnotes is optional */
            /* cust_contact1,2,3 are optional */ cust_showfiscmeasureandset,
            cust_showpctdifferencebase100, cube_dimtimepkmanager, cube_globalperspective,
            /* cube_scope_mdxinstruction is optional */ /* cube_drillthroughnbrows is int */
            /* cube_factcoldefaultmeasure is optional */ cube_distinctcountpartition,
            cube_typenormalreplica /* cube_paramwhenreplica is optional */ /* cube_comments is optional */
        } = formData;

        // --- Primary Key & Core Identifiers ---
        if (!isEditMode && !cube_id_pk) {
            newErrors.cube_id_pk = 'Customer ID (cube_id_pk) is required.';
        } else if (cube_id_pk && cube_id_pk.length > 15) {
            newErrors.cube_id_pk = 'Customer ID max 15 chars.';
        }

        if (cube_number === '' || isNaN(parseInt(cube_number))) { // cube_number is int (Required by type)
            newErrors.cube_number = 'Cube Number is required and must be a valid number.';
        }

        if (!cube_name) {
            newErrors.cube_name = 'Cube Name is required.';
        } else if (cube_name.length > 50) {
            newErrors.cube_name = 'Cube Name max 50 chars.';
        }

        // --- Location ---
        if (!cust_geocode) {
            newErrors.cust_geocode = 'Geocode is required.';
        } else if (cust_geocode.length > 7) {
            newErrors.cust_geocode = 'Geocode max 7 chars.';
        }

        if (!cust_town) {
            newErrors.cust_town = 'Town is required.';
        } else if (cust_town.length > 30) {
            newErrors.cust_town = 'Town max 30 chars.';
        }

        if (!cust_country) {
            newErrors.cust_country = 'Country is required.';
        } else if (cust_country.length > 30) {
            newErrors.cust_country = 'Country max 30 chars.';
        }

        // --- Technical Types & Configs (Required Enums/Regex based) ---
        if (!cust_cubetype) newErrors.cust_cubetype = 'Cube Type is required.';
        // cust_ostype is optional - length check if provided
        if (formData.cust_ostype && formData.cust_ostype.length > 8) newErrors.cust_ostype = 'OS Type max 8 chars.';
        // cust_dbtype is optional - length check if provided
        if (formData.cust_dbtype && formData.cust_dbtype.length > 8) newErrors.cust_dbtype = 'DB Type max 8 chars.';

        if (!cust_erptype) newErrors.cust_erptype = 'ERP Type is required.';

        if (!cust_connect_str) {
            newErrors.cust_connect_str = 'Connection String is required.';
        } else if (cust_connect_str.length > 100) {
            newErrors.cust_connect_str = 'Connection String max 100 chars.';
        }

        if (!cube_ftpuser) {
            newErrors.cube_ftpuser = 'FTP User is required.';
        } else if (cube_ftpuser.length > 12) {
            newErrors.cube_ftpuser = 'FTP User max 12 chars.';
        }

        if (!cube_ftppasswd) {
            newErrors.cube_ftppasswd = 'FTP Password is required.';
        } else if (cube_ftppasswd.length > 12) {
            newErrors.cube_ftppasswd = 'FTP Password max 12 chars.';
        }

        if (!cust_refreshfrq) newErrors.cust_refreshfrq = 'Refresh Frequency is required.';
        if (!cust_refreshfrqmonth) newErrors.cust_refreshfrqmonth = 'Refresh Frequency Month is required.';

        if (formData.cust_charseparator && formData.cust_charseparator.length > 255) {
            newErrors.cust_charseparator = 'Char Separator max 255 chars.';
        }
        // cust_limitrdlfilter is int (Required by type)
        if (formData.cust_limitrdlfilter === '' || isNaN(parseInt(formData.cust_limitrdlfilter))) {
            newErrors.cust_limitrdlfilter = 'Limit RDL Filter is required and must be a number.';
        }


        if (!cust_rdlinterwidlen) newErrors.cust_rdlinterwidlen = 'RDL Inter Wid Len is required.';

        if (!cube_identity) {
            newErrors.cube_identity = 'Cube Identity is required.';
        } else if (cube_identity.length > 35) {
            newErrors.cube_identity = 'Cube Identity max 35 chars.';
        }

        if (!cust_language) newErrors.cust_language = 'Language is required.';

        // cube_nbproddatasources is int (Required by type)
        if (formData.cube_nbproddatasources === '' || isNaN(parseInt(formData.cube_nbproddatasources))) {
            newErrors.cube_nbproddatasources = 'Nb Prod DataSources is required and must be a number.';
        }
        if (formData.cube_proddatasource_prefix && formData.cube_proddatasource_prefix.length > 3) {
            newErrors.cube_proddatasource_prefix = 'Prod DataSource Prefix max 3 chars.';
        }
        // cust_beginmonthfiscal is int (Required by type)
        if (formData.cust_beginmonthfiscal === '' || isNaN(parseInt(formData.cust_beginmonthfiscal))) {
            newErrors.cust_beginmonthfiscal = 'Begin Month Fiscal is required and must be a number.';
        } else {
            const month = parseInt(formData.cust_beginmonthfiscal);
            if (month < 1 || month > 12) {
                newErrors.cust_beginmonthfiscal = 'Begin Month Fiscal must be between 1 and 12.';
            }
        }


        if (!cust_rdlcurrencyformat) newErrors.cust_rdlcurrencyformat = 'RDL Currency Format is required.';
        if (!cube_dailytasktrigger) newErrors.cube_dailytasktrigger = 'Daily Task Trigger is required.';
        if (!cube_localcubgenerate) newErrors.cube_localcubgenerate = 'Local Cube Generate is required.';

        if (formData.cube_optimratio && formData.cube_optimratio.length > 255) {
            newErrors.cube_optimratio = 'Optim Ratio max 255 chars.';
        }
        // cube_nbdimtimevcol, cube_nbdimgeovcol are int (Required by type)
        if (formData.cube_nbdimtimevcol === '' || isNaN(parseInt(formData.cube_nbdimtimevcol))) {
            newErrors.cube_nbdimtimevcol = 'Nb Dim Time VCol is required and must be a number.';
        }
        if (formData.cube_nbdimgeovcol === '' || isNaN(parseInt(formData.cube_nbdimgeovcol))) {
            newErrors.cube_nbdimgeovcol = 'Nb Dim Geo VCol is required and must be a number.';
        }

        // cust_internalnotes, cust_externalnotes are optional (text type, usually no client-side length validation beyond textarea limits)

        // Optional Contacts (length validation if provided)
        if (formData.cust_contact1 && formData.cust_contact1.length > 100) newErrors.cust_contact1 = 'Contact 1 max 100 chars.';
        if (formData.cust_contact2 && formData.cust_contact2.length > 100) newErrors.cust_contact2 = 'Contact 2 max 100 chars.';
        if (formData.cust_contact3 && formData.cust_contact3.length > 100) newErrors.cust_contact3 = 'Contact 3 max 100 chars.';


        if (!cust_showfiscmeasureandset) newErrors.cust_showfiscmeasureandset = 'Show Fisc Measure & Set is required.';
        if (!cust_showpctdifferencebase100) newErrors.cust_showpctdifferencebase100 = 'Show Pct Diff Base 100 is required.';
        if (!cube_dimtimepkmanager) newErrors.cube_dimtimepkmanager = 'Dim Time PK Manager is required.';
        if (!cube_globalperspective) newErrors.cube_globalperspective = 'Global Perspective is required.';

        // cube_scope_mdxinstruction is optional (ntext)
        // cube_drillthroughnbrows is int (Required by type)
        if (formData.cube_drillthroughnbrows === '' || isNaN(parseInt(formData.cube_drillthroughnbrows))) {
            newErrors.cube_drillthroughnbrows = 'Drillthrough Nb Rows is required and must be a number.';
        }

        if (formData.cube_factcoldefaultmeasure && formData.cube_factcoldefaultmeasure.length > 255) {
            newErrors.cube_factcoldefaultmeasure = 'Fact Col Default Measure max 255 chars.';
        }

        if (!cube_distinctcountpartition) newErrors.cube_distinctcountpartition = 'Distinct Count Partition is required.';
        if (!cube_typenormalreplica) newErrors.cube_typenormalreplica = 'Type Normal Replica is required.';

        if (formData.cube_paramwhenreplica && formData.cube_paramwhenreplica.length > 15) {
            newErrors.cube_paramwhenreplica = 'Param When Replica max 15 chars.';
        }
        // cube_comments is optional (text)

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            console.log("Validation Errors:", errors);
            alert("Please correct the form errors.");
            return;
        }

        const submissionData = { ...formData };

        const numericFields = [
            'cube_number', 'cust_limitrdlfilter', 'cube_nbproddatasources',
            'cust_beginmonthfiscal', 'cube_nbdimtimevcol', 'cube_nbdimgeovcol',
            'cube_drillthroughnbrows'
        ];
        numericFields.forEach(field => {
            if (submissionData[field] !== '' && !isNaN(submissionData[field])) {
                submissionData[field] = parseInt(submissionData[field], 10);
            } else if (submissionData[field] === '') {
                submissionData[field] = 0;
            }
        });


        const optionalEnumFields = ['cust_ostype', 'cust_dbtype'];
        optionalEnumFields.forEach(field => {
            if (submissionData[field] === "") {
                submissionData[field] = null;
            }
        });

        const optionalStringFields = [
            'cust_charseparator', 'cube_proddatasource_prefix', 'cube_optimratio',
            'cust_internalnotes', 'cust_externalnotes', 'cust_contact1', 'cust_contact2',
            'cust_contact3', 'cube_scope_mdxinstruction', 'cube_factcoldefaultmeasure',
            'cube_paramwhenreplica', 'cube_comments'
        ];
        optionalStringFields.forEach(field => {
            if (submissionData[field] === "") {
                submissionData[field] = null;
            }
        });


        if (isEditMode && initialData && initialData.cust_timestamp) {
            submissionData.cust_timestamp = initialData.cust_timestamp; // Crucial for concurrency
        }


        if(!isEditMode) {

            delete submissionData.cube_lastupdate;
            delete submissionData.cube_lastprocess;
        }


        try {
            await onSubmit(submissionData);
        } catch (error) {
            console.error("Submission error in CustomerForm:", error);

            if (error.response?.data?.errors) {
                const backendErrors = {};
                for (const key in error.response.data.errors) {
                    backendErrors[key.toLowerCase()] = error.response.data.errors[key].join(', ');
                }
                setErrors(prev => ({...prev, ...backendErrors, form: 'Backend validation failed.'}));
                alert("Backend validation failed. Check field errors.");
            } else if (error.response?.data?.title && error.response.data.status === 400) {
                setErrors({ form: error.response.data.title });
                alert(`Error: ${error.response.data.title}`);
            } else if (error.response?.data) {
                setErrors({ form: typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data) });
                alert(`Error: ${typeof error.response.data === 'string' ? error.response.data : 'See console for details.'}`);
            } else {
                setErrors({ form: 'An unexpected error occurred.' });
                alert('An unexpected error occurred.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {errors.form && <p className="error-message">{errors.form}</p>}


            <fieldset>
                <legend>Basic Information</legend>
                <div className="form-group">
                    <label htmlFor="cube_id_pk">Customer ID (cube_id_pk) (*)</label>
                    <input type="text" id="cube_id_pk" name="cube_id_pk" value={formData.cube_id_pk} onChange={handleChange} maxLength="15" required readOnly={isEditMode} />
                    {errors.cube_id_pk && <p className="error-message">{errors.cube_id_pk}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="cube_number">Cube Number (*)</label>
                    <input type="number" id="cube_number" name="cube_number" value={formData.cube_number} onChange={handleChange} required />
                    {errors.cube_number && <p className="error-message">{errors.cube_number}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="cube_identity">Cube Identity (*)</label>
                    <input
                        type="text"
                        id="cube_identity"
                        name="cube_identity"
                        value={formData.cube_identity}
                        onChange={handleChange}
                        maxLength="35" // Corresponds to [StringLength(35)]
                        required     // HTML5 browser validation
                    />
                    {errors.cube_identity && <p className="error-message">{errors.cube_identity}</p>}
                </div>


                <div className="form-group">
                    <label htmlFor="cube_name">Cube Name (*)</label>
                    <input type="text" id="cube_name" name="cube_name" value={formData.cube_name} onChange={handleChange} maxLength="50" required />
                    {errors.cube_name && <p className="error-message">{errors.cube_name}</p>}
                </div>

                // Example for cust_erptype
                <div className="form-group">
                    <label htmlFor="cust_erptype">ERP Type (*)</label>
                    <select id="cust_erptype" name="cust_erptype" value={formData.cust_erptype} onChange={handleChange} required>
                        <option value="">Select ERP Type</option> {/* If no default is pre-selected */}
                        {getDropdownOptions(CUST_ERP_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.cust_erptype && <p className="error-message">{errors.cust_erptype}</p>}
                </div>

                // Example for cube_ftpuser
                <div className="form-group">
                    <label htmlFor="cube_ftpuser">FTP User (*)</label>
                    <input type="text" id="cube_ftpuser" name="cube_ftpuser" value={formData.cube_ftpuser} onChange={handleChange} maxLength="12" required />
                    {errors.cube_ftpuser && <p className="error-message">{errors.cube_ftpuser}</p>}
                </div>

                // Example for cube_ftppasswd
                <div className="form-group">
                    <label htmlFor="cube_ftppasswd">FTP Password (*)</label>
                    <input
                        type="password" // Use type="password" for passwords
                        id="cube_ftppasswd"
                        name="cube_ftppasswd"
                        value={formData.cube_ftppasswd}
                        onChange={handleChange}
                        maxLength="12"
                        required // HTML5 validation
                    />
                    {errors.cube_ftppasswd && <p className="error-message">{errors.cube_ftppasswd}</p>}
                </div>

                // Example for cust_rdlcurrencyformat (a select/dropdown)
                <div className="form-group">
                    <label htmlFor="cust_rdlcurrencyformat">RDL Currency Format (*)</label>
                    <select
                        id="cust_rdlcurrencyformat"
                        name="cust_rdlcurrencyformat"
                        value={formData.cust_rdlcurrencyformat}
                        onChange={handleChange}
                        required // HTML5 validation
                    >
                        <option value="">--- Select Format ---</option> {/* Important for required selects */}
                        {getDropdownOptions(CUST_RDL_CURRENCY_FORMATS).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {errors.cust_rdlcurrencyformat && <p className="error-message">{errors.cust_rdlcurrencyformat}</p>}
                </div>

            </fieldset>


            <fieldset>
                <legend>Location</legend>
                <div className="form-group">
                    <label htmlFor="cust_geocode">Geocode (*)</label>
                    <input type="text" id="cust_geocode" name="cust_geocode" value={formData.cust_geocode} onChange={handleChange} maxLength="7" required />
                    {errors.cust_geocode && <p className="error-message">{errors.cust_geocode}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="cust_town">Town (*)</label>
                    <input type="text" id="cust_town" name="cust_town" value={formData.cust_town} onChange={handleChange} maxLength="30" required />
                    {errors.cust_town && <p className="error-message">{errors.cust_town}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="cust_country">Country (*)</label>
                    <input type="text" id="cust_country" name="cust_country" value={formData.cust_country} onChange={handleChange} maxLength="30" required />
                    {errors.cust_country && <p className="error-message">{errors.cust_country}</p>}
                </div>
            </fieldset>


            <fieldset>
                <legend>Technical Details</legend>
                <div className="form-group">
                    <label htmlFor="cust_cubetype">Cube Type (*)</label>
                    <select id="cust_cubetype" name="cust_cubetype" value={formData.cust_cubetype} onChange={handleChange} required>
                        <option value="">Select Cube Type</option>
                        {getDropdownOptions(CUST_CUBE_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.cust_cubetype && <p className="error-message">{errors.cust_cubetype}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="cust_ostype">OS Type</label>
                    <select id="cust_ostype" name="cust_ostype" value={formData.cust_ostype} onChange={handleChange}>
                        {getOptionalDropdownOptions(CUST_OS_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.cust_ostype && <p className="error-message">{errors.cust_ostype}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="cust_language">Language (*)</label>
                    <select id="cust_language" name="cust_language" value={formData.cust_language} onChange={handleChange} required>
                        <option value="">Select Language</option>
                        {getDropdownOptions(CUST_LANGUAGES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.cust_language && <p className="error-message">{errors.cust_language}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="cust_connect_str">Connection String (*)</label>
                    <textarea id="cust_connect_str" name="cust_connect_str" value={formData.cust_connect_str} onChange={handleChange} maxLength="100" required rows="3"></textarea>
                    {errors.cust_connect_str && <p className="error-message">{errors.cust_connect_str}</p>}
                </div>
            </fieldset>


            <fieldset>
                <legend>Notes & Contacts</legend>
                <div className="form-group">
                    <label htmlFor="cust_internalnotes">Internal Notes</label>
                    <textarea id="cust_internalnotes" name="cust_internalnotes" value={formData.cust_internalnotes} onChange={handleChange} rows="3"></textarea>
                    {errors.cust_internalnotes && <p className="error-message">{errors.cust_internalnotes}</p>}
                </div>

            </fieldset>


            {/* Add more fieldsets for other groups of properties */}
            {/* Remember to handle all required fields and optional ones */}
            {/* Use <input type="number"> for integer fields */}
            {/* Use <textarea> for text/ntext fields */}

            <button type="submit" className="primary">{isEditMode ? 'Update Customer' : 'Create Customer'}</button>
            <button type="button" className="secondary" onClick={() => navigate('/customers')} style={{ marginLeft: '10px' }}>Cancel</button>
        </form>
    );
};

export default CustomerForm;