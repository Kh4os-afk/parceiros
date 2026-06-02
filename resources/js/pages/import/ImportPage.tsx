import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
    Upload, FileText, AlertCircle, CheckCircle2,
    Loader2, Download, X, Table2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'

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
    visible: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}

const MODELO_CSV = 'NOME;CPF;LIMCRED;BLOQUEADO\r\n'

const COLUNAS = [
    { col: 'NOME',      desc: 'Nome completo',                obs: 'obrigatório' },
    { col: 'CPF',       desc: '11 dígitos, sem pontuação',    obs: 'obrigatório' },
    { col: 'LIMCRED',   desc: 'Limite mensal em R$ (máx R$ 999)', obs: 'obrigatório' },
    { col: 'BLOQUEADO', desc: '0 = ativo  /  1 = bloqueado',  obs: 'obrigatório' },
]

function downloadModelo() {
    const blob = new Blob(['﻿' + MODELO_CSV], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'modelo_importacao.csv'
    a.click()
    URL.revokeObjectURL(url)
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ImportPage() {
    const navigate   = useNavigate()
    const inputRef   = useRef<HTMLInputElement>(null)
    const [file,     setFile]     = useState<File | null>(null)
    const [status,   setStatus]   = useState<Status>('idle')
    const [message,  setMessage]  = useState('')
    const [dragging, setDragging] = useState(false)

    function handleFile(f: File) {
        setFile(f)
        setStatus('idle')
        setMessage('')
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
        setDragging(true)
    }

    function handleDragLeave() {
        setDragging(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!file) return
        setStatus('loading')
        setMessage('')
        const data = new FormData()
        data.append('csv', file)
        try {
            const res = await api.post('/partners/import', data, { timeout: 600_000 })
            const { imported, errors } = res.data
            if (errors > 0) {
                setStatus('error')
                setMessage(`${imported} registros importados. ${errors} com erro salvos para revisão.`)
                setTimeout(() => navigate('/importar/erros'), 2500)
            } else {
                setStatus('success')
                setMessage(`${imported} registros importados com sucesso!`)
                setTimeout(() => navigate('/funcionarios'), 2000)
            }
        } catch (err: any) {
            setStatus('error')
            setMessage(err.response?.data?.message ?? 'Erro ao processar o arquivo.')
        }
    }

    function clearFile(e: React.MouseEvent) {
        e.stopPropagation()
        setFile(null)
        setStatus('idle')
        setMessage('')
        if (inputRef.current) inputRef.current.value = ''
    }

    const dropzoneBorder = dragging
        ? T.cyan
        : file
            ? T.cyan
            : T.border

    const dropzoneBg = dragging
        ? '#0099cc08'
        : file
            ? '#0099cc05'
            : '#ffffff'

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            style={{ background: T.bg }}
            className="-m-4 md:-m-6 p-4 md:p-6 min-h-screen"
        >
            {/* Header */}
            <motion.div variants={rise} className="mb-6">
                <p
                    className="text-[0.68rem] font-semibold uppercase tracking-[0.25em] mb-1"
                    style={{ color: T.cyan }}
                >
                    Importação
                </p>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                    Importar CSV
                </h1>
            </motion.div>

            {/* Grid 2/3 + 1/3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Card Upload — 2/3 */}
                <motion.div
                    variants={rise}
                    className="lg:col-span-2 bg-white rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${T.border}`, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}
                >
                    {/* Card header */}
                    <div
                        className="flex items-center gap-2 px-6 py-4"
                        style={{ borderBottom: `1px solid ${T.border}`, background: '#fafbfc' }}
                    >
                        <Upload size={14} style={{ color: T.cyan }} />
                        <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gray-500">
                            Arquivo CSV
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

                        {/* Drop zone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !file && inputRef.current?.click()}
                            className="relative flex flex-col items-center justify-center gap-4 min-h-52 rounded-lg transition-all duration-200"
                            style={{
                                border: `2px dashed ${dropzoneBorder}`,
                                background: dropzoneBg,
                                cursor: file ? 'default' : dragging ? 'copy' : 'pointer',
                            }}
                        >
                            {file ? (
                                <div className="flex flex-col items-center gap-3 px-6 text-center">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                                        style={{ background: '#0099cc12', border: `1px solid #0099cc28` }}
                                    >
                                        <FileText size={22} style={{ color: T.cyan }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{file.name}</p>
                                        <p className="text-[0.68rem] text-gray-400 mt-0.5 uppercase tracking-wider">
                                            {(file.size / 1024).toFixed(1)} KB &middot; CSV
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.68rem] font-semibold uppercase tracking-wider text-gray-400 hover:text-red-500 transition-colors"
                                        style={{ border: `1px solid ${T.border}` }}
                                    >
                                        <X size={11} />
                                        Trocar arquivo
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 px-6 text-center">
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200"
                                        style={{
                                            background: dragging ? '#0099cc12' : '#f4f5f8',
                                            border: `1.5px solid ${dragging ? T.cyan : T.border}`,
                                        }}
                                    >
                                        <Upload
                                            size={24}
                                            style={{ color: dragging ? T.cyan : '#9ca3af' }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                            {dragging
                                                ? 'Solte o arquivo aqui'
                                                : 'Arraste o arquivo ou clique para selecionar'}
                                        </p>
                                        <p className="text-[0.68rem] text-gray-400 mt-1 uppercase tracking-wider">
                                            .csv ou .txt &middot; max. 10 MB &middot; separador ponto-e-virgula
                                        </p>
                                    </div>
                                </div>
                            )}

                            <input
                                ref={inputRef}
                                type="file"
                                accept=".csv,.txt"
                                className="hidden"
                                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                            />
                        </div>

                        {/* Feedback de status */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 px-4 py-3 rounded-lg"
                                style={{
                                    background: status === 'success' ? '#05966912' : '#dc262612',
                                    border: `1px solid ${status === 'success' ? '#05966930' : '#dc262630'}`,
                                    color: status === 'success' ? T.green : T.red,
                                }}
                            >
                                {status === 'success'
                                    ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                                    : <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                }
                                <span className="text-[0.76rem] font-semibold leading-relaxed">{message}</span>
                            </motion.div>
                        )}

                        {/* Acoes */}
                        <div
                            className="flex justify-end gap-2 pt-4"
                            style={{ borderTop: `1px solid ${T.border}` }}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/funcionarios')}
                                className="text-[0.72rem] font-semibold uppercase tracking-wider h-9 px-5"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={!file || status === 'loading'}
                                className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-wider h-9 px-6 text-white"
                                style={{ background: T.cyan, border: 'none' }}
                            >
                                {status === 'loading'
                                    ? <><Loader2 size={13} className="animate-spin" /> Importando...</>
                                    : <><Upload size={13} /> Importar</>
                                }
                            </Button>
                        </div>
                    </form>
                </motion.div>

                {/* Painel direito — 1/3 */}
                <div className="flex flex-col gap-4">

                    {/* Estrutura do CSV */}
                    <motion.div
                        variants={rise}
                        className="bg-white rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${T.border}`, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}
                    >
                        <div
                            className="flex items-center gap-2 px-5 py-4"
                            style={{ borderBottom: `1px solid ${T.border}`, background: '#fafbfc' }}
                        >
                            <Table2 size={14} style={{ color: T.cyan }} />
                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gray-500">
                                Estrutura do Arquivo
                            </span>
                        </div>

                        <div>
                            {COLUNAS.map(({ col, desc, obs }, i) => (
                                <div
                                    key={col}
                                    className="flex items-start justify-between gap-3 px-5 py-3"
                                    style={{ borderBottom: i < COLUNAS.length - 1 ? `1px solid ${T.border}` : 'none' }}
                                >
                                    <div className="min-w-0">
                                        <p className="text-[0.78rem] font-bold text-gray-800 font-mono">{col}</p>
                                        <p className="text-[0.7rem] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                                    </div>
                                    <span
                                        className="shrink-0 text-[0.58rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                                        style={{
                                            background: '#0099cc10',
                                            color: T.cyan,
                                            border: `1px solid #0099cc25`,
                                        }}
                                    >
                                        {obs}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div
                            className="px-5 py-2.5"
                            style={{ borderTop: `1px solid ${T.border}`, background: '#fafbfc' }}
                        >
                            <p className="text-[0.68rem] text-gray-400 uppercase tracking-wider">
                                Separador:{' '}
                                <span className="font-mono font-bold text-gray-700">;</span>
                                {' '}ponto-e-virgula
                            </p>
                        </div>
                    </motion.div>

                    {/* Modelo Pronto */}
                    <motion.div
                        variants={rise}
                        className="bg-white rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${T.border}`, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}
                    >
                        <div
                            className="flex items-center gap-2 px-5 py-4"
                            style={{ borderBottom: `1px solid ${T.border}`, background: '#fafbfc' }}
                        >
                            <Download size={14} style={{ color: T.cyan }} />
                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gray-500">
                                Modelo Pronto
                            </span>
                        </div>

                        <div className="p-5 flex flex-col gap-3">
                            <p className="text-[0.76rem] text-gray-500 leading-relaxed">
                                Baixe a planilha modelo, preencha no Excel ou Google Sheets e importe.
                            </p>
                            <button
                                type="button"
                                onClick={downloadModelo}
                                className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-wider transition-all duration-200 hover:text-white"
                                style={{
                                    border: `1.5px solid ${T.cyan}`,
                                    color: T.cyan,
                                    background: 'transparent',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.background = T.cyan
                                    ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                                    ;(e.currentTarget as HTMLButtonElement).style.color = T.cyan
                                }}
                            >
                                <Download size={13} />
                                Baixar modelo_importacao.csv
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
