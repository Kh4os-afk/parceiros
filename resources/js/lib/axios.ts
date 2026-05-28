import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
})

// Remove Content-Type para FormData — deixa o browser setar multipart/form-data + boundary
api.interceptors.request.use(config => {
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
    }
    return config
})

export async function initCsrf(): Promise<void> {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true })
}

export default api
