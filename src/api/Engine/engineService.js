import axios from 'axios';
// Adaptez le chemin si BASE_URL est dans un autre dossier
import { BASE_URL } from '../../config/apiConfig';

const API_URL = `${BASE_URL}/api/engine`;



/**
 * Exécute la commande -checkdmart.
 * @returns {Promise<string>} La sortie de la console du moteur.
 */
// Dans src/api/Engine/engineService.js

const runCheckDatamart = async (cubeName = null) => {
    try {
        const payload = cubeName ? { cubeName } : {};
        const response = await axios.post(`${API_URL}/check-datamart`, payload);

        // <<< CORRECTION CLÉ ICI : ON CHERCHE "output" AVEC UN 'o' MINUSCULE >>>
        if (response && typeof response.data === 'object' && response.data !== null && 'output' in response.data) {
            // On retourne la valeur associée à la clé "output"
            return response.data.output;
        } else {
            // Cette partie est maintenant une sécurité si le backend change de format
            console.error('Invalid API response format for -checkdmart:', response.data);
            throw new Error('Received an invalid response format from the server.');
        }

    } catch (error) {
        // La gestion d'erreur robuste reste la même
        console.error('Error running -checkdmart:', error);
        let errorMessage = 'Failed to execute -checkdmart command.';
        if (error.response) {
            errorMessage = error.response.data?.title || error.response.data?.message || JSON.stringify(error.response.data) || `Server responded with status ${error.response.status}`;
        } else if (error.request) {
            errorMessage = 'No response from server. Check network connection.';
        } else {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};

// ... le reste du service

// ... le reste du service
// FIN DE L'AJOUT


const engineService = {
    runCheckDatamart
};

export default engineService;