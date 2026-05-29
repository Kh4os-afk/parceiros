import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Upload, FileText, AlertCircle, CheckCircle2,
    Loader2, Download, X, Table2,
} from 'lucide-react'
import api from '@/lib/axios'

const MODELO_CSV = 'NOME;CPF;MATRICULA;LIMCRED;BLOQUEADO\r\n'

const COLUNAS = [
    { col: 'NOME',      desc: 'Nome completo',             obs: 'obrigatório'  },
    { col: 'CPF',       desc: '11 dígitos, sem pontuação', obs: 'obrigatório'  },
    { col: 'MATRICULA', desc: 'Número inteiro',            obs: 'opcional'     },
    { col: 'LIMCRED',   desc: 'Limite mensal em R$',       obs: 'obrigatório'  },
    { col: 'BLOQUEADO', desc: '0 = ativo  /  1 = bloqueado', obs: 'obrigatório' },
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

const corners = [
    'top-0 left-0 border-t-2 border-l-2',
    'top-0 right-0 border-t-2 border-r-2',
    'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-0 right-0 border-b-2 border-r-2',
]

export default function ImportPage() {
    const navigate  = useNavigate()
    const inputRef  = useRef<HTMLInputElement>(null)
    const [file,    setFile]    = useState<File | null>(null)
    const [status,  setStatus]  = useState<Status>('idle')
    const [message, setMessage] = useState('')
    const [dragging,setDragging]= useState(false)

    function handleFile(f: File) {
        setFile(f)
        setStatus('idle')
        setMessage('')
    }

    function clearFile(e: React.MouseEvent) {
        e.stopPropagation()
        setFile(null)
        setStatus('idle')
        setMessage('')
        if (inputRef.current) inputRef.current.value = ''
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!file) return
        setStatus('loading')
        setMessage('')
        const data = new FormData()
        data.append('csv', file)
        try {
            const res = await api.post('/partners/import', data)
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

    return (
        <div className="flex flex-col gap-5 animate-[fade-in_0.2s_ease-out]">

            {/* ── Header ── */}
            <div className="relative bg-card border border-(--border) overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 6%, transparent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {corners.map((cls, i) => (
                    <div key={i} className={`absolute w-5 h-5 border-(--primary)/30 ${cls}`} />
                ))}
                <div className="relative px-4 md:px-7 py-5">
                    <p className="text-[0.5rem] uppercase tracking-[0.3em] text-(--muted-foreground) mb-1">Importação</p>
                    <h1 className="text-xl font-black uppercase tracking-[0.08em] text-(--foreground)">Importar CSV</h1>
                    <p className="text-[0.62rem] text-(--muted-foreground) mt-1.5">
                        Importe em massa funcionários e limites de crédito a partir de uma planilha CSV.
                    </p>
                </div>
            </div>

            {/* ── Conteúdo — 2 colunas ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Upload — 2/3 */}
                <div className="lg:col-span-2 bg-card border border-(--border) flex flex-col">
                    <div className="px-6 py-3.5 border-b border-(--border) bg-muted flex items-center gap-2">
                        <Upload size={11} className="text-(--primary) opacity-70" />
                        <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Arquivo CSV</span>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 flex-1">

                        {/* Drop zone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true) }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => !file && inputRef.current?.click()}
                            className={`relative flex-1 border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-200 min-h-48 ${
                                file
                                    ? 'border-(--primary)/40 bg-(--primary)/5 cursor-default'
                                    : dragging
                                        ? 'border-(--primary) bg-(--primary)/8 cursor-copy'
                                        : 'border-(--border) hover:border-(--primary)/50 hover:bg-muted cursor-pointer'
                            }`}
                        >
                            {/* Cantos internos do drop zone */}
                            {['top-2 left-2 border-t border-l','top-2 right-2 border-t border-r','bottom-2 left-2 border-b border-l','bottom-2 right-2 border-b border-r'].map((cls, i) => (
                                <div key={i} className={`absolute w-3 h-3 border-(--primary)/30 ${cls}`} />
                            ))}

                            {file ? (
                                <div className="flex flex-col items-center gap-3 px-6 text-center">
                                    <div className="w-12 h-12 bg-(--primary)/10 border border-(--primary)/25 flex items-center justify-center">
                                        <FileText size={20} className="text-(--primary)" />
                                    </div>
                                    <div>
                                        <p className="text-[0.82rem] font-black text-(--foreground)">{file.name}</p>
                                        <p className="text-[0.58rem] text-(--muted-foreground) mt-0.5 uppercase tracking-wider">
                                            {(file.size / 1024).toFixed(1)} KB · CSV
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        className="flex items-center gap-1.5 text-[0.55rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-red-500 transition-colors border border-(--border) hover:border-red-500/30 px-3 py-1.5"
                                    >
                                        <X size={10} /> Trocar arquivo
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 px-6 text-center">
                                    <div className={`w-14 h-14 border-2 flex items-center justify-center transition-colors ${dragging ? 'border-(--primary) bg-(--primary)/10' : 'border-(--border)'}`}>
                                        <Upload size={22} className={dragging ? 'text-(--primary)' : 'text-(--muted-foreground)'} />
                                    </div>
                                    <div>
                                        <p className="text-[0.78rem] font-semibold text-(--foreground)">
                                            {dragging ? 'Solte o arquivo aqui' : 'Arraste o arquivo ou clique para selecionar'}
                                        </p>
                                        <p className="text-[0.58rem] text-(--muted-foreground) mt-1 uppercase tracking-wider">
                                            .csv ou .txt · máx. 10 MB · separador ponto-e-vírgula
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

                        {/* Feedback */}
                        {message && (
                            <div className={`flex items-start gap-3 px-4 py-3 border ${
                                status === 'success'
                                    ? 'bg-green-500/10 border-green-500/20 text-green-600'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}>
                                {status === 'success'
                                    ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                                    : <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                }
                                <span className="text-[0.72rem] font-semibold">{message}</span>
                            </div>
                        )}

                        {/* Ações */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-(--border)">
                            <button
                                type="button"
                                onClick={() => navigate('/funcionarios')}
                                className="border border-(--border) px-5 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!file || status === 'loading'}
                                className="flex items-center gap-2 bg-(--primary) text-white px-6 py-2 text-[0.58rem] font-black uppercase tracking-[0.15em] hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                {status === 'loading'
                                    ? <><Loader2 size={12} className="animate-spin" /> Importando…</>
                                    : <><Upload size={12} /> Importar</>
                                }
                            </button>
                        </div>
                    </form>
                </div>

                {/* Painel direito — 1/3 */}
                <div className="flex flex-col gap-4">

                    {/* Estrutura do CSV */}
                    <div className="bg-card border border-(--border) flex flex-col">
                        <div className="px-5 py-3.5 border-b border-(--border) bg-muted flex items-center gap-2">
                            <Table2 size={11} className="text-(--primary) opacity-70" />
                            <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Estrutura do Arquivo</span>
                        </div>
                        <div className="divide-y divide-(--border)">
                            {COLUNAS.map(({ col, desc, obs }) => (
                                <div key={col} className="px-5 py-3 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[0.65rem] font-black text-(--foreground) font-mono">{col}</p>
                                        <p className="text-[0.58rem] text-(--muted-foreground) mt-0.5">{desc}</p>
                                    </div>
                                    <span className={`shrink-0 text-[0.48rem] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 ${
                                        obs === 'obrigatório'
                                            ? 'bg-(--primary)/10 text-(--primary) border border-(--primary)/20'
                                            : 'bg-muted text-(--muted-foreground) border border-(--border)'
                                    }`}>
                                        {obs}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="px-5 py-2.5 border-t border-(--border) bg-muted">
                            <p className="text-[0.5rem] uppercase tracking-[0.15em] text-(--muted-foreground)">Separador: ponto-e-vírgula <span className="font-mono font-bold text-(--foreground)">;</span></p>
                        </div>
                    </div>

                    {/* Baixar modelo */}
                    <div className="bg-card border border-(--border)">
                        <div className="px-5 py-3.5 border-b border-(--border) bg-muted flex items-center gap-2">
                            <Download size={11} className="text-(--primary) opacity-70" />
                            <span className="text-[0.56rem] font-black uppercase tracking-[0.2em] text-(--muted-foreground)">Modelo Pronto</span>
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                            <p className="text-[0.65rem] text-(--muted-foreground)">
                                Baixe a planilha modelo, preencha no Excel ou Google Sheets e importe.
                            </p>
                            <button
                                type="button"
                                onClick={downloadModelo}
                                className="flex items-center justify-center gap-2 border border-(--primary) text-(--primary) px-4 py-2.5 text-[0.58rem] font-black uppercase tracking-[0.15em] hover:bg-(--primary) hover:text-white transition-colors w-full"
                            >
                                <Download size={12} /> Baixar modelo_importacao.csv
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
