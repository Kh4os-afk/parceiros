# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código neste repositório.

## Visão Geral do Projeto

**Parceiros** é uma aplicação web Laravel 10 + React (Vite + TypeScript + Tailwind v4 + shadcn/ui) para gerenciar funcionários/parceiros e registros de compras do sistema "Baratão da Carne Convênio". O Laravel serve como API REST (Sanctum SPA) e o React é o frontend completo.

A interface é inteiramente em **Português (Brasil)**. Toda string visível ao usuário deve estar em pt-BR.

## Comandos Comuns

```bash
# Instalar dependências PHP
composer install

# Instalar dependências JS e compilar assets
npm install
npm run dev       # Servidor Vite com hot reload
npm run build     # Build para produção

# Laravel Artisan
php artisan migrate
php artisan db:seed
php artisan tinker

# Executar testes
php artisan test
./vendor/bin/pest
./vendor/bin/pest --filter=NomeDoTeste

# Estilo de código (Laravel Pint)
./vendor/bin/pint
```

A aplicação roda via XAMPP em `http://localhost/parceiros/public/`. Banco de dados MySQL, nome `convenio`.

## Commits

**OBRIGATÓRIO: todas as mensagens de commit devem ser em Português (pt-BR)**, seguindo o formato definido em `.gitmessage`:

```
<tipo>: <descrição curta em português — máximo 72 caracteres>

- <arquivo1>: <o que foi alterado e por quê>
- <arquivo2>: <o que foi alterado e por quê>
```

**Tipos válidos:** `feat`, `fix`, `refactor`, `docs`, `style`, `chore`, `test`

**Exemplos corretos:**
```
feat: adiciona sidebar shadcn com breadcrumb dinâmico
fix: corrige sintaxe de CSS variables no Tailwind v4
chore: remove Livewire e dependências legadas
```

**Nunca em inglês.** Verbos no infinitivo (adiciona, corrige, remove, implementa).

## Arquitetura

### Backend — Laravel 10 API REST

Controllers em `app/Http/Controllers/Api/`:

| Controller | Responsabilidade |
|---|---|
| `AuthController` | Login, logout, usuário autenticado (Sanctum SPA) |
| `PartnerController` | CRUD de funcionários + importação CSV |
| `PartnerErrorController` | Erros de importação (listar, aprovar, deletar) |
| `SaleController` | Compras por funcionário/CPF e por período |
| `FilialController` | Listagem de filiais |
| `EmpresaController` | CRUD de empresas (somente admin) |
| `UserController` | CRUD de usuários com role e empresa_id (somente admin) |

Form Requests em `app/Http/Requests/` para validação (CPF via `laravellegends/pt-br-validator`).

Rotas em `routes/api.php` — todas protegidas por `auth:sanctum` exceto `/login`. As rotas de empresas e usuários também exigem o middleware `AdminOnly` (retorna 403 para não-admins).

`routes/web.php` → catch-all SPA: `Route::get('/{any}', fn() => view('app'))`.

### Multi-tenancy — Empresas

Todas as tabelas principais (`partners`, `sales`, `filiais`, `partner_errors`, `change_logs`) têm a coluna `empresa_id` (FK para `empresas`). O `EmpresaScope` (global scope nos models) filtra automaticamente os dados pela empresa do usuário autenticado. Admins ignoram o scope e veem todos os registros.

- **User** tem campo `role` (enum: `admin` | `user`) e `empresa_id`
- `isAdmin()` no model User verifica a role
- Middleware `AdminOnly` (`app/Http/Middleware/AdminOnly.php`) protege as rotas de gestão

### Modelo de Dados

- **Empresa** — empresa/tenant: `nome`, `slug` (único), `ativo`
- **Partner** — funcionário: `cpf` (11 dígitos, único), `matricula` (nullable), `limcred`, `bloqueado`, `alterado`, `empresa_id`
- **Sale** — compra vinculada ao Partner via `cpf` (string, não FK inteira); campos: `codfilial`, `caixa`, `numnota`, `dtsaida`, `vltotal`, `qrcodenfce`, `dtcancel`, `dtdevol`, `empresa_id`
- **Filial** — filiais/lojas, `empresa_id`
- **PartnerError** — registros de CSV que falharam para correção manual, `empresa_id`
- **ChangeLog** — auditoria; toda escrita bem-sucedida insere registro com `usuario`, `operacao`, `descricao`, `empresa_id`
- **User** — autenticação Laravel/Sanctum; campos extras: `role`, `empresa_id`

A relação Partner ↔ Sale é via campo string `cpf`, não por chave estrangeira inteira.

### Padrões do Backend

- Toda mutação usa `DB::beginTransaction()` / `commit()` / `rollback()`
- Toda escrita bem-sucedida registra em `change_logs`
- Nomes salvos em `mb_strtoupper()`, exibidos em `toTitleCase()` no frontend
- Importação CSV usa `League\Csv\Reader`

### Frontend — React + Vite + TypeScript

```
resources/js/
├── app.tsx                          # Entry point: QueryClient + AuthProvider + RouterProvider
├── router.tsx                       # createBrowserRouter com ProtectedRoute e AdminRoute
├── lib/
│   ├── axios.ts                     # Instância axios (withCredentials, XSRF)
│   └── utils.ts                     # cn(), formatCPF(), formatMoney(), toTitleCase()
├── contexts/AuthContext.tsx         # Login, logout, usuário autenticado
├── components/layouts/
│   ├── AppLayout.tsx                # SidebarProvider + SidebarInset + Breadcrumb
│   ├── AppSidebar.tsx               # Sidebar shadcn com nav e footer de usuário
│   ├── AuthLayout.tsx               # Layout centralizado para login
│   ├── ProtectedRoute.tsx           # Redireciona para /login se não autenticado
│   └── AdminRoute.tsx               # Redireciona se não for admin
├── components/ui/                   # Componentes shadcn/ui
└── pages/
    ├── admin/EmpresasPage.tsx, UsuariosPage.tsx
    ├── auth/LoginPage.tsx
    ├── dashboard/DashboardPage.tsx
    ├── partners/ListPage.tsx, CreatePage.tsx, EditPage.tsx
    ├── import/ImportPage.tsx, ErrorsPage.tsx
    ├── errors/EditErrorPage.tsx
    └── reports/SalesByPartnerPage.tsx, SalesByPeriodPage.tsx
```

Estado servidor gerenciado com `@tanstack/react-query` v5. Notificações toast via `sonner`.

### Frontend — Tailwind v4 + shadcn/ui

**ATENÇÃO:** Este projeto usa **Tailwind v4**. CSS variables em classes arbitrárias usam parênteses, não colchetes:
- ✅ `w-(--sidebar-width)` → `width: var(--sidebar-width)`
- ❌ `w-[--sidebar-width]` → `width: --sidebar-width` (inválido, ignorado pelo browser)

Ao instalar novos componentes shadcn, verificar e corrigir todas as ocorrências de `[--` para `(--`:
```bash
grep -rn "\[--" resources/js/components/ui/
```

CSS variables do tema em `resources/css/app.css`. Fonte: Oxanium (todas as variantes). Tema: Lyra Cyan Light.

### Autenticação

Sanctum SPA mode com cookies httpOnly. O frontend chama `GET /sanctum/csrf-cookie` antes do login para inicializar o XSRF token. Veja `resources/js/lib/axios.ts`.
