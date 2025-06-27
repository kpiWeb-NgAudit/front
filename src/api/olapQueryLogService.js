// Créez ce nouveau fichier : src/api/olapQueryLogService.js

import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';


const API_URL = `${BASE_URL}/api/olapquerylogs`;


const getLogs = (params) => {
    return axios.get(API_URL, { params });
};

const olapQueryLogService = {
    getLogs,
};

export default olapQueryLogService;