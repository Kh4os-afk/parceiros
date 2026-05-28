import React, { createContext, useContext, useEffect, useState } from 'react'
import api, { initCsrf } from '@/lib/axios'

interface User {
    id: number
    name: string
    email: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string, remember?: boolean) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/user')
            .then(res => setUser(res.data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    async function login(email: string, password: string, remember = false) {
        await initCsrf()
        const res = await api.post('/login', { email, password, remember })
        setUser(res.data.user)
    }

    async function logout() {
        await api.post('/logout')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
    return ctx
}
