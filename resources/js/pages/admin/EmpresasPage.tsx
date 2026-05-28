import { useEffect, useState } from 'react'
import { Pencil, Plus, Loader2 } from 'lucide-react'
import api from '@/lib/axios'

interface Empresa {
    id: number
    nome: string
    slug: string
    ativo: boolean
}

interface Errors { [key: string]: string[] }

const empty = { nome: '', ativo: true }

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<false | 'create' | 'edit'>(false)
    const [editing, setEditing] = useState<Empresa | null>(null)
    const [form, setForm] = useState(empty)
    const [errors, setErrors] = useState<Errors>({})
    const [saving, setSaving] = useState(false)

    async function load() {
        setLoading(true)
        try {
            const res = await api.get('/empresas')
            setEmpresas(res.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    function openCreate() {
        setForm(empty)
        setErrors({})
        setEditing(null)
        setModal('create')
    }

    function openEdit(e: Empresa) {
        setForm({ nome: e.nome, ativo: e.ativo })
        setErrors({})
        setEditing(e)
        setModal('edit')
    }

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault()
        setSaving(true)
        setErrors({})
        try {
            if (modal === 'create') {
                const res = await api.post('/empresas', form)
                setEmpresas(prev => [...prev, res.data])
            } else {
                const res = await api.put(`/empresas/${editing!.id}`, form)
                setEmpresas(prev => prev.map(e => e.id === editing!.id ? res.data : e))
            }
            setModal(false)
        } catch (err: any) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {})
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Administração</p>
                    <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">Empresas</h1>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 bg-(--primary) text-white px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                    <Plus size={12} /> Nova Empresa
                </button>
            </div>

            <div className="bg-card border border-(--border)">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-(--border)">
                                {['Nome', 'Slug', 'Status'].map(h => (
                                    <th key={h} className="px-4 py-2.5 text-left text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">{h}</th>
                                ))}
                                <th className="px-4 py-2.5 text-right text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-10 text-sm text-(--muted-foreground)">Carregando…</td></tr>
                            ) : empresas.map(e => (
                                <tr key={e.id} className="border-b border-(--border) last:border-0 hover:bg-muted transition-colors">
                                    <td className="px-4 py-2.5 text-sm font-medium text-(--foreground)">{e.nome}</td>
                                    <td className="px-4 py-2.5 text-[0.75rem] text-(--muted-foreground) font-mono">{e.slug}</td>
                                    <td className="px-4 py-2.5">
                                        {e.ativo
                                            ? <span className="inline-flex items-center px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider bg-green-500/10 text-green-600 border border-green-500/20">● Ativa</span>
                                            : <span className="inline-flex items-center px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">✕ Inativa</span>
                                        }
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button
                                            onClick={() => openEdit(e)}
                                            className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors"
                                        >
                                            <Pencil size={11} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-card border border-(--border) shadow-lg w-full max-w-sm p-6 flex flex-col gap-4">
                        <h2 className="text-[0.78rem] font-bold uppercase tracking-widest text-(--foreground)">
                            {modal === 'create' ? 'Nova Empresa' : 'Editar Empresa'}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-(--muted-foreground)">Nome</label>
                                <input
                                    value={form.nome}
                                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                                    className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors.nome ? 'border-(--destructive)' : 'border-(--border)'}`}
                                />
                                {errors.nome?.[0] && <p className="text-[0.68rem] text-(--destructive)">{errors.nome[0]}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="ativo"
                                    checked={form.ativo}
                                    onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
                                    className="accent-(--primary)"
                                />
                                <label htmlFor="ativo" className="text-[0.75rem] text-(--foreground) cursor-pointer">Empresa ativa</label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-(--border)">
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="border border-(--border) px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-1.5 bg-(--primary) text-white px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity"
                                >
                                    {saving && <Loader2 size={12} className="animate-spin" />}
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
