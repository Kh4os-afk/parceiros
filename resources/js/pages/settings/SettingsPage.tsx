import { useEffect, useState } from 'react'
import { Loader2, User, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import api from '@/lib/axios'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

interface Errors { [key: string]: string[] }

const T = { bg: '#f4f5f8', border: '#e8eaef', cyan: '#0099cc', purple: '#7c3aed', green: '#059669', amber: '#d97706', red: '#dc2626' }
const cardStyle = { background: '#ffffff', border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger = (d = 0): any => ({ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: d } } })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rise: any = { hidden: { opacity: 0, y: 20, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

const inputBase = 'w-full rounded-md border border-[#e8eaef] bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0099cc] focus:ring-2 focus:ring-[#0099cc]/10 disabled:cursor-not-allowed disabled:opacity-50'
const inputError = 'border-red-500 focus:border-red-500 focus:ring-red-500/10'

export default function SettingsPage() {
    const { user, setUser } = useAuth()

    const [name, setName] = useState('')
    const [nameErrors, setNameErrors] = useState<Errors>({})
    const [nameLoading, setNameLoading] = useState(false)

    const [currentPassword, setCurrentPassword] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [passwordErrors, setPasswordErrors] = useState<Errors>({})
    const [passwordLoading, setPasswordLoading] = useState(false)

    useEffect(() => {
        if (user?.name) setName(user.name)
    }, [user?.name])

    async function handleNameSubmit(e: React.FormEvent) {
        e.preventDefault()
        setNameLoading(true)
        setNameErrors({})
        try {
            const res = await api.put('/profile', { name })
            setUser(res.data.user)
            toast.success('Nome atualizado com sucesso.')
        } catch (err: any) {
            if (err.response?.status === 422) {
                setNameErrors(err.response.data.errors ?? {})
            } else {
                toast.error('Não foi possível atualizar o nome.')
            }
        } finally {
            setNameLoading(false)
        }
    }

    async function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault()
        setPasswordLoading(true)
        setPasswordErrors({})
        try {
            await api.put('/profile/password', {
                current_password: currentPassword,
                password,
                password_confirmation: passwordConfirmation,
            })
            setCurrentPassword('')
            setPassword('')
            setPasswordConfirmation('')
            toast.success('Senha alterada com sucesso.')
        } catch (err: any) {
            if (err.response?.status === 422) {
                setPasswordErrors(err.response.data.errors ?? {})
            } else {
                toast.error('Não foi possível alterar a senha.')
            }
        } finally {
            setPasswordLoading(false)
        }
    }

    function fieldError(errors: Errors, field: string) {
        return errors[field]?.[0]
    }

    return (
        <motion.div
            style={{ background: T.bg }}
            className="-m-4 md:-m-6 p-4 md:p-6 min-h-screen"
            initial="hidden"
            animate="visible"
            variants={stagger(0)}
        >
            <div className="max-w-2xl flex flex-col gap-5">
                {/* Header */}
                <motion.div variants={rise}>
                    <p className="text-[0.6rem] uppercase tracking-[0.15em] text-gray-400 mb-0.5 font-semibold">Conta</p>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-gray-800">Configurações</h1>
                </motion.div>

                {/* Card Perfil */}
                <motion.div variants={rise} style={cardStyle} className="rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b" style={{ borderColor: T.border, background: '#fafbfc' }}>
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: `${T.cyan}18` }}>
                            <User size={14} style={{ color: T.cyan }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Perfil</span>
                    </div>
                    <form onSubmit={handleNameSubmit} className="p-5 flex flex-col gap-4" autoComplete="off">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Seu nome completo"
                                className={`${inputBase} ${fieldError(nameErrors, 'name') ? inputError : ''}`}
                            />
                            {fieldError(nameErrors, 'name') && (
                                <p className="text-xs text-red-500">{fieldError(nameErrors, 'name')}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail de login</label>
                            <input
                                value={user?.email ?? ''}
                                disabled
                                className={inputBase}
                            />
                            <p className="text-xs text-gray-400">O e-mail de acesso não pode ser alterado aqui.</p>
                        </div>
                        <div className="flex justify-end pt-3 border-t" style={{ borderColor: T.border }}>
                            <Button
                                type="submit"
                                disabled={nameLoading || !name.trim()}
                                className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-60"
                                style={{ background: T.cyan }}
                            >
                                {nameLoading && <Loader2 size={14} className="animate-spin" />}
                                Salvar
                            </Button>
                        </div>
                    </form>
                </motion.div>

                {/* Card Senha */}
                <motion.div variants={rise} style={cardStyle} className="rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b" style={{ borderColor: T.border, background: '#fafbfc' }}>
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: `${T.purple}18` }}>
                            <Lock size={14} style={{ color: T.purple }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Senha de Login</span>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="p-5 flex flex-col gap-4" autoComplete="off">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Senha Atual</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                autoComplete="current-password"
                                className={`${inputBase} ${fieldError(passwordErrors, 'current_password') ? inputError : ''}`}
                            />
                            {fieldError(passwordErrors, 'current_password') && (
                                <p className="text-xs text-red-500">{fieldError(passwordErrors, 'current_password')}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nova Senha</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className={`${inputBase} ${fieldError(passwordErrors, 'password') ? inputError : ''}`}
                                />
                                {fieldError(passwordErrors, 'password') && (
                                    <p className="text-xs text-red-500">{fieldError(passwordErrors, 'password')}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirmação</label>
                                <input
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={e => setPasswordConfirmation(e.target.value)}
                                    autoComplete="new-password"
                                    className={`${inputBase} ${fieldError(passwordErrors, 'password_confirmation') ? inputError : ''}`}
                                />
                                {fieldError(passwordErrors, 'password_confirmation') && (
                                    <p className="text-xs text-red-500">{fieldError(passwordErrors, 'password_confirmation')}</p>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">Mínimo de 6 caracteres.</p>
                        <div className="flex justify-end pt-3 border-t" style={{ borderColor: T.border }}>
                            <Button
                                type="submit"
                                disabled={passwordLoading || !currentPassword || !password || !passwordConfirmation}
                                className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-60"
                                style={{ background: T.purple }}
                            >
                                {passwordLoading && <Loader2 size={14} className="animate-spin" />}
                                Alterar Senha
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    )
}
