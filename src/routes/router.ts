import axios from 'axios';
import { LoginAdminData } from '../assets/types/Users';


export async function adminLogin(data: LoginAdminData | any) {
    const res = await axios.post('http://localhost/api/users/authorize/', data);

    return res;
} 