import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCPF(cpf: string): string {
    const digits = cpf.replace(/\D/g, '')
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/** Máscara incremental enquanto o usuário digita: 000.000.000-00 */
export function maskCPF(raw: string): string {
    const d = raw.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function stripCPF(cpf: string): string {
    return cpf.replace(/\D/g, '')
}

export function formatMoney(value: number | string): string {
    return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })
}

/** Formata número para campo de entrada: 1.234,56 */
export function formatMoneyInput(value: number | string): string {
    const n = Number(value)
    if (Number.isNaN(n)) return ''
    return n.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

/** Máscara incremental de moeda BRL enquanto o usuário digita */
export function maskMoney(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return ''
    const cents = parseInt(digits, 10)
    return (cents / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

/** Converte valor mascarado (1.234,56) para número */
export function parseMoney(value: string): number {
    if (!value.trim()) return 0
    const normalized = value.replace(/\./g, '').replace(',', '.')
    const n = parseFloat(normalized)
    return Number.isNaN(n) ? 0 : n
}

export function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
