import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Pencil, Plus, Trash2, Loader2, UserCog, ShieldCheck } from 'lucide-react'
import api from '@/lib/axios'
import { useAuth } from '@/contexts/AuthContext'

interface Empresa { id: number; nome: string }
interface User {
    id: number
    name: string
    email: string
    role: 'admin' | 'user'
    empresa_id: number | null
    empresa: Empresa | null
}
interface Errors { [key: string]: string[] }

const emptyForm = { name: '', email: '', password: '', role: 'user' as 'admin' | 'user', empresa_id: '' as string }

const T = {
    bg: '#f4f5f8',
    border: '#e8eaef',
    cyan: '#0099cc',
    purple: '#7c3aed',
    green: '#059669',
    amber: '#d97706',
    red: '#dc2626',
}

const rise: any = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modalVariants: any = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
}

export default function UsuariosPage() {
    const { user: me } = useAuth()
    const [users,         setUsers]         = useState<User[]>([])
    const [empresas,      setEmpresas]       = useState<Empresa[]>([])
    const [loading,       setLoading]        = useState(true)
    const [modal,         setModal]          = useState<false | 'create' | 'edit'>(false)
    const [editing,       setEditing]        = useState<User | null>(null)
    const [form,          setForm]           = useState(emptyForm)
    const [errors,        setErrors]         = useState<Errors>({})
    const [saving,        setSaving]         = useState(false)
    const [confirmDelete, setConfirmDelete]  = useState<User | null>(null)
    const [deleting,      setDeleting]       = useState(false)

    async function load() {
        setLoading(true)
        try {
            const [u, e] = await Promise.all([api.get('/users'), api.get('/empresas')])
            setUsers(u.data)
            setEmpresas(e.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    function openCreate() { setForm(emptyForm); setErrors({}); setEditing(null); setModal('create') }
    function openEdit(u: User) {
        setForm({ name: u.name, email: u.email, password: '', role: u.role, empresa_id: String(u.empresa_id ?? '') })
        setErrors({})
        setEditing(u)
        setModal('edit')
    }

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault()
        setSaving(true)
        setErrors({})
        try {
            const payload = { ...form, empresa_id: form.empresa_id === '' ? null : Number(form.empresa_id) }
            if (modal === 'create') {
                const res = await api.post('/users', payload)
                setUsers(prev => [...prev, res.data])
            } else {
                const res = await api.put(`/users/${editing!.id}`, payload)
                setUsers(prev => prev.map(u => u.id === editing!.id ? res.data : u))
            }
            setModal(false)
        } catch (err: any) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!confirmDelete) return
        setDeleting(true)
        try {
            await api.delete(`/users/${confirmDelete.id}`)
            setUsers(prev => prev.filter(u => u.id !== confirmDelete.id))
            setConfirmDelete(null)
        } finally {
            setDeleting(false)
        }
    }

    function set(field: string, value: string) {
        setForm(f => ({ ...f, [field]: value }))
        setErrors(e => ({ ...e, [field]: [] }))
    }

    const admins = users.filter(u => u.role === 'admin').length

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            style={{ background: T.bg }}
            className="-m-4 md:-m-6 p-4 md:p-6 min-h-screen flex flex-col gap-5"
        >
            {/* ── Header ── */}
            <motion.div variants={rise}>
                <div
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 md:px-7 pt-5 md:pt-6 pb-4 md:pb-5"
                    style={{
                        background: '#ffffff',
                        border: `1px solid ${T.border}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                >
                    <div>
                        <p className="text-[0.5rem] uppercase tracking-[0.3em] mb-1" style={{ color: '#94a3b8' }}>
                            Administração
                        </p>
                        <h1 className="text-xl font-black uppercase tracking-[0.08em]" style={{ color: '#1e293b' }}>
                            Usuários
                        </h1>
                        {!loading && (
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[0.55rem]" style={{ color: '#94a3b8' }}>
                                    <strong style={{ color: '#1e293b' }}>{users.length}</strong> cadastrados
                                </span>
                                {admins > 0 && (
                                    <>
                                        <span style={{ color: '#94a3b8', opacity: 0.4 }}>·</span>
                                        <span className="flex items-center gap-1 text-[0.55rem]" style={{ color: T.cyan }}>
                                            <ShieldCheck size={9} /> {admins} admin{admins !== 1 ? 's' : ''}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-85"
                        style={{ background: T.cyan, color: '#ffffff' }}
                    >
                        <Plus size={11} /> Novo Usuário
                    </button>
                </div>
            </motion.div>

            {/* ── Tabela ── */}
            <motion.div
                variants={rise}
                style={{
                    background: '#ffffff',
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
            >
                <div
                    className="px-6 py-3.5 flex items-center justify-between"
                    style={{ borderBottom: `1px solid ${T.border}`, background: '#f8fafc' }}
                >
                    <div className="flex items-center gap-2">
                        <UserCog size={11} style={{ color: T.cyan, opacity: 0.8 }} />
                        <span className="text-[0.56rem] font-black uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>
                            Usuários do Sistema
                        </span>
                    </div>
                    <span className="text-[0.5rem] uppercase tracking-[0.18em]" style={{ color: '#94a3b8' }}>
                        {users.length} registro{users.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-max border-collapse">
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${T.border}` }}>
                                {['Nome', 'E-mail', 'Empresa', 'Perfil'].map(h => (
                                    <th
                                        key={h}
                                        className="px-5 py-3 text-left text-[0.5rem] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                                        style={{ color: '#64748b' }}
                                    >
                                        {h}
                                    </th>
                                ))}
                                <th
                                    className="px-5 py-3 text-right text-[0.5rem] font-black uppercase tracking-[0.2em]"
                                    style={{ color: '#64748b' }}
                                >
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-14 text-[0.75rem]" style={{ color: '#94a3b8' }}>
                                        Carregando…
                                    </td>
                                </tr>
                            ) : users.map((u, i) => (
                                <motion.tr
                                    key={u.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="group transition-colors"
                                    style={{ borderBottom: `1px solid ${T.border}` }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                                >
                                    <td className="px-5 py-3">
                                        <span className="text-[0.8rem] font-semibold transition-colors" style={{ color: '#1e293b' }}>
                                            {u.name}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.68rem]" style={{ color: '#64748b' }}>{u.email}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.68rem]" style={{ color: '#64748b' }}>
                                            {u.empresa?.nome ?? <span style={{ opacity: 0.3, fontStyle: 'italic' }}>—</span>}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {u.role === 'admin' ? (
                                            <span
                                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.15em]"
                                                style={{
                                                    background: `${T.cyan}15`,
                                                    color: T.cyan,
                                                    border: `1px solid ${T.cyan}30`,
                                                }}
                                            >
                                                <ShieldCheck size={8} /> Admin
                                            </span>
                                        ) : (
                                            <span className="text-[0.5rem] font-black uppercase tracking-[0.15em]" style={{ color: '#94a3b8' }}>
                                                Usuário
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="inline-flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(u)}
                                                title="Editar"
                                                className="inline-flex items-center justify-center w-7 h-7 transition-colors"
                                                style={{ border: `1px solid ${T.border}`, color: '#64748b' }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.color = T.cyan
                                                    e.currentTarget.style.borderColor = `${T.cyan}60`
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.color = '#64748b'
                                                    e.currentTarget.style.borderColor = T.border
                                                }}
                                            >
                                                <Pencil size={11} />
                                            </button>
                                            {u.id !== me?.id && (
                                                <button
                                                    onClick={() => setConfirmDelete(u)}
                                                    title="Excluir"
                                                    className="inline-flex items-center justify-center w-7 h-7 transition-colors"
                                                    style={{ border: `1px solid ${T.border}`, color: '#64748b' }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.color = T.red
                                                        e.currentTarget.style.borderColor = `${T.red}40`
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.color = '#64748b'
                                                        e.currentTarget.style.borderColor = T.border
                                                    }}
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* ── Modal criar/editar ── */}
            <AnimatePresence>
                {modal && (
                    <motion.div
                        key="modal-form-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{ background: 'rgba(15,23,42,0.55)' }}
                    >
                        <motion.div
                            key="modal-form"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="relative w-full max-w-sm mx-4 overflow-hidden"
                            style={{
                                background: '#ffffff',
                                border: `1px solid ${T.border}`,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                            }}
                        >
                            {/* Accent bar */}
                            <div style={{ height: 3, background: T.cyan, width: '100%' }} />

                            <div
                                className="px-6 py-4"
                                style={{ borderBottom: `1px solid ${T.border}`, background: '#f8fafc' }}
                            >
                                <span className="text-[0.58rem] font-black uppercase tracking-[0.2em]" style={{ color: '#1e293b' }}>
                                    {modal === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                                </span>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4" autoComplete="off">
                                {/* Anti-autocomplete hidden inputs */}
                                <input type="text"     style={{ display: 'none' }} autoComplete="username"         tabIndex={-1} readOnly />
                                <input type="password" style={{ display: 'none' }} autoComplete="current-password" tabIndex={-1} readOnly />

                                {(['name', 'email'] as const).map(field => (
                                    <div key={field} className="flex flex-col gap-1.5">
                                        <label className="text-[0.5rem] font-black uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>
                                            {field === 'name' ? 'Nome' : 'E-mail'}
                                        </label>
                                        <input
                                            type="text"
                                            value={form[field]}
                                            autoComplete="new-password"
                                            onChange={e => set(field, e.target.value)}
                                            className="px-3 py-2 text-sm outline-none transition-colors"
                                            style={{
                                                background: '#f8fafc',
                                                border: `1px solid ${errors[field] ? T.red : T.border}`,
                                                color: '#1e293b',
                                            }}
                                            onFocus={e => { e.currentTarget.style.borderColor = errors[field] ? T.red : T.cyan }}
                                            onBlur={e => { e.currentTarget.style.borderColor = errors[field] ? T.red : T.border }}
                                        />
                                        {errors[field]?.[0] && (
                                            <p className="text-[0.62rem]" style={{ color: T.red }}>{errors[field][0]}</p>
                                        )}
                                    </div>
                                ))}

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.5rem] font-black uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>
                                        Senha{' '}
                                        {modal === 'edit' && (
                                            <span className="normal-case font-normal" style={{ opacity: 0.6 }}>
                                                (deixe em branco para manter)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        autoComplete="off"
                                        onChange={e => set('password', e.target.value)}
                                        className="px-3 py-2 text-sm outline-none transition-colors"
                                        style={{
                                            background: '#f8fafc',
                                            border: `1px solid ${errors.password ? T.red : T.border}`,
                                            color: '#1e293b',
                                        }}
                                        onFocus={e => { e.currentTarget.style.borderColor = errors.password ? T.red : T.cyan }}
                                        onBlur={e => { e.currentTarget.style.borderColor = errors.password ? T.red : T.border }}
                                    />
                                    {errors.password?.[0] && (
                                        <p className="text-[0.62rem]" style={{ color: T.red }}>{errors.password[0]}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[0.5rem] font-black uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>
                                            Perfil
                                        </label>
                                        <select
                                            value={form.role}
                                            onChange={e => set('role', e.target.value)}
                                            className="px-3 py-2 text-sm outline-none transition-colors"
                                            style={{
                                                background: '#f8fafc',
                                                border: `1px solid ${T.border}`,
                                                color: '#1e293b',
                                            }}
                                            onFocus={e => { e.currentTarget.style.borderColor = T.cyan }}
                                            onBlur={e => { e.currentTarget.style.borderColor = T.border }}
                                        >
                                            <option value="user">Usuário</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[0.5rem] font-black uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>
                                            Empresa <span style={{ color: T.red }}>*</span>
                                        </label>
                                        <select
                                            value={form.empresa_id}
                                            required
                                            onChange={e => set('empresa_id', e.target.value)}
                                            className="px-3 py-2 text-sm outline-none transition-colors"
                                            style={{
                                                background: '#f8fafc',
                                                border: `1px solid ${errors.empresa_id ? T.red : T.border}`,
                                                color: '#1e293b',
                                            }}
                                            onFocus={e => { e.currentTarget.style.borderColor = errors.empresa_id ? T.red : T.cyan }}
                                            onBlur={e => { e.currentTarget.style.borderColor = errors.empresa_id ? T.red : T.border }}
                                        >
                                            <option value="" disabled>Selecione…</option>
                                            {empresas.map(e => (
                                                <option key={e.id} value={e.id}>{e.nome}</option>
                                            ))}
                                        </select>
                                        {errors.empresa_id?.[0] && (
                                            <p className="text-[0.62rem]" style={{ color: T.red }}>{errors.empresa_id[0]}</p>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="flex justify-end gap-2 pt-3"
                                    style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setModal(false)}
                                        className="px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] transition-colors"
                                        style={{ border: `1px solid ${T.border}`, color: '#64748b', background: 'transparent' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = '#1e293b' }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-85 disabled:opacity-60"
                                        style={{ background: T.cyan, color: '#ffffff' }}
                                    >
                                        {saving && <Loader2 size={11} className="animate-spin" />}
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Confirm delete ── */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        key="modal-delete-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{ background: 'rgba(15,23,42,0.55)' }}
                    >
                        <motion.div
                            key="modal-delete"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="relative w-full max-w-sm mx-4 overflow-hidden"
                            style={{
                                background: '#ffffff',
                                border: `1px solid ${T.border}`,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                            }}
                        >
                            {/* Accent bar */}
                            <div style={{ height: 3, background: T.red, width: '100%' }} />

                            <div className="p-6 flex flex-col gap-5">
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-9 h-9 flex items-center justify-center shrink-0"
                                        style={{
                                            background: `${T.red}12`,
                                            border: `1px solid ${T.red}30`,
                                        }}
                                    >
                                        <Trash2 size={15} style={{ color: T.red }} />
                                    </div>
                                    <div>
                                        <p className="text-[0.72rem] font-black uppercase tracking-[0.15em] mb-1.5" style={{ color: '#1e293b' }}>
                                            Excluir usuário
                                        </p>
                                        <p className="text-[0.68rem] leading-relaxed" style={{ color: '#64748b' }}>
                                            <strong style={{ color: '#1e293b' }}>{confirmDelete.name}</strong> será removido permanentemente.
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="flex justify-end gap-2 pt-1"
                                    style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                    <button
                                        onClick={() => setConfirmDelete(null)}
                                        className="px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] transition-colors"
                                        style={{ border: `1px solid ${T.border}`, color: '#64748b', background: 'transparent' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = '#1e293b' }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex items-center gap-1.5 px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-85 disabled:opacity-60"
                                        style={{ background: T.red, color: '#ffffff' }}
                                    >
                                        {deleting && <Loader2 size={11} className="animate-spin" />}
                                        Confirmar Exclusão
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
