import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Search, Download, ShoppingBag } from 'lucide-react'
import api from '@/lib/axios'
import { formatCPF, formatMoney, toTitleCase } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Partner {
    id: number
    nome: string
    cpf: string
    matricula: string
}

interface Sale {
    id: number
    numnota: string
    dtsaida: string
    vltotal: number
    codfilial: number
    filial?: { filial: string }
}

const T = { bg: "#f4f5f8", border: "#e8eaef", cyan: "#0099cc", purple: "#7c3aed", green: "#059669", amber: "#d97706", red: "#dc2626" }
const cardStyle = { background: "#ffffff", border: `1px solid ${T.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger = (d = 0): any => ({ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: d } } })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rise: any = { hidden: { opacity: 0, y: 20, filter: "blur(8px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

export default function SalesByPartnerPage() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<Partner | null>(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const [sales, setSales] = useState<Sale[]>([])
    const [loadingSales, setLoadingSales] = useState(false)
    const [searched, setSearched] = useState(false)

    useEffect(() => {
        if (search.length < 2) { setPartners([]); return }
        const timer = setTimeout(async () => {
            const res = await api.get('/partners', { params: { search, per_page: 20 } })
            setPartners(res.data.data ?? [])
            setShowDropdown(true)
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const fetchSales = useCallback(async (partner: Partner) => {
        setLoadingSales(true)
        setSearched(true)
        setSales([])
        try {
            const res = await api.get(`/partners/${partner.id}/sales`)
            setSales(res.data)
        } finally {
            setLoadingSales(false)
        }
    }, [])

    function selectPartner(p: Partner) {
        setSelected(p)
        setSearch(toTitleCase(p.nome))
        setShowDropdown(false)
        fetchSales(p)
    }

    function exportCsv() {
        if (!selected || sales.length === 0) return
        const rows = [
            ['Nota', 'Data', 'Filial', 'Valor'],
            ...sales.map(s => [s.numnota, s.dtsaida, s.filial?.filial ?? s.codfilial, String(s.vltotal)]),
        ]
        const csv = rows.map(r => r.join(';')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compras_${selected.cpf}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const total = sales.reduce((sum, s) => sum + Number(s.vltotal), 0)

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger(0)}
            style={{ background: T.bg }}
            className="-m-4 md:-m-6 p-4 md:p-6 min-h-full flex flex-col gap-5"
        >
            {/* Header */}
            <motion.div variants={rise}>
                <p style={{ color: T.cyan }} className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] mb-1">
                    Relatórios
                </p>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                    Compras por Funcionário
                </h1>
            </motion.div>

            {/* Search card */}
            <motion.div variants={rise} style={cardStyle} className="rounded-xl overflow-hidden">
                <div
                    className="px-5 py-3 border-b"
                    style={{ borderColor: T.border, background: "#f9fafb" }}
                >
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-gray-500">
                        Selecionar Funcionário
                    </span>
                </div>
                <div className="p-5">
                    <div className="relative max-w-md">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "#9ca3af" }}
                        />
                        <input
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value)
                                setSelected(null)
                                setSales([])
                                setSearched(false)
                            }}
                            onFocus={() => partners.length > 0 && setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                            placeholder="Buscar por nome, CPF ou matrícula…"
                            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg outline-none transition-all"
                            style={{
                                border: `1px solid ${T.border}`,
                                background: "#f9fafb",
                                color: "#111827",
                            }}
                            onFocusCapture={e => {
                                (e.target as HTMLInputElement).style.borderColor = T.cyan
                                ;(e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${T.cyan}22`
                            }}
                            onBlurCapture={e => {
                                (e.target as HTMLInputElement).style.borderColor = T.border
                                ;(e.target as HTMLInputElement).style.boxShadow = 'none'
                            }}
                        />
                        {showDropdown && partners.length > 0 && (
                            <div
                                className="absolute top-full left-0 right-0 z-20 rounded-b-lg overflow-hidden mt-0.5 max-h-48 overflow-y-auto"
                                style={{ background: "#ffffff", border: `1px solid ${T.border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                            >
                                {partners.map(p => (
                                    <button
                                        key={p.id}
                                        onMouseDown={() => selectPartner(p)}
                                        className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors"
                                        style={{ borderBottom: `1px solid ${T.border}` }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#f4f5f8")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <span className="text-sm font-medium text-gray-800">
                                            {toTitleCase(p.nome)}
                                        </span>
                                        <span className="text-[0.7rem] tracking-wider" style={{ color: "#9ca3af" }}>
                                            {formatCPF(p.cpf)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selected && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-wrap items-center gap-4 mt-3"
                        >
                            <span className="text-xs text-gray-400">
                                Matrícula:{" "}
                                <strong className="text-gray-700 font-semibold">{selected.matricula || "—"}</strong>
                            </span>
                            <span className="text-xs text-gray-400">
                                CPF:{" "}
                                <strong className="text-gray-700 font-semibold tracking-wider">{formatCPF(selected.cpf)}</strong>
                            </span>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Results card */}
            {searched && (
                <motion.div
                    variants={rise}
                    style={cardStyle}
                    className="rounded-xl overflow-hidden"
                >
                    <div
                        className="px-5 py-3 border-b flex items-center justify-between gap-3"
                        style={{ borderColor: T.border, background: "#f9fafb" }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-gray-700">
                                Histórico de{" "}
                                <span style={{ color: T.cyan }}>
                                    {selected ? toTitleCase(selected.nome) : ""}
                                </span>
                            </span>
                            {!loadingSales && (
                                <span
                                    className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: `${T.cyan}15`, color: T.cyan }}
                                >
                                    {sales.length} {sales.length !== 1 ? "compras" : "compra"}
                                </span>
                            )}
                        </div>
                        {sales.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportCsv}
                                className="h-7 px-3 text-[0.65rem] font-bold uppercase tracking-wider gap-1.5"
                                style={{ borderColor: T.border, color: "#6b7280" }}
                            >
                                <Download size={11} />
                                Exportar CSV
                            </Button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-collapse">
                            <thead>
                                <tr style={{ background: "#f9fafb", borderBottom: `1px solid ${T.border}` }}>
                                    {["Nº Nota", "Data", "Filial", "Valor"].map(h => (
                                        <th
                                            key={h}
                                            className="px-5 py-3 text-left text-[0.62rem] font-bold uppercase tracking-[0.12em]"
                                            style={{ color: "#9ca3af" }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loadingSales ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-sm text-gray-400">
                                            Carregando…
                                        </td>
                                    </tr>
                                ) : sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="flex flex-col items-center gap-3 py-14">
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                                    style={{ background: `${T.cyan}12` }}
                                                >
                                                    <ShoppingBag size={22} style={{ color: T.cyan }} />
                                                </div>
                                                <p className="text-sm text-gray-400 font-medium">
                                                    Nenhuma compra encontrada
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((s, i) => (
                                        <motion.tr
                                            key={s.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.03 }}
                                            style={{ borderBottom: `1px solid ${T.border}` }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                        >
                                            <td className="px-5 py-2.5 text-[0.75rem] font-medium text-gray-500">
                                                {s.numnota}
                                            </td>
                                            <td className="px-5 py-2.5 text-[0.75rem] text-gray-500">
                                                {s.dtsaida}
                                            </td>
                                            <td className="px-5 py-2.5 text-[0.78rem] text-gray-700">
                                                {s.filial?.filial ?? `Filial ${s.codfilial}`}
                                            </td>
                                            <td className="px-5 py-2.5 text-[0.82rem] font-semibold" style={{ color: T.cyan }}>
                                                {formatMoney(s.vltotal)}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                            {sales.length > 0 && (
                                <tfoot>
                                    <tr style={{ borderTop: `2px solid ${T.border}`, background: "#f9fafb" }}>
                                        <td
                                            colSpan={3}
                                            className="px-5 py-3 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-right"
                                            style={{ color: "#9ca3af" }}
                                        >
                                            Total
                                        </td>
                                        <td
                                            className="px-5 py-3 text-sm font-black"
                                            style={{ color: T.cyan }}
                                        >
                                            {formatMoney(total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
