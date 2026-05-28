import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[oklch(0.965_0_0)]">
                <div className="text-[var(--muted-foreground)] text-sm tracking-widest uppercase animate-pulse">
                    Carregando…
                </div>
            </div>
        )
    }

    if (!user) return <Navigate to="/login" replace />

    return <>{children}</>
}
