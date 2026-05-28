import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-[oklch(0.965_0_0)]"
            style={{ fontFamily: 'Oxanium, sans-serif' }}
        >
            <Outlet />
        </div>
    )
}
