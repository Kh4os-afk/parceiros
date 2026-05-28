import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layouts/AppLayout'
import AuthLayout from '@/components/layouts/AuthLayout'
import ProtectedRoute from '@/components/layouts/ProtectedRoute'
import AdminRoute from '@/components/layouts/AdminRoute'

import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ListPage from '@/pages/partners/ListPage'
import CreatePage from '@/pages/partners/CreatePage'
import EditPage from '@/pages/partners/EditPage'
import DetailPage from '@/pages/partners/DetailPage'
import ImportPage from '@/pages/import/ImportPage'
import ErrorsPage from '@/pages/import/ErrorsPage'
import EditErrorPage from '@/pages/errors/EditErrorPage'
import SalesByPartnerPage from '@/pages/reports/SalesByPartnerPage'
import SalesByPeriodPage from '@/pages/reports/SalesByPeriodPage'
import EmpresasPage from '@/pages/admin/EmpresasPage'
import UsuariosPage from '@/pages/admin/UsuariosPage'

export const router = createBrowserRouter([
    {
        element: <AuthLayout />,
        children: [
            { path: '/login', element: <LoginPage /> },
        ],
    },
    {
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: '/dashboard', element: <DashboardPage /> },
            { path: '/funcionarios', element: <ListPage /> },
            { path: '/funcionarios/cadastrar', element: <CreatePage /> },
            { path: '/funcionarios/:id', element: <DetailPage /> },
            { path: '/funcionarios/:id/editar', element: <EditPage /> },
            { path: '/importar/csv', element: <ImportPage /> },
            { path: '/importar/erros', element: <ErrorsPage /> },
            { path: '/importar/erros/:id/editar', element: <EditErrorPage /> },
            { path: '/compras/funcionario', element: <SalesByPartnerPage /> },
            { path: '/compras/periodo', element: <SalesByPeriodPage /> },
            // Rotas exclusivas de admin
            { path: '/admin/empresas', element: <AdminRoute><EmpresasPage /></AdminRoute> },
            { path: '/admin/usuarios', element: <AdminRoute><UsuariosPage /></AdminRoute> },
        ],
    },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
])
