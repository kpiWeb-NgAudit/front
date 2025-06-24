// Créez ce nouveau fichier : src/api/olapQueryLogService.js

import axios from 'axios';

const API_URL = 'http://localhost:5208/api/olapquerylogs'; // Correspond au [Route] du contrôleur


const getLogs = (params) => {
    return axios.get(API_URL, { params });
};

const olapQueryLogService = {
    getLogs,
};

export default olapQueryLogService;