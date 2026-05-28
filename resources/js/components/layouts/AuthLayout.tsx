import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted relative overflow-hidden">
            {/* Dot grid de fundo */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, color-mix(in oklch, currentColor 5%, transparent) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            <Outlet />
        </div>
    )
}
