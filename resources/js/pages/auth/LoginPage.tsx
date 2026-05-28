import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password, remember)
            navigate('/dashboard')
        } catch {
            setError('Usuário ou senha inválidos.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-sm">
            <div className="bg-white border border-(--border) shadow-sm p-8">
                <div className="mb-8 text-center">
                    <p className="text-[0.98rem] tracking-[0.2em] uppercase text-(--muted-foreground) mb-1">
                        Sistema de Convênio
                    </p>
                    {/* <h1 className="text-2xl font-black tracking-widest uppercase text-(--primary)">
                        Baratão
                    </h1> */}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">
                            E-mail
                        </label>
                        <Input
                            type="text"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="exemplo@exemplo.com"
                            autoComplete="new-password"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">
                            Senha
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={e => setRemember(e.target.checked)}
                            className="accent-(--primary)"
                        />
                        <span className="text-[0.72rem] text-(--muted-foreground)">Permanecer logado</span>
                    </label>

                    {error && (
                        <p className="text-[0.75rem] text-(--destructive) bg-[oklch(0.577_0.245_27.325/0.08)] border border-[oklch(0.577_0.245_27.325/0.2)] px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-(--primary) text-white text-[0.7rem] font-bold uppercase tracking-widest py-2.5 transition-opacity hover:opacity-90 disabled:opacity-60 mt-1"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    )
}
