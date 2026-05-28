import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
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

export default function UsuariosPage() {
    const { user: me } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<false | 'create' | 'edit'>(false)
    const [editing, setEditing] = useState<User | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [errors, setErrors] = useState<Errors>({})
    const [saving, setSaving] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState<User | null>(null)
    const [deleting, setDeleting] = useState(false)

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

    function openCreate() {
        setForm(emptyForm)
        setErrors({})
        setEditing(null)
        setModal('create')
    }

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

    return (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Administração</p>
                    <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">Usuários</h1>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 bg-(--primary) text-white px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                    <Plus size={12} /> Novo Usuário
                </button>
            </div>

            <div className="bg-card border border-(--border)">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-(--border)">
                                {['Nome', 'E-mail', 'Empresa', 'Perfil'].map(h => (
                                    <th key={h} className="px-4 py-2.5 text-left text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">{h}</th>
                                ))}
                                <th className="px-4 py-2.5 text-right text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-10 text-sm text-(--muted-foreground)">Carregando…</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id} className="border-b border-(--border) last:border-0 hover:bg-muted transition-colors">
                                    <td className="px-4 py-2.5 text-sm font-medium text-(--foreground)">{u.name}</td>
                                    <td className="px-4 py-2.5 text-[0.75rem] text-(--muted-foreground)">{u.email}</td>
                                    <td className="px-4 py-2.5 text-[0.75rem] text-(--muted-foreground)">{u.empresa?.nome ?? <span className="italic opacity-50">—</span>}</td>
                                    <td className="px-4 py-2.5">
                                        {u.role === 'admin'
                                            ? <span className="inline-flex items-center px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">Admin</span>
                                            : <span className="inline-flex items-center px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider bg-muted text-(--muted-foreground) border border-(--border)">Usuário</span>
                                        }
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="inline-flex gap-1">
                                            <button
                                                onClick={() => openEdit(u)}
                                                className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                            {u.id !== me?.id && (
                                                <button
                                                    onClick={() => setConfirmDelete(u)}
                                                    className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-red-600 hover:border-red-300 transition-colors"
                                                >
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

            {/* Modal criar/editar */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-card border border-(--border) shadow-lg w-full max-w-sm p-6 flex flex-col gap-4">
                        <h2 className="text-[0.78rem] font-bold uppercase tracking-widest text-(--foreground)">
                            {modal === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3" autoComplete="off">
                            {/* Campos isca invisíveis — impedem o Chrome de preencher os campos reais */}
                            <input type="text" style={{ display: 'none' }} autoComplete="username" tabIndex={-1} readOnly />
                            <input type="password" style={{ display: 'none' }} autoComplete="current-password" tabIndex={-1} readOnly />

                            {(['name', 'email'] as const).map(field => (
                                <div key={field} className="flex flex-col gap-1.5">
                                    <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">
                                        {field === 'name' ? 'Nome' : 'E-mail'}
                                    </label>
                                    <input
                                        type="text"
                                        value={form[field]}
                                        autoComplete="new-password"
                                        onChange={e => set(field, e.target.value)}
                                        className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors[field] ? 'border-(--destructive)' : 'border-(--border)'}`}
                                    />
                                    {errors[field]?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors[field][0]}</p>}
                                </div>
                            ))}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">
                                    Senha {modal === 'edit' && <span className="normal-case">(deixe em branco para manter)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={form.password}
                                    autoComplete='off'
                                    onChange={e => set('password', e.target.value)}
                                    className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors.password ? 'border-(--destructive)' : 'border-(--border)'}`}
                                />
                                {errors.password?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors.password[0]}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Perfil</label>
                                    <select
                                        value={form.role}
                                        onChange={e => set('role', e.target.value)}
                                        className="border border-(--border) px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary)"
                                    >
                                        <option value="user">Usuário</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">
                                        Empresa <span className="text-(--destructive)">*</span>
                                    </label>
                                    <select
                                        value={form.empresa_id}
                                        required
                                        onChange={e => set('empresa_id', e.target.value)}
                                        className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors.empresa_id ? 'border-(--destructive)' : 'border-(--border)'}`}
                                    >
                                        <option value="" disabled>Selecione…</option>
                                        {empresas.map(e => (
                                            <option key={e.id} value={e.id}>{e.nome}</option>
                                        ))}
                                    </select>
                                    {errors.empresa_id?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors.empresa_id[0]}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-(--border)">
                                <button type="button" onClick={() => setModal(false)} className="border border-(--border) px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--foreground) transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-(--primary) text-white px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity">
                                    {saving && <Loader2 size={12} className="animate-spin" />}
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm delete */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-card border border-(--border) shadow-lg w-full max-w-sm p-6 flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-(--foreground)">Excluir usuário</p>
                                <p className="text-[0.78rem] text-(--muted-foreground) mt-1">
                                    <strong>{confirmDelete.name}</strong> será removido permanentemente.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setConfirmDelete(null)} className="border border-(--border) px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--foreground) transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity">
                                {deleting && <Loader2 size={12} className="animate-spin" />}
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
