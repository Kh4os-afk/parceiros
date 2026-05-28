import React, { createContext, useContext, useEffect, useState } from 'react'
import api, { setAuthToken, loadAuthToken } from '@/lib/axios'

interface Empresa {
    id: number
    nome: string
    slug: string
}

interface User {
    id: number
    name: string
    email: string
    role: 'admin' | 'user'
    empresa_id: number | null
    empresa: Empresa | null
}

interface AuthContextType {
    user: User | null
    loading: boolean
    isAdmin: boolean
    login: (email: string, password: string, remember?: boolean) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = loadAuthToken()
        if (!token) {
            setLoading(false)
            return
        }
        api.get('/user')
            .then(res => setUser(res.data.user))
            .catch(err => {
                if (err.response?.status === 401) setAuthToken(null)
            })
            .finally(() => setLoading(false))
    }, [])

    async function login(email: string, password: string, _remember = false) {
        const res = await api.post('/login', { email, password })
        setAuthToken(res.data.token)
        setUser(res.data.user)
    }

    async function logout() {
        await api.post('/logout').catch(() => {})
        setAuthToken(null)
        setUser(null)
    }

    const isAdmin = user?.role === 'admin'

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
    return ctx
}
