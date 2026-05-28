import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import api from '@/lib/axios'

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
        data.append('file', file)
        try {
            const res = await api.post('/partners/import', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
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
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-0.5">Importação</p>
                <h1 className="text-xl font-black uppercase tracking-widest text-[var(--foreground)]">Importar CSV</h1>
            </div>

            <div className="bg-white border border-[var(--border)]">
                <div className="px-5 py-3 border-b border-[var(--border)] bg-[oklch(0.97_0_0)]">
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">Arquivo CSV</span>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
                    {/* Drop zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true) }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`border-2 border-dashed px-6 py-10 flex flex-col items-center gap-3 cursor-pointer transition-colors ${dragging ? 'border-[var(--primary)] bg-[oklch(0.52_0.105_223.128/0.04)]' : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[oklch(0.97_0_0)]'}`}
                    >
                        <Upload size={28} className={dragging ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'} />
                        {file ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                                <FileText size={14} />
                                {file.name}
                                <span className="text-[0.68rem] text-[var(--muted-foreground)] font-normal">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-[var(--foreground)] font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
                                <p className="text-[0.68rem] text-[var(--muted-foreground)]">Formatos aceitos: .csv, .txt — Máx. 10 MB</p>
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
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                            {status === 'success'
                                ? <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
                                : <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                            }
                            <span className="text-[0.78rem]">{message}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)] mt-1">
                        <button
                            type="button"
                            onClick={() => navigate('/funcionarios')}
                            className="border border-[var(--border)] px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!file || status === 'loading'}
                            className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-60 transition-opacity"
                        >
                            {status === 'loading' && <Loader2 size={12} className="animate-spin" />}
                            Importar
                        </button>
                    </div>
                </form>
            </div>

            {/* Instructions */}
            <div className="bg-white border border-[var(--border)]">
                <div className="px-5 py-3 border-b border-[var(--border)] bg-[oklch(0.97_0_0)]">
                    <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">Formato do Arquivo</span>
                </div>
                <div className="p-5 flex flex-col gap-3">
                    <p className="text-[0.78rem] text-[var(--muted-foreground)]">O arquivo CSV deve usar <strong className="text-[var(--foreground)]">ponto-e-vírgula (;)</strong> como separador, com a seguinte estrutura:</p>
                    <div className="bg-[oklch(0.97_0_0)] border border-[var(--border)] px-4 py-3 font-mono text-[0.72rem] text-[var(--foreground)]">
                        NOME;CPF;MATRICULA;LIMCRED;BLOQUEADO<br />
                        ANTONIO DA SILVA;12345678901;00142;350;0<br />
                        MARIA SOUZA;98765432100;00143;500;0
                    </div>
                    <ul className="flex flex-col gap-1.5 text-[0.72rem] text-[var(--muted-foreground)]">
                        <li>• <strong className="text-[var(--foreground)]">CPF:</strong> apenas números, 11 dígitos</li>
                        <li>• <strong className="text-[var(--foreground)]">MATRICULA:</strong> valor único por funcionário</li>
                        <li>• <strong className="text-[var(--foreground)]">LIMCRED:</strong> limite de crédito em reais (ex: 350)</li>
                        <li>• <strong className="text-[var(--foreground)]">BLOQUEADO:</strong> 0 para ativo, 1 para bloqueado</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
