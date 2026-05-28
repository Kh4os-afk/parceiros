import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { router } from '@/router'
import { Toaster } from 'sonner'
// @ts-expect-error css import handled by vite
import '../css/app.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 1, staleTime: 30_000 },
    },
})

const root = document.getElementById('root')!
createRoot(root).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
                <Toaster richColors position="top-right" />
            </AuthProvider>
        </QueryClientProvider>
    </React.StrictMode>
)
