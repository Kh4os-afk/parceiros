<!DOCTYPE html>
<html lang="en">
<head>
    <title>{{ $title ?? 'Baratão Convênio' }}</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" href="{{ asset('imagens/bdc.png') }}" type="image/x-icon">
    <!-- Main CSS-->
    <link rel="stylesheet" type="text/css" href="{{ asset('css/main.css') }}">
    <!-- Font-icon css-->
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    {{-- Bootstrap 5 --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    {{-- Data Tables --}}
    <link href="https://cdn.datatables.net/v/dt/jq-3.7.0/jszip-3.10.1/dt-2.0.7/b-3.0.2/b-colvis-3.0.2/b-html5-3.0.2/b-print-3.0.2/cr-2.0.2/r-3.0.2/sb-1.7.1/datatables.min.css" rel="stylesheet">
    {{--Select2--}}
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ttskch/select2-bootstrap4-theme@x.x.x/dist/select2-bootstrap4.min.css">
</head>
<body class="app sidebar-mini rtl pace-done sidenav-toggled">
<!-- Navbar-->
<header class="app-header">
    <a class="app-header__logo" wire:navigate href="{{ route('convenio.index') }}">Convênio Baratão</a>
    <!-- Sidebar toggle button-->
    <a class="app-sidebar__toggle" href="#" data-toggle="sidebar" aria-label="Hide Sidebar"></a>
    <!-- Navbar Right Menu-->
    <ul class="app-nav">
        <!-- User Menu-->
        <li class="dropdown"><a class="app-nav__item" href="#" data-toggle="dropdown" aria-label="Open Profile Menu"><i class="fa fa-user fa-lg"></i></a>
            <ul class="dropdown-menu settings-menu dropdown-menu-right">
                {{--<li><a class="dropdown-item" href="#"><i class="fa fa-cog fa-lg"></i> Settings</a></li>
                <li><a class="dropdown-item" href="#"><i class="fa fa-user fa-lg"></i> Profile</a></li>--}}
                <li><a class="dropdown-item" href="{{ route('logout') }}"><i class="fa fa-sign-out fa-lg"></i> Sair</a></li>
            </ul>
        </li>
    </ul>
</header>
<!-- Sidebar menu-->
<div class="app-sidebar__overlay" data-toggle="sidebar"></div>
<aside class="app-sidebar">
    {{--<div class="app-sidebar__user"><img class="app-sidebar__user-avatar" src="#" alt="User Image">
        <div>
            <p class="app-sidebar__user-name">John Doe</p>
            <p class="app-sidebar__user-designation">Frontend Developer</p>
        </div>
    </div>--}}
    <ul class="app-menu">
        <li class="treeview"><a class="app-menu__item" href="#" data-toggle="treeview"><i class="app-menu__icon fa fa-plus-circle"></i><span class="app-menu__label">Cadastrar</span><i class="treeview-indicator fa fa-angle-right"></i></a>
            <ul class="treeview-menu">
                <li><a class="treeview-item" wire:navigate href="{{ route('funcionario.index')  }}"><i class="icon fa fa-user"></i> Funcionário</a></li>
                <li><a class="treeview-item" wire:navigate href="{{ route('importar-csv.index')  }}"><i class="icon fa fa-cloud-upload"></i> Importar CSV</a></li>
            </ul>
        </li>
        <li><a class="app-menu__item" wire:navigate href="{{ route('mostrar-funcionarios.index') }}"><i class="app-menu__icon fa fa-users"></i><span class="app-menu__label">Funcionários</span></a></li>
        <li class="treeview"><a class="app-menu__item" href="#" data-toggle="treeview"><i class="app-menu__icon fa fa-list"></i><span class="app-menu__label">Relatorios</span><i class="treeview-indicator fa fa-angle-right"></i></a>
            <ul class="treeview-menu">
                <li><a class="treeview-item" wire:navigate href="{{ route('compras-funcionario') }}"><i class="icon fa fa-shopping-cart"></i> Compras Func..</a></li>
                <li><a class="treeview-item" wire:navigate href="{{ route('compras-mes') }}"><i class="icon fa fa-file-excel-o"></i> Extrato Por Periodo</a></li>
            </ul>
        </li>
    </ul>
</aside>
<main class="app-content">
    <div class="app-title">
        <div>
            <h1><i class="fa fa-gg"></i> Baratão da Carne Convênio</h1>
            <i class="fa fa-user ml-2"> {{ auth()->user()->name }}</i>
        </div>
    </div>
    {{ $slot }}
</main>
{{--DataTables--}}
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
<script src="https://cdn.datatables.net/v/dt/jq-3.7.0/jszip-3.10.1/dt-2.0.7/b-3.0.2/b-colvis-3.0.2/b-html5-3.0.2/b-print-3.0.2/cr-2.0.2/r-3.0.2/sb-1.7.1/datatables.min.js"></script>
{{--Select2--}}
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>


<script src="{{  asset('js/popper.min.js') }}"></script>
<script data-navigate-once src="{{  asset('js/bootstrap.min.js') }}"></script>
<script data-navigate-once src="{{  asset('js/main.js') }}"></script>
<!-- The javascript plugin to display page loading on top-->
<script src="{{  asset('js/plugins/pace.min.js') }}"></script>
<!-- Page specific javascripts-->
{{-- Livewire-Alert --}}
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<x-livewire-alert::scripts />
</body>
</html>
