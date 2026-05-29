import { useEffect, useState } from 'react'
import { Loader2, User, Lock } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'

interface Errors { [key: string]: string[] }

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
        <div className="flex flex-col gap-4 max-w-2xl animate-[fade-in_0.2s_ease-out]">
            <div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Conta</p>
                <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">Configurações</h1>
            </div>

            <div className="bg-card border border-(--border)">
                <div className="px-5 py-3 border-b border-(--border) bg-muted flex items-center gap-2">
                    <User size={14} className="text-(--primary)" />
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">Perfil</span>
                </div>
                <form onSubmit={handleNameSubmit} className="p-5 flex flex-col gap-4" autoComplete="off">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Nome</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            className={fieldError(nameErrors, 'name') ? 'border-(--destructive)' : ''}
                        />
                        {fieldError(nameErrors, 'name') && (
                            <p className="text-[0.68rem] text-(--destructive)">{fieldError(nameErrors, 'name')}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">E-mail de login</label>
                        <Input value={user?.email ?? ''} disabled className="opacity-60 cursor-not-allowed" />
                        <p className="text-[0.58rem] text-(--muted-foreground)">O e-mail de acesso não pode ser alterado aqui.</p>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-(--border)">
                        <button
                            type="submit"
                            disabled={nameLoading || !name.trim()}
                            className="flex items-center gap-1.5 bg-(--primary) text-white px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity"
                        >
                            {nameLoading && <Loader2 size={12} className="animate-spin" />}
                            Salvar Nome
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-card border border-(--border)">
                <div className="px-5 py-3 border-b border-(--border) bg-muted flex items-center gap-2">
                    <Lock size={14} className="text-(--primary)" />
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">Senha de Login</span>
                </div>
                <form onSubmit={handlePasswordSubmit} className="p-5 flex flex-col gap-4" autoComplete="off">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Senha Atual</label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            autoComplete="current-password"
                            className={fieldError(passwordErrors, 'current_password') ? 'border-(--destructive)' : ''}
                        />
                        {fieldError(passwordErrors, 'current_password') && (
                            <p className="text-[0.68rem] text-(--destructive)">{fieldError(passwordErrors, 'current_password')}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Nova Senha</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                                className={fieldError(passwordErrors, 'password') ? 'border-(--destructive)' : ''}
                            />
                            {fieldError(passwordErrors, 'password') && (
                                <p className="text-[0.68rem] text-(--destructive)">{fieldError(passwordErrors, 'password')}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Confirmar Nova Senha</label>
                            <Input
                                type="password"
                                value={passwordConfirmation}
                                onChange={e => setPasswordConfirmation(e.target.value)}
                                autoComplete="new-password"
                                className={fieldError(passwordErrors, 'password_confirmation') ? 'border-(--destructive)' : ''}
                            />
                            {fieldError(passwordErrors, 'password_confirmation') && (
                                <p className="text-[0.68rem] text-(--destructive)">{fieldError(passwordErrors, 'password_confirmation')}</p>
                            )}
                        </div>
                    </div>
                    <p className="text-[0.58rem] text-(--muted-foreground)">Mínimo de 6 caracteres.</p>
                    <div className="flex justify-end pt-2 border-t border-(--border)">
                        <button
                            type="submit"
                            disabled={passwordLoading || !currentPassword || !password || !passwordConfirmation}
                            className="flex items-center gap-1.5 bg-(--primary) text-white px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity"
                        >
                            {passwordLoading && <Loader2 size={12} className="animate-spin" />}
                            Alterar Senha
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
