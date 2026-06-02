import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, LogIn, Wallet, ShoppingCart, Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'

const CYAN   = '#0099cc'
const BORDER = '#e8eaef'

export default function LoginPage() {
    const { login }   = useAuth()
    const navigate    = useNavigate()

    const [email,       setEmail]       = useState('')
    const [password,    setPassword]    = useState('')
    const [showPassword,setShowPassword]= useState(false)
    const [remember,    setRemember]    = useState(false)
    const [error,       setError]       = useState('')
    const [loading,     setLoading]     = useState(false)

    async function handleSubmit(e: React.SyntheticEvent) {
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
        <motion.div
            className="relative w-full mx-4"
            style={{ maxWidth: '400px' }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        >
            {/* Card */}
            <div className="bg-white overflow-hidden"
                 style={{
                     border: `1px solid ${BORDER}`,
                     boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12)',
                 }}>

                {/* Accent strip */}
                <div className="h-[3px] w-full"
                     style={{ background: `linear-gradient(90deg, ${CYAN} 0%, #dc2626 100%)` }} />

                {/* Brand */}
                <div className="flex items-center gap-3 px-7 pt-7 pb-5"
                     style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div className="w-9 h-9 flex items-center justify-center shrink-0"
                         style={{ background: `${CYAN}12`, border: `1.5px solid ${CYAN}28` }}>
                        <ShoppingCart size={16} style={{ color: CYAN }} />
                    </div>
                    <div>
                        <p className="text-[0.52rem] font-black uppercase tracking-[0.3em] text-muted-foreground">
                            Sistema de Convênio
                        </p>
                        <p className="text-[0.82rem] font-black uppercase tracking-[0.08em] text-foreground leading-none mt-0.5">
                            Baratão da Carne
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-4" autoComplete="off">

                    <div>
                        <p className="text-[0.52rem] font-black uppercase tracking-[0.28em] text-muted-foreground mb-1">
                            Acesso ao Sistema
                        </p>
                        <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                            Bem-vindo
                        </h2>
                    </div>

                    {/* E-mail */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
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
                            className="w-full px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground placeholder:opacity-40"
                            style={{ border: `1px solid ${BORDER}`, background: '#fafafa' }}
                            onFocus={e => (e.currentTarget.style.borderColor = CYAN)}
                            onBlur={e  => (e.currentTarget.style.borderColor = BORDER)}
                        />
                    </div>

                    {/* Senha */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                                className="w-full px-3 py-2.5 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground placeholder:opacity-40"
                                style={{ border: `1px solid ${BORDER}`, background: '#fafafa' }}
                                onFocus={e => (e.currentTarget.style.borderColor = CYAN)}
                                onBlur={e  => (e.currentTarget.style.borderColor = BORDER)}
                            />
                            {password.length > 0 && (
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lembrar + Consultar Limite */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={e => setRemember(e.target.checked)}
                                className="w-3.5 h-3.5"
                                style={{ accentColor: CYAN }}
                            />
                            <span className="text-[0.62rem] text-muted-foreground group-hover:text-foreground transition-colors">
                                Permanecer logado
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={() => navigate('/saldo')}
                            className="flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-[0.14em] transition-colors"
                            style={{ color: '#94a3b8' }}
                            onMouseEnter={e => (e.currentTarget.style.color = CYAN)}
                            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                        >
                            <Wallet size={11} /> Consultar Limite
                        </button>
                    </div>

                    {/* Erro */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-3 py-2.5 text-[0.68rem] font-semibold text-red-600"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 py-3 text-[0.62rem] font-black uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-1"
                        style={{ background: `linear-gradient(135deg, ${CYAN} 0%, #007aaa 100%)` }}
                    >
                        {loading
                            ? <Loader2 size={13} className="animate-spin" />
                            : <LogIn size={13} />
                        }
                        {loading ? 'Autenticando…' : 'Entrar'}
                    </button>
                </form>

                {/* Footer */}
                <div className="px-7 py-3 text-center" style={{ borderTop: `1px solid ${BORDER}`, background: '#fafafa' }}>
                    <p className="text-[0.5rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Baratão da Carne · {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
