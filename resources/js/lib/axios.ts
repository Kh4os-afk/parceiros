import axios from 'axios'

const TOKEN_KEY = 'spa_token'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
})

// Remove Content-Type para FormData
api.interceptors.request.use(config => {
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
    }
    return config
})

export function setAuthToken(token: string | null) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        localStorage.removeItem(TOKEN_KEY)
        delete api.defaults.headers.common['Authorization']
    }
}

export function loadAuthToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    return token
}

export default api
