import { useEffect, useState } from 'react'
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

const corners = [
    'top-0 left-0 border-t-2 border-l-2',
    'top-0 right-0 border-t-2 border-r-2',
    'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-0 right-0 border-b-2 border-r-2',
]

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
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">

            {/* ── Header ── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 6%, transparent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {corners.map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 border-(--primary)/30 ${cls}`} />
                ))}

                <div className="relative flex items-center justify-between px-7 pt-6 pb-5">
                    <div>
                        <p className="text-[0.5rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Administração</p>
                        <h1 className="text-xl font-black uppercase tracking-[0.08em] text-(--foreground)">Usuários</h1>
                        {!loading && (
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[0.55rem] text-(--muted-foreground)">
                                    <strong className="text-(--foreground)">{users.length}</strong> cadastrados
                                </span>
                                {admins > 0 && <>
                                    <span className="text-(--muted-foreground) opacity-30">·</span>
                                    <span className="flex items-center gap-1 text-[0.55rem] text-blue-500">
                                        <ShieldCheck size={9} /> {admins} admin{admins !== 1 ? 's' : ''}
                                    </span>
                                </>}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 bg-(--primary) text-white px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
                    >
                        <Plus size={11} /> Novo Usuário
                    </button>
                </div>
            </div>

            {/* ── Tabela ── */}
            <div className="bg-card border border-(--border)">
                <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserCog size={11} className="text-(--primary) opacity-70" />
                        <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                            Usuários do Sistema
                        </span>
                    </div>
                    <span className="text-[0.5rem] uppercase tracking-[0.18em] text-(--muted-foreground)">
                        {users.length} registro{users.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-(--border)">
                                {['Nome', 'E-mail', 'Empresa', 'Perfil'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground) whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                                <th className="px-5 py-3 text-right text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-14 text-[0.75rem] text-(--muted-foreground)">Carregando…</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id} className="group border-b border-(--border) last:border-0 hover:bg-muted transition-colors">
                                    <td className="px-5 py-3">
                                        <span className="text-[0.8rem] font-semibold text-(--foreground) group-hover:text-(--primary) transition-colors">
                                            {u.name}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.68rem] text-(--muted-foreground)">{u.email}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.68rem] text-(--muted-foreground)">
                                            {u.empresa?.nome ?? <span className="opacity-30 italic">—</span>}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {u.role === 'admin'
                                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.15em] bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                <ShieldCheck size={8} /> Admin
                                              </span>
                                            : <span className="text-[0.5rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground)">
                                                Usuário
                                              </span>
                                        }
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="inline-flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(u)} title="Editar"
                                                className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors">
                                                <Pencil size={11} />
                                            </button>
                                            {u.id !== me?.id && (
                                                <button onClick={() => setConfirmDelete(u)} title="Excluir"
                                                    className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-red-500 hover:border-red-500/40 transition-colors">
                                                    <Trash2 size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal criar/editar ── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative bg-card border border-(--border) shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="h-0.5 bg-(--primary) w-full" />
                        <div className="px-6 py-4 border-b border-(--border) bg-muted">
                            <span className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-(--foreground)">
                                {modal === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4" autoComplete="off">
                            {/* Anti-autocomplete */}
                            <input type="text"     style={{ display: 'none' }} autoComplete="username"         tabIndex={-1} readOnly />
                            <input type="password" style={{ display: 'none' }} autoComplete="current-password" tabIndex={-1} readOnly />

                            {(['name', 'email'] as const).map(field => (
                                <div key={field} className="flex flex-col gap-1.5">
                                    <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                        {field === 'name' ? 'Nome' : 'E-mail'}
                                    </label>
                                    <input type="text" value={form[field]} autoComplete="new-password"
                                        onChange={e => set(field, e.target.value)}
                                        className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors[field] ? 'border-(--destructive)' : 'border-(--border)'}`}
                                    />
                                    {errors[field]?.[0] && <p className="text-[0.62rem] text-(--destructive)">{errors[field][0]}</p>}
                                </div>
                            ))}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                    Senha {modal === 'edit' && <span className="normal-case font-normal opacity-60">(deixe em branco para manter)</span>}
                                </label>
                                <input type="password" value={form.password} autoComplete="off"
                                    onChange={e => set('password', e.target.value)}
                                    className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors.password ? 'border-(--destructive)' : 'border-(--border)'}`}
                                />
                                {errors.password?.[0] && <p className="text-[0.62rem] text-(--destructive)">{errors.password[0]}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Perfil</label>
                                    <select value={form.role} onChange={e => set('role', e.target.value)}
                                        className="border border-(--border) px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary)">
                                        <option value="user">Usuário</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                                        Empresa <span className="text-(--destructive)">*</span>
                                    </label>
                                    <select value={form.empresa_id} required onChange={e => set('empresa_id', e.target.value)}
                                        className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors.empresa_id ? 'border-(--destructive)' : 'border-(--border)'}`}>
                                        <option value="" disabled>Selecione…</option>
                                        {empresas.map(e => (
                                            <option key={e.id} value={e.id}>{e.nome}</option>
                                        ))}
                                    </select>
                                    {errors.empresa_id?.[0] && <p className="text-[0.62rem] text-(--destructive)">{errors.empresa_id[0]}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-(--border)">
                                <button type="button" onClick={() => setModal(false)}
                                    className="border border-(--border) px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--foreground) transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex items-center gap-1.5 bg-(--primary) text-white px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] hover:opacity-90 disabled:opacity-60 transition-opacity">
                                    {saving && <Loader2 size={11} className="animate-spin" />}
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Confirm delete ── */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative bg-card border border-(--border) shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="h-0.5 bg-red-500 w-full" />
                        <div className="p-6 flex flex-col gap-5">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                    <Trash2 size={15} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-[0.72rem] font-black uppercase tracking-[0.15em] text-(--foreground) mb-1.5">
                                        Excluir usuário
                                    </p>
                                    <p className="text-[0.68rem] text-(--muted-foreground) leading-relaxed">
                                        <strong className="text-(--foreground)">{confirmDelete.name}</strong> será removido permanentemente.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-1 border-t border-(--border)">
                                <button onClick={() => setConfirmDelete(null)}
                                    className="border border-(--border) px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--foreground) transition-colors">
                                    Cancelar
                                </button>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] hover:opacity-90 disabled:opacity-60 transition-opacity">
                                    {deleting && <Loader2 size={11} className="animate-spin" />}
                                    Confirmar Exclusão
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
