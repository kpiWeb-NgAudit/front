// src/App.jsx
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FactListPage from './pages/FactListPage';
import AddFactPage from './pages/AddFactPage';
import EditFactPage from './pages/EditFactPage';

import CustomerListPage from './pages/CustomerListPage';
import AddCustomerPage from './pages/AddCustomerPage';
import EditCustomerPage from './pages/EditCustomerPage';

import DimensionListPage from './pages/DimensionListPage';
import AddDimensionPage from './pages/AddDimensionPage';
import EditDimensionPage from './pages/EditDimensionPage';

import NotFoundPage from './pages/NotFoundPage';
import './index.css';
import './pages/HomePage.css';
import EditHierarchyPage from "./pages/EditHierarchyPage.jsx";
import AddHierarchyPage from "./pages/AddHierarchyPage.jsx";
import HierarchyListPage from "./pages/HierarchyListPage.jsx";
import EditRolePage from "./pages/EditRolePage.jsx";
import AddRolePage from "./pages/AddRolePage.jsx";
import RoleListPage from "./pages/RoleListPage.jsx";
import HierDimColListPage from "./pages/HierDimColListPage.jsx";
import UserListPage from "./pages/UserListPage.jsx";
import AddUserPage from "./pages/AddUserPage.jsx";
import EditUserPage from "./pages/EditUserPage.jsx";
import CubeUserAssociationListPage from "./pages/CubeUserAssociationListPage.jsx";
import CubesetListPage from "./pages/CubesetListPage.jsx";
import AddCubesetPage from "./pages/AddCubesetPage.jsx";
import EditCubesetPage from "./pages/EditCubesetPage.jsx";
import DimDbExtractV2ListPage from "./pages/DimDbExtractV2ListPage.jsx";
import ExploitInstructionListPage from "./pages/ExploitInstructionListPage.jsx";
import AddExploitInstructionPage from "./pages/AddExploitInstructionPage.jsx";
import EditExploitInstructionPage from "./pages/EditExploitInstructionPage.jsx";
import SourceListPage from "./pages/SourceListPage.jsx";
import AddSourcePage from "./pages/AddSourcePage.jsx";
import EditSourcePage from "./pages/EditSourcePage.jsx";
import ThemeListPage from "./pages/ThemeListPage.jsx";
import RdlGroupListPage from "./pages/RdlGroupListPage.jsx";
import RdlTypeListPage from "./pages/RdlTypeListPage.jsx";
import RdlListPage from "./pages/RdlListPage.jsx";
import AddRdlListPage from "./pages/AddRdlListPage.jsx";
import EditRdlListPage from "./pages/EditRdlListPage.jsx";
import PerspectiveListPage from "./pages/PerspectiveListPage.jsx";
import AddPerspectivePage from "./pages/AddPerspectivePage.jsx";
import EditPerspectivePage from "./pages/EditPerspectivePage.jsx";
import PerspectiveFactAssociationListPage from "./pages/PerspectiveFactAssociationListPage.jsx";
import FactColumnListPage from "./pages/FactColumnListPage.jsx";
import AddFactColumnPage from "./pages/AddFactColumnPage.jsx";
import EditFactColumnPage from "./pages/EditFactColumnPage.jsx";
import RdlGroupFactColListPage from "./pages/RdlGroupFactColListPage.jsx";
import CalcTypeListPage from "./pages/CalcTypeListPage.jsx";
import CalcTypeFactColListPage from "./pages/CalcTypeFactColListPage.jsx";
import PerspectiveOutcalculationListPage from "./pages/PerspectiveOutcalculationListPage.jsx";
import AddPerspectiveOutcalculationPage from "./pages/AddPerspectiveOutcalculationPage.jsx";
import SourceFactAssociationListPage from "./pages/SourceFactAssociationListPage.jsx";
import OlapQueryLogPage from "./pages/OlapQueryLogPage.jsx";
import PerspDimnatListPage from "./pages/PerspDimnatListPage.jsx";
import FactDbExtractV2ListPage from "./pages/FactDbExtractV2ListPage.jsx";
import RoleDimcolListPage from "./pages/RoleDimcolListPage.jsx";
import DimColumnListPage from "./pages/DimColumnListPage.jsx";
import EditDimColumnPage from "./pages/EditDimColumnPage.jsx";



