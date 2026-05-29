import { useEffect, useState } from 'react'
import { Pencil, Plus, Loader2, Building2 } from 'lucide-react'
import api from '@/lib/axios'

interface Empresa { id: number; nome: string; slug: string; ativo: boolean }
interface Errors  { [key: string]: string[] }

const empty = { nome: '', ativo: true }

const corners = [
    'top-0 left-0 border-t-2 border-l-2',
    'top-0 right-0 border-t-2 border-r-2',
    'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-0 right-0 border-b-2 border-r-2',
]

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [loading,  setLoading]  = useState(true)
    const [modal,    setModal]    = useState<false | 'create' | 'edit'>(false)
    const [editing,  setEditing]  = useState<Empresa | null>(null)
    const [form,     setForm]     = useState(empty)
    const [errors,   setErrors]   = useState<Errors>({})
    const [saving,   setSaving]   = useState(false)

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

    function openCreate() { setForm(empty); setErrors({}); setEditing(null); setModal('create') }
    function openEdit(e: Empresa) { setForm({ nome: e.nome, ativo: e.ativo }); setErrors({}); setEditing(e); setModal('edit') }

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

    const ativas   = empresas.filter(e => e.ativo).length
    const inativas = empresas.filter(e => !e.ativo).length

    return (
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">

            {/* ── Header ── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 6%, transparent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {corners.map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 border-(--primary)/30 ${cls}`} />
                ))}

                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 md:px-7 pt-5 md:pt-6 pb-4 md:pb-5">
                    <div>
                        <p className="text-[0.5rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Administração</p>
                        <h1 className="text-xl font-black uppercase tracking-[0.08em] text-(--foreground)">Empresas</h1>
                        {!loading && (
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[0.55rem] text-(--muted-foreground)">
                                    <strong className="text-(--foreground)">{empresas.length}</strong> cadastradas
                                </span>
                                {ativas > 0 && <>
                                    <span className="text-(--muted-foreground) opacity-30">·</span>
                                    <span className="flex items-center gap-1 text-[0.55rem] text-green-600">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {ativas} ativas
                                    </span>
                                </>}
                                {inativas > 0 && <>
                                    <span className="text-(--muted-foreground) opacity-30">·</span>
                                    <span className="text-[0.55rem] text-red-500">{inativas} inativas</span>
                                </>}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 bg-(--primary) text-white px-4 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
                    >
                        <Plus size={11} /> Nova Empresa
                    </button>
                </div>
            </div>

            {/* ── Tabela ── */}
            <div className="bg-card border border-(--border)">
                <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 size={11} className="text-(--primary) opacity-70" />
                        <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">
                            Empresas Cadastradas
                        </span>
                    </div>
                    <span className="text-[0.5rem] uppercase tracking-[0.18em] text-(--muted-foreground)">
                        {empresas.length} registro{empresas.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-max border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-(--border)">
                                {['Nome', 'Slug', 'Status'].map(h => (
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
                                <tr><td colSpan={4} className="text-center py-14 text-[0.75rem] text-(--muted-foreground)">Carregando…</td></tr>
                            ) : empresas.map(e => (
                                <tr key={e.id} className="group border-b border-(--border) last:border-0 hover:bg-muted transition-colors">
                                    <td className="px-5 py-3">
                                        <span className="text-[0.8rem] font-semibold text-(--foreground) group-hover:text-(--primary) transition-colors">
                                            {e.nome}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[0.68rem] font-mono text-(--muted-foreground)">{e.slug}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {e.ativo
                                            ? <span className="inline-flex items-center gap-1.5 text-[0.5rem] font-black uppercase tracking-[0.15em] text-green-600">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Ativa
                                              </span>
                                            : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.5rem] font-black uppercase tracking-[0.15em] bg-red-500/10 text-red-500 border border-red-500/20">
                                                ✕ Inativa
                                              </span>
                                        }
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button
                                            onClick={() => openEdit(e)}
                                            className="inline-flex items-center justify-center w-7 h-7 border border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-colors opacity-40 group-hover:opacity-100"
                                            title="Editar"
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

            {/* ── Modal criar/editar ── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative bg-card border border-(--border) shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                        <div className="h-0.5 bg-(--primary) w-full" />
                        <div className="px-6 py-4 border-b border-(--border) bg-muted flex items-center justify-between">
                            <span className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-(--foreground)">
                                {modal === 'create' ? 'Nova Empresa' : 'Editar Empresa'}
                            </span>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Nome</label>
                                <input
                                    value={form.nome}
                                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                                    className={`border px-3 py-2 text-sm bg-muted text-(--foreground) outline-none focus:border-(--primary) transition-colors ${errors.nome ? 'border-(--destructive)' : 'border-(--border)'}`}
                                />
                                {errors.nome?.[0] && <p className="text-[0.62rem] text-(--destructive)">{errors.nome[0]}</p>}
                            </div>

                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={form.ativo}
                                    onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
                                    className="accent-(--primary) w-3.5 h-3.5"
                                />
                                <span className="text-[0.65rem] text-(--foreground) group-hover:text-(--primary) transition-colors">
                                    Empresa ativa
                                </span>
                            </label>

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
        </div>
    )
}
