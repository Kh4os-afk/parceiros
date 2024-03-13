<div>
    @if($erros == 0 )
        <div class="row">
            <div class="col-md-7">
                <div class="tile">
                    <h3 class="tile-title text-center">Formato do Arquivo CSV</h3>
                    <div class="tile-body">
                        <div class="alert alert-warning">
                            <ul>
                                <li>O arquivo deve estar no formato .CSV, separado por ponto e vírgula (;).</li>
                                <li>As colunas devem seguir a ordem Matrícula, CPF, Nome, Limite, Bloqueado.</li>
                                <li> O arquivo deve conter cabeçalho independente do nome das colunas.</li>
                            </ul>
                        </div>
                        <div class="row">
                            <img src="{{ asset('imagens/importacaoexemplo.png') }}" alt="" srcset="">
                        </div>
                    </div>
                    <div class="tile-footer"></div>
                </div>
            </div>
            <div class="col-md-5">
                <div class="tile">
                    <form wire:submit="processar">
                        <h3 class="tile-title">Importar CSV</h3>
                        <div class="tile-body">
                            <div class="form-group">
                                <label class="control-label" for="csv">Arquivos CSV</label>
                                <input class="form-control @error('csv') is-invalid @enderror" type="file" id="csv" accept="text/csv" wire:model="csv" required>
                                @error('csv')
                                <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        <div class="tile-footer">
                            <button class="btn btn-success" type="submit" wire:loading.attr="disabled">
                                <div wire:loading.remove><i class="fa fa-fw fa-lg fa-check-circle"></i>Importar</div>
                                <span class="spinner-border spinner-border-sm" aria-hidden="true" wire:loading></span>
                                <span role="status" wire:loading>Carregando...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @else
        <div class="row">
            <div class="col-md-12">
                <div class="tile">
                    <h3 class="tile-title">Erros Durante a Importação: {{ $erros ?? 0 }}</h3>
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
                            </tr>
                            </thead>
                            <tbody>
                            @forelse($funcionarioErros as $funcionario)
                                <tr>
                                    <td>{{ $funcionario['funcionario'][0] }}</td>
                                    <td>{{ ucwords(strtolower($funcionario['funcionario'][2])) }}</td>
                                    <td>{{ $funcionario['funcionario'][1] }}</td>
                                    <td>R$ {{ number_format($funcionario['funcionario'][3],2,',','.') }}</td>
                                    <td>{{ $funcionario['funcionario'][4] == 1 ? 'Sim' : 'Não'}}</td>
                                    <td>
                                        @forelse($funcionario['erros'] as $erros)
                                            <div class="text-danger text-center">{{ str_replace([' 0 ',' 1 ',' 2 ',' 3 ',' 4 '],[' Matricula ',' CPF ',' Nome ',' Limite de Credito ',' Bloqueado '],$erros) }} </div>
                                        @empty
                                        @endforelse
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
                    <div class="tile-footer"></div>
                </div>
            </div>
        </div>
    @endif

</div>