function App() {
    return (
        <Router>
            <Navbar/>
            <div className="container" style={{padding: '0 20px 20px 20px'}}>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>


                    <Route path="/facts" element={<FactListPage/>}/>
                    <Route path="/facts/add" element={<AddFactPage/>}/>
                    <Route path="/facts/edit/:id" element={<EditFactPage/>}/>


                    <Route path="/customers" element={<CustomerListPage/>}/>
                    <Route path="/customers/add" element={<AddCustomerPage/>}/>
                    <Route path="/customers/edit/:id" element={<EditCustomerPage/>}/>


                    <Route path="/dimensions" element={<DimensionListPage/>}/>
                    <Route path="/dimensions/add" element={<AddDimensionPage/>}/>
                    <Route path="/dimensions/edit/:id" element={<EditDimensionPage/>}/>


                    <Route path="/dimcolumns" element={<DimColumnListPage />} />
                    <Route path="/dimcolumns/edit/:id" element={<EditDimColumnPage />} />


                    <Route path="/hierarchies" element={<HierarchyListPage/>}/>
                    <Route path="/hierarchies/add" element={<AddHierarchyPage/>}/>
                    <Route path="/hierarchies/edit/:id" element={<EditHierarchyPage/>}/>

                    <Route path="/hierdimcols" element={<HierDimColListPage/>}/>


                    <Route path="/roles" element={<RoleListPage/>}/>
                    <Route path="/roles/add" element={<AddRolePage/>}/>
                    <Route path="/roles/edit/:id" element={<EditRolePage/>}/>


                    <Route path="/users" element={<UserListPage/>}/>
                    <Route path="/users/add" element={<AddUserPage/>}/>
                    <Route path="/users/edit/:id" element={<EditUserPage/>}/>


                    <Route path="/cubesets" element={<CubesetListPage/>}/>
                    <Route path="/cubesets/add" element={<AddCubesetPage/>}/>
                    <Route path="/cubesets/edit/:id" element={<EditCubesetPage/>}/>


                    <Route path="/exploit-instructions" element={<ExploitInstructionListPage/>}/>
                    <Route path="/exploit-instructions/add" element={<AddExploitInstructionPage/>}/>
                    <Route path="/exploit-instructions/edit/:id" element={<EditExploitInstructionPage/>}/>


                    <Route path="/sources" element={<SourceListPage/>}/>
                    <Route path="/sources/add" element={<AddSourcePage/>}/>
                    <Route path="/sources/edit/:id" element={<EditSourcePage/>}/>


                    <Route path="/customer-user-assignments" element={<CubeUserAssociationListPage/>}/>


                    <Route path="/data-extract-definitions" element={<DimDbExtractV2ListPage/>}/>


                    <Route path="/themes" element={<ThemeListPage/>}/>


                    <Route path="/rdl-groups" element={<RdlGroupListPage/>}/>
                    <Route path="/rdl-types" element={<RdlTypeListPage/>}/>




                    <Route path="/rdl-lists" element={<RdlListPage/>}/>
                    <Route path="/rdl-lists/add" element={<AddRdlListPage/>}/>
                    <Route path="/rdl-lists/edit/:id" element={<EditRdlListPage/>}/>


                    <Route path="/perspectives" element={<PerspectiveListPage/>}/>
                    <Route path="/perspectives/add" element={<AddPerspectivePage/>}/>
                    <Route path="/perspectives/edit/:id" element={<EditPerspectivePage/>}/>

                    <Route path="/perspective-fact-links" element={<PerspectiveFactAssociationListPage/>}/>


                    <Route path="/fact-columns" element={<FactColumnListPage/>}/>
                    <Route path="/fact-columns/add" element={<AddFactColumnPage/>}/>
                    <Route path="/fact-columns/edit/:id" element={<EditFactColumnPage/>}/>


                    <Route path="/rdlgroup-factcol-assignments" element={<RdlGroupFactColListPage/>}/>


                    <Route path="/calculation-types" element={<CalcTypeListPage />} />


                    <Route path="/calctype-factcol-settings" element={<CalcTypeFactColListPage />} />


                    <Route path="/perspective-outcalculations" element={<PerspectiveOutcalculationListPage />} />
                    <Route path="/perspective-outcalculations/add" element={<AddPerspectiveOutcalculationPage />} />


                    <Route path="/source-fact-links" element={<SourceFactAssociationListPage />} />

                    <Route path="/olap-query-logs" element={<OlapQueryLogPage />} />

                    <Route path="/perspective-dimension-links" element={<PerspDimnatListPage />} />

                    <Route path="/fact-db-extracts" element={<FactDbExtractV2ListPage />} />

                    <Route path="/role-dimcol-permissions" element={<RoleDimcolListPage />} />






                    <Route path="*" element={<NotFoundPage/>}/>

                </Routes>
            </div>
        </Router>
    );
}

export default App;