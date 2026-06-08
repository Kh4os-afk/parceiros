import { useEffect, useState } from 'react'
import { Pencil, Plus, Loader2, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import api from '@/lib/axios'

interface Empresa { id: number; nome: string; codcli: number | null; slug: string; ativo: boolean }
interface Errors  { [key: string]: string[] }

const empty = { nome: '', codcli: '', ativo: true }

const T = {
    bg:     "#f4f5f8",
    border: "#e8eaef",
    cyan:   "#0099cc",
    purple: "#7c3aed",
    green:  "#059669",
    amber:  "#d97706",
    red:    "#dc2626",
}

const rise: any = {
    hidden:  { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowVariants: any = {
    hidden:  { opacity: 0, x: -8 },
    visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] } }),
}

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
    function openEdit(e: Empresa) { setForm({ nome: e.nome, codcli: e.codcli?.toString() ?? '', ativo: e.ativo }); setErrors({}); setEditing(e); setModal('edit') }

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
                    className="rounded-xl overflow-hidden"
                    style={{ background: "#fff", border: `1px solid ${T.border}`, boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)" }}
                >
                    {/* accent bar */}
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${T.cyan} 0%, ${T.purple} 100%)` }} />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 md:px-7 pt-5 pb-5">
                        <div>
                            <p style={{ color: T.cyan }} className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] mb-0.5">
                                Administração
                            </p>
                            <h1 className="text-xl font-black uppercase tracking-[0.06em]" style={{ color: "#1a1d23" }}>
                                Empresas
                            </h1>
                            {!loading && (
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <span className="text-[0.62rem]" style={{ color: "#6b7280" }}>
                                        <strong style={{ color: "#1a1d23" }}>{empresas.length}</strong> cadastradas
                                    </span>
                                    {ativas > 0 && (
                                        <>
                                            <span style={{ color: "#d1d5db" }}>·</span>
                                            <span className="flex items-center gap-1 text-[0.62rem]" style={{ color: T.green }}>
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
                                                {ativas} ativas
                                            </span>
                                        </>
                                    )}
                                    {inativas > 0 && (
                                        <>
                                            <span style={{ color: "#d1d5db" }}>·</span>
                                            <span className="text-[0.62rem]" style={{ color: T.red }}>
                                                {inativas} inativas
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={openCreate}
                            className="flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-lg text-white text-[0.62rem] font-bold uppercase tracking-[0.12em] transition-opacity"
                            style={{ background: `linear-gradient(135deg, ${T.cyan} 0%, #007aaa 100%)`, boxShadow: `0 2px 8px 0 ${T.cyan}44` }}
                        >
                            <Plus size={12} /> Nova Empresa
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* ── Tabela ── */}
            <motion.div variants={rise}>
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ background: "#fff", border: `1px solid ${T.border}`, boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)" }}
                >
                    {/* table header */}
                    <div
                        className="flex items-center justify-between px-5 py-3.5"
                        style={{ borderBottom: `1px solid ${T.border}`, background: "#fafbfc" }}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-md flex items-center justify-center"
                                style={{ background: `${T.cyan}15` }}
                            >
                                <Building2 size={13} style={{ color: T.cyan }} />
                            </div>
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em]" style={{ color: "#6b7280" }}>
                                Empresas Cadastradas
                            </span>
                        </div>
                        <span
                            className="text-[0.55rem] font-semibold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                            style={{ background: `${T.cyan}12`, color: T.cyan }}
                        >
                            {empresas.length} registro{empresas.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-collapse">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${T.border}`, background: "#f7f8fa" }}>
                                    {['Nome', 'Cód. Cliente', 'Slug', 'Status'].map(h => (
                                        <th
                                            key={h}
                                            className="px-5 py-3 text-left text-[0.52rem] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                                            style={{ color: "#9ca3af" }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                    <th
                                        className="px-5 py-3 text-right text-[0.52rem] font-black uppercase tracking-[0.2em]"
                                        style={{ color: "#9ca3af" }}
                                    >
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-14 text-[0.75rem]" style={{ color: "#9ca3af" }}>
                                            <Loader2 size={16} className="animate-spin inline mr-2 opacity-50" />
                                            Carregando…
                                        </td>
                                    </tr>
                                ) : empresas.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-14 text-[0.75rem]" style={{ color: "#9ca3af" }}>
                                            Nenhuma empresa cadastrada.
                                        </td>
                                    </tr>
                                ) : empresas.map((e, i) => (
                                    <motion.tr
                                        key={e.id}
                                        custom={i}
                                        initial="hidden"
                                        animate="visible"
                                        variants={rowVariants}
                                        className="group"
                                        style={{ borderBottom: `1px solid ${T.border}` }}
                                        onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = "#fafafa"}
                                        onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = "transparent"}
                                    >
                                        <td className="px-5 py-3">
                                            <span
                                                className="text-[0.82rem] font-semibold transition-colors"
                                                style={{ color: "#1a1d23" }}
                                            >
                                                {e.nome}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {e.codcli != null ? (
                                                <span
                                                    className="text-[0.7rem] font-mono font-semibold px-2 py-0.5 rounded"
                                                    style={{ background: `${T.cyan}12`, color: T.cyan }}
                                                >
                                                    {e.codcli}
                                                </span>
                                            ) : (
                                                <span className="text-[0.65rem]" style={{ color: "#d1d5db" }}>—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className="text-[0.7rem] font-mono px-2 py-0.5 rounded"
                                                style={{ background: "#f3f4f6", color: "#6b7280" }}
                                            >
                                                {e.slug}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2">
                                            {e.ativo ? (
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.52rem] font-bold uppercase tracking-[0.12em]"
                                                    style={{ background: `${T.green}15`, color: T.green }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />
                                                    Ativa
                                                </span>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.52rem] font-bold uppercase tracking-[0.12em]"
                                                    style={{ background: `${T.red}12`, color: T.red }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.red }} />
                                                    Inativa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.92 }}
                                                onClick={() => openEdit(e)}
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-all"
                                                style={{ border: `1px solid ${T.border}`, color: "#9ca3af", background: "transparent" }}
                                                onMouseEnter={ev => {
                                                    const el = ev.currentTarget as HTMLElement
                                                    el.style.borderColor = T.cyan
                                                    el.style.color = T.cyan
                                                    el.style.background = `${T.cyan}10`
                                                }}
                                                onMouseLeave={ev => {
                                                    const el = ev.currentTarget as HTMLElement
                                                    el.style.borderColor = T.border
                                                    el.style.color = "#9ca3af"
                                                    el.style.background = "transparent"
                                                }}
                                                title="Editar"
                                            >
                                                <Pencil size={11} />
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* ── Modal criar/editar ── */}
            <AnimatePresence>
                {modal && (
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.50)" }}
                        onClick={e => { if (e.target === e.currentTarget) setModal(false) }}
                    >
                        <motion.div
                            key="modal-panel"
                            initial={{ opacity: 0, scale: 0.95, y: 12, filter: "blur(6px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.95, y: 8, filter: "blur(4px)" }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-sm mx-4 rounded-xl overflow-hidden"
                            style={{ background: "#fff", border: `1px solid ${T.border}`, boxShadow: "0 20px 60px 0 rgba(0,0,0,0.18)" }}
                        >
                            {/* cyan accent bar */}
                            <div style={{ height: 3, background: `linear-gradient(90deg, ${T.cyan} 0%, ${T.purple} 100%)` }} />

                            {/* modal header */}
                            <div
                                className="px-5 py-4"
                                style={{ borderBottom: `1px solid ${T.border}`, background: "#fafbfc" }}
                            >
                                <span className="text-[0.62rem] font-black uppercase tracking-[0.2em]" style={{ color: "#1a1d23" }}>
                                    {modal === 'create' ? 'Nova Empresa' : 'Editar Empresa'}
                                </span>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                                {/* Nome */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.52rem] font-black uppercase tracking-[0.2em]" style={{ color: "#9ca3af" }}>
                                        Nome
                                    </label>
                                    <input
                                        value={form.nome}
                                        onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                                        placeholder="Nome da empresa"
                                        className="px-3 py-2 rounded-lg text-[0.82rem] outline-none transition-all"
                                        style={{
                                            border: `1px solid ${errors.nome ? T.red : T.border}`,
                                            background: "#f7f8fa",
                                            color: "#1a1d23",
                                        }}
                                        onFocus={ev => { (ev.target as HTMLElement).style.borderColor = T.cyan; (ev.target as HTMLElement).style.boxShadow = `0 0 0 3px ${T.cyan}18` }}
                                        onBlur={ev => { (ev.target as HTMLElement).style.borderColor = errors.nome ? T.red : T.border; (ev.target as HTMLElement).style.boxShadow = "none" }}
                                    />
                                    {errors.nome?.[0] && (
                                        <p className="text-[0.62rem]" style={{ color: T.red }}>{errors.nome[0]}</p>
                                    )}
                                </div>

                                {/* Cód. Cliente */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.52rem] font-black uppercase tracking-[0.2em]" style={{ color: "#9ca3af" }}>
                                        Cód. Cliente
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.codcli}
                                        onChange={e => setForm(f => ({ ...f, codcli: e.target.value }))}
                                        placeholder="Código do cliente no sistema"
                                        className="px-3 py-2 rounded-lg text-[0.82rem] outline-none transition-all"
                                        style={{
                                            border: `1px solid ${errors.codcli ? T.red : T.border}`,
                                            background: "#f7f8fa",
                                            color: "#1a1d23",
                                        }}
                                        onFocus={ev => { (ev.target as HTMLElement).style.borderColor = T.cyan; (ev.target as HTMLElement).style.boxShadow = `0 0 0 3px ${T.cyan}18` }}
                                        onBlur={ev => { (ev.target as HTMLElement).style.borderColor = errors.codcli ? T.red : T.border; (ev.target as HTMLElement).style.boxShadow = "none" }}
                                    />
                                    {errors.codcli?.[0] && (
                                        <p className="text-[0.62rem]" style={{ color: T.red }}>{errors.codcli[0]}</p>
                                    )}
                                </div>

                                {/* Ativo */}
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={form.ativo}
                                        onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
                                        className="w-4 h-4 rounded cursor-pointer"
                                        style={{ accentColor: T.cyan }}
                                    />
                                    <span className="text-[0.72rem]" style={{ color: "#374151" }}>
                                        Empresa ativa
                                    </span>
                                </label>

                                {/* Buttons */}
                                <div
                                    className="flex justify-end gap-2 pt-3"
                                    style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setModal(false)}
                                        className="px-4 py-2 rounded-lg text-[0.62rem] font-bold uppercase tracking-[0.12em] transition-colors"
                                        style={{ border: `1px solid ${T.border}`, color: "#6b7280", background: "#f7f8fa" }}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[0.62rem] font-bold uppercase tracking-[0.12em] disabled:opacity-60 transition-opacity"
                                        style={{ background: `linear-gradient(135deg, ${T.cyan} 0%, #007aaa 100%)`, boxShadow: `0 2px 8px 0 ${T.cyan}44` }}
                                    >
                                        {saving && <Loader2 size={11} className="animate-spin" />}
                                        Salvar
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
