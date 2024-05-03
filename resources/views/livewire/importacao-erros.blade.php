<div class="row">
    <div class="col-md-12">
        @include('alerts.alerts')
        <div class="tile">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="tile-title mb-0">Erros Durante a Importação: {{ $erros ?? 0 }}</h3>
                <div>
                    <button class="btn btn-warning" wire:click="deleteAllDuplicates" wire:loading.attr="disabled">
                        <i class="fa fa-fw fa-lg fa-trash"></i>Excluir Registros Duplicados
                    </button>
                    <button class="btn btn-danger" wire:click="deleteAll" wire:loading.attr="disabled">
                        <i class="fa fa-fw fa-lg fa-trash"></i>Excluir Todos os Registros com Erro
                    </button>
                </div>
            </div>
            <div class="tile-body">
                <table class="table table-bordered table-striped table-sm table-hover">
                    <thead>
                    <tr>
                        <th>Matricula</th>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Lim Credito</th>
                        <th>Bloqueado</th>
                        <th class="text-center">Erros</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($funcionarios as $funcionario)
                        <tr wire:key="{{ $funcionario->id }}">
                            <td>{{ $funcionario->matricula }}</td>
                            <td>{{ ucwords(strtolower($funcionario->nome)) }}</td>
                            <td>{{ $funcionario->cpf }}</td>
                            <td>R$ {{ number_format($funcionario->limcred,2,',','.') }}</td>
                            <td>{{ $funcionario->bloqueado == 1 ? 'Sim' : 'Não'}}</td>
                            <td>{{ $funcionario->erros }}</td>
                            <td class="text-center">
                                <button class="btn btn-danger" wire:click="delete({{ $funcionario->id }})" wire:loading.attr="disabled">
                                    <i class="icon mr-0 fa fa-trash"></i></button>
                                <button class="btn btn-success" wire:click="editarFuncionario({{$funcionario->id}})" wire:loading.attr="disabled">
                                    <i class="mr-0 fa fa-edit fa-lg"></i></button>
                            </td>
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
