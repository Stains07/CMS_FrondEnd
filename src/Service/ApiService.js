import axios from 'axios';

const BASE_URL = 'https://blueeye10.pythonanywhere.com/api/';

const ApiService = {
    login: (credentials, role) => {
        // Determine the API endpoint based on role
        let endpoint = '';
        switch (role) {
            case 'admin':
                endpoint = 'admin-login/';
                break;
            case 'doctor':
                endpoint = 'doctor/login/';
                break;
            case 'lab':
                endpoint = 'lab/login/';
                break;
            case 'pharmacist':
                endpoint = 'pharmacy/phar/login/';
                break;
            case 'receptionist':
                endpoint = 'auth/login/';
                break;
            default:
                endpoint = 'login/';
        }

        return axios.post(`${BASE_URL}${endpoint}`, credentials);
    },
};

export default ApiService;