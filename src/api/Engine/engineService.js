import axios from 'axios';
// Adaptez le chemin si BASE_URL est dans un autre dossier
import { BASE_URL } from '../../config/apiConfig';

const API_URL = `${BASE_URL}/api/engine`;



/**
 * Exécute la commande -checkdmart.
 * @returns {Promise<string>} La sortie de la console du moteur.
 */
const runCheckDatamart = async (cubeName = null) => {
    try {
        // Le payload contiendra le cubeName s'il est fourni.
        const payload = cubeName ? { cubeName } : {};
        const response = await axios.post(`${API_URL}/check-datamart`, payload);
        return response.data.Output;
    } catch (error) {
        console.error('Error running -checkdmart:', error.response?.data || error.message);
        throw new Error(error.response?.data?.title || error.response?.data || 'Failed to execute -checkdmart command.');
    }
};
// FIN DE L'AJOUT


const engineService = {
    runCheckDatamart
};

export default engineService;