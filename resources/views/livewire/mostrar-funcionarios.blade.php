<div class="row">
    <div class="col-md-12">
        @include('alerts.alerts')
        <div class="tile">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="tile-title mb-0">Funcionários Cadastrados</h3>
                <form wire:submit="search">
                    <div>
                        <label class="visually-hidden" for="search">Buscar</label>
                        <div class="input-group">
                            <div class="input-group-text"><i class="fa fa-search"></i></div>
                            <input type="text" class="form-control" id="search" placeholder="Nome..." wire:model.live="query">
                            <button class="btn btn-success" type="submit">Buscar</button>
                        </div>
                    </div>
                </form>
            </div>
            {{--<div>
                <form wire:submit="search" class="row row-cols-lg-auto g-3 align-items-center justify-content-end">
                    <div class="col-12 pb-4">
                        <label class="visually-hidden" for="search">Buscar</label>
                        <div class="input-group">
                            <div class="input-group-text"><i class="fa fa-search"></i></div>
                            <input type="text" class="form-control" id="search" placeholder="Nome..." wire:model.live="query">
                            <button class="btn btn-success" type="submit">Buscar</button>
                        </div>
                    </div>
                </form>
            </div>--}}
            <div class="tile-body">
                <table class="table table-bordered table-striped table-sm table-hover">
                    <thead>
                    <tr>
                        <th wire:click="filtrar('matricula')">Matricula</th>
                        <th wire:click="filtrar('nome')">Nome</th>
                        <th wire:click="filtrar('cpf')">CPF</th>
                        <th wire:click="filtrar('limcred')">Lim Credito</th>
                        <th wire:click="filtrar('bloqueado')">Bloqueado</th>
                        <th class="text-center">Editar</th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($funcionarios as $funcionario)
                        <tr>
                            <td>{{ $funcionario->matricula }}</td>
                            <td>{{ ucwords(strtolower($funcionario->nome)) }}</td>
                            <td>{{ $funcionario->cpf }}</td>
                            <td>R$ {{ number_format($funcionario->limcred,2,',','.') }}</td>
                            <td>{{ $funcionario->bloqueado == 1 ? 'Sim' : 'Não'}}</td>
                            <td class="text-center"><button class="btn btn-success" wire:click="editarFuncionario({{$funcionario->id}})"><i class="mr-0 fa fa-edit fa-lg"></i></button></td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center">Nenhum dado encontrado!</td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
            <div class="tile-footer">
                {{ $funcionarios->links('pagination::bootstrap-5') }}
            </div>
        </div>
    </div>
</div>

