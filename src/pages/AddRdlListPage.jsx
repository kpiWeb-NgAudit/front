// src/pages/AddRdlListPage.jsx
import React, {useMemo} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RdlListForm from '../components/RdlListForm';
import { createRdlList } from '../api/rdlListService';

function AddRdlListPage() {
    console.log("AddRdlListPage: Component rendering.");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedCubeIdPk = searchParams.get('cubeIdPk');
    console.log("AddRdlListPage: preselectedCubeIdPk from URL:", preselectedCubeIdPk);

    const handleAddRdlList = async (rdlListData) => {
        console.log("AddRdlListPage: handleAddRdlList called with data:", rdlListData);
        try {
            const newRdlList = await createRdlList(rdlListData);
            console.log("AddRdlListPage: RDL List created successfully:", newRdlList);
            alert(`RDL List "${newRdlList.rdlListName || newRdlList.rdlListIdPk}" created successfully!`);
            // Navigate back to the list, preserving filter if it was used to get here
            const navigateTo = rdlListData.CubeIdPk ? `/rdl-lists?cubeIdPk=${rdlListData.CubeIdPk}` : '/rdl-lists';
            console.log("AddRdlListPage: Navigating to:", navigateTo);
            navigate(navigateTo);
        } catch (error) {
            console.error('AddRdlListPage: Failed to create RDL List:', error.response?.data || error.message || error);
            // The RdlListForm will display specific errors from its own catch block
            // This alert is a fallback if the error isn't caught/displayed by the form.
            if (!error.response?.data?.errors && !error.response?.data?.title) { // Avoid double alerting if form showed it
                alert(`Error creating RDL List: ${error.response?.data?.message || error.response?.data?.title || error.message || 'An unexpected error occurred.'}`);
            }
            throw error; // Re-throw so RdlListForm can also update its error state if needed
        }
    };

    // initialData for RdlListForm:
    // If preselectedCubeIdPk exists, pass it so the customer dropdown in RdlListForm can be pre-filled.
    // RdlListForm's getInitialFormState uses the parentCubeIdPk prop for this.
    const initialFormProps = preselectedCubeIdPk ? { parentCubeIdPk: preselectedCubeIdPk } : {};
    console.log("AddRdlListPage: Passing to RdlListForm - parentCubeIdPk:", preselectedCubeIdPk);

    const stableEmptyInitialData = useMemo(() => ({}), []);


    return (
        <div>
            <h2>Add New RDL List</h2>
            <RdlListForm
                onSubmit={handleAddRdlList}
                onCancel={() => {
                    console.log("AddRdlListPage: Cancel clicked. Navigating back.");
                    navigate(preselectedCubeIdPk ? `/rdl-lists?cubeIdPk=${preselectedCubeIdPk}` : '/rdl-lists');
                }}

                isEditMode={false}
                initialData={stableEmptyInitialData}
                parentCubeIdPk={preselectedCubeIdPk} // This prop is used by RdlListForm
                // initialData can be used for other pre-fills if necessary, but parentCubeIdPk is key here
                //initialData={preselectedCubeIdPk ? { CubeIdPk: preselectedCubeIdPk } : {}}
            />
        </div>
    );
}
export default AddRdlListPage;