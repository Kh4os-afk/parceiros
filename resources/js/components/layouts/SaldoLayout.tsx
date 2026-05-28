import { Outlet } from 'react-router-dom'

export default function SaldoLayout() {
    return (
        <div className="min-h-screen bg-muted"
            style={{ backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 4%, transparent) 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
            <Outlet />
        </div>
    )
}
