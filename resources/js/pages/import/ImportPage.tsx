import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react'
import api from '@/lib/axios'

const MODELO_CSV = 'NOME;CPF;MATRICULA;LIMCRED;BLOQUEADO\r\n'

function downloadModelo() {
    const blob = new Blob(['﻿' + MODELO_CSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo_importacao.csv'
    a.click()
    URL.revokeObjectURL(url)
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ImportPage() {
    const navigate = useNavigate()
    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<Status>('idle')
    const [message, setMessage] = useState('')
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
                setMessage(`${imported} registros importados. ${errors} registros com erro foram salvos para revisão.`)
                setTimeout(() => navigate('/importar/erros'), 2000)
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
        <div className="flex flex-col gap-4 animate-[fade-in_0.2s_ease-out]">
            <div>
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-(--muted-foreground) mb-0.5">Importação</p>
                <h1 className="text-xl font-black uppercase tracking-widest text-(--foreground)">Importar CSV</h1>
            </div>

            <div className="bg-card border border-(--border)">
                <div className="px-5 py-3 border-b border-(--border) bg-muted">
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">Arquivo CSV</span>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
                    {/* Drop zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true) }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`border-2 border-dashed px-6 py-10 flex flex-col items-center gap-3 cursor-pointer transition-colors ${dragging ? 'border-(--primary) bg-(--primary)/5' : 'border-(--border) hover:border-(--primary) hover:bg-muted'}`}
                    >
                        <Upload size={28} className={dragging ? 'text-(--primary)' : 'text-(--muted-foreground)'} />
                        {file ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-(--foreground)">
                                <FileText size={14} />
                                {file.name}
                                <span className="text-[0.68rem] text-(--muted-foreground) font-normal">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-(--foreground) font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
                                <p className="text-[0.68rem] text-(--muted-foreground)">Formatos aceitos: .csv, .txt — Máx. 10 MB</p>
                            </>
                        )}
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv,.txt"
                            className="hidden"
                            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                        />
                    </div>

                    {/* Status feedback */}
                    {message && (
                        <div className={`flex items-start gap-2.5 px-4 py-3 border text-sm ${
                            status === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-600'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        }`}>
                            {status === 'success'
                                ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                                : <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            }
                            <span className="text-[0.78rem]">{message}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-(--border) mt-1">
                        <button
                            type="button"
                            onClick={() => navigate('/funcionarios')}
                            className="border border-(--border) px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!file || status === 'loading'}
                            className="flex items-center gap-1.5 bg-(--primary) text-white px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity"
                        >
                            {status === 'loading' && <Loader2 size={12} className="animate-spin" />}
                            Importar
                        </button>
                    </div>
                </form>
            </div>

            {/* Modelo */}
            <div className="bg-card border border-(--border)">
                <div className="px-5 py-3 border-b border-(--border) bg-muted">
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-(--foreground)">Modelo de Importação</span>
                </div>
                <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-(--foreground)">modelo_importacao.csv</p>
                        <p className="text-[0.72rem] text-(--muted-foreground)">
                            Baixe o modelo, preencha no Excel e importe aqui. Separador: ponto-e-vírgula (<code className="font-mono">;</code>). CPF sem pontuação, 11 dígitos. BLOQUEADO: 0 = ativo, 1 = bloqueado.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={downloadModelo}
                        className="flex items-center gap-2 border border-(--primary) text-(--primary) px-4 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:bg-(--primary) hover:text-white transition-colors shrink-0"
                    >
                        <Download size={13} />
                        Baixar Modelo
                    </button>
                </div>
            </div>
        </div>
    )
}
