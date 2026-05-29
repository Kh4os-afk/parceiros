import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ShoppingCart, LogIn, Wallet } from 'lucide-react'

export default function LoginPage() {
    const { login }   = useAuth()
    const navigate    = useNavigate()

    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [error,    setError]    = useState('')
    const [loading,  setLoading]  = useState(false)

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
        <div className="relative w-full max-w-3xl flex shadow-2xl border border-(--border) overflow-hidden">

            {/* ── Painel de marca (esquerdo) ── */}
            <div className="relative hidden md:flex flex-col justify-between w-[42%] p-10 overflow-hidden shrink-0"
                style={{ background: 'linear-gradient(42deg, #ff2222, #00c245f0)' }}>

                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {/* Cantos decorativos */}
                {[
                    'top-0 left-0 border-t-2 border-l-2',
                    'top-0 right-0 border-t-2 border-r-2',
                    'bottom-0 left-0 border-b-2 border-l-2',
                    'bottom-0 right-0 border-b-2 border-r-2',
                ].map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 border-white/30 ${cls}`} />
                ))}

                {/* Topo — logo */}
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/15 border border-white/25 flex items-center justify-center mb-6">
                        <ShoppingCart size={22} className="text-white" />
                    </div>
                    <p className="text-white/60 text-[0.48rem] uppercase tracking-[0.4em] mb-2">
                        Sistema de Convênio
                    </p>
                    <h1 className="text-white font-black uppercase text-[1.45rem] leading-tight tracking-wide">
                        Baratão<br />da Carne
                    </h1>
                </div>

                {/* Meio — descrição */}
                <div className="relative z-10 flex flex-col gap-3 my-8">
                    <div className="h-0.5 bg-white/15 w-full" />
                    <p className="text-white/60 text-[0.58rem] leading-relaxed">
                        Gestão de convênio de funcionários — controle de limites mensais, importação em massa e relatórios por período.
                    </p>
                </div>

                {/* Rodapé */}
                <div className="relative z-10">
                    <p className="text-white/40 text-[0.5rem] uppercase tracking-[0.25em]">
                        Baratão da Carne · {new Date().getFullYear()}
                    </p>
                </div>
            </div>

            {/* ── Formulário (direito) ── */}
            <div className="flex-1 bg-card flex flex-col justify-center px-10 py-12">

                <div className="mb-8">
                    <p className="text-[0.48rem] uppercase tracking-[0.35em] text-(--muted-foreground) mb-2">
                        Acesso ao Sistema
                    </p>
                    <h2 className="text-[1.3rem] font-black uppercase tracking-[0.06em] text-(--foreground) leading-tight">
                        Bem-vindo
                    </h2>
                    <p className="text-[0.62rem] text-(--muted-foreground) mt-1.5">
                        Insira suas credenciais para continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.5rem] font-black uppercase tracking-[0.22em] text-(--muted-foreground)">
                            E-mail
                        </label>
                        <input
                            type="text"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="usuario@exemplo.com"
                            autoComplete="new-password"
                            required
                            autoFocus
                            className="border border-(--border) px-3 py-2.5 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) placeholder:text-(--muted-foreground) placeholder:opacity-40 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.5rem] font-black uppercase tracking-[0.22em] text-(--muted-foreground)">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            className="border border-(--border) px-3 py-2.5 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) placeholder:text-(--muted-foreground) placeholder:opacity-40 transition-colors"
                        />
                    </div>

                    <div className="flex items-center justify-between mt-1">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={e => setRemember(e.target.checked)}
                                className="accent-(--primary) w-3.5 h-3.5"
                            />
                            <span className="text-[0.62rem] text-(--muted-foreground) group-hover:text-(--foreground) transition-colors">
                                Permanecer logado
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={() => navigate('/saldo')}
                            className="flex items-center gap-1.5 text-[0.58rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--primary) transition-colors"
                        >
                            <Wallet size={11} />
                            Consultar Limite
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500">
                            <span className="text-[0.68rem] font-semibold">{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-(--primary) text-white text-[0.58rem] font-black uppercase tracking-[0.2em] py-3 mt-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
                    >
                        {loading
                            ? <Loader2 size={13} className="animate-spin" />
                            : <LogIn size={13} />
                        }
                        {loading ? 'Autenticando…' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}
