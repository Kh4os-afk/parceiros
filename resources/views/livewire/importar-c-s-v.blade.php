<div class="row">
    @include('alerts.alerts')
    <div class="col-md-7">
        <div class="tile">
            <h3 class="tile-title text-center">Formato do Arquivo CSV</h3>
            <div class="tile-body">
                <div class="alert alert-warning">
                    <ul>
                        <li>O arquivo deve estar no formato .CSV UTF-8 (Delimitado por vírgulas).</li>
                        <li>As colunas devem seguir a ordem Matrícula, CPF, Nome, Limite, Bloqueado.</li>
                        <li>O arquivo deve conter cabeçalho independente do nome das colunas.</li>
                    </ul>
                </div>
                <div class="row">
                    <img src="{{ asset('imagens/excel.png') }}" alt="Exemplo de Importação" class="mb-1">
                    <img src="{{ asset('imagens/importacaoexemplo.png') }}" alt="Exemplo de Importação">
                </div>
            </div>
            <div class="tile-footer"></div>
        </div>
    </div>
    <div class="col-md-5">
        <div class="tile">
            <form wire:submit="processar" method="post">
                <h3 class="tile-title">Importar CSV</h3>
                <div class="tile-body">
                    <div class="form-group">
                        <label class="control-label" for="csv">Arquivos CSV</label>
                        <input class="form-control @error('csv') is-invalid @enderror" type="file" id="csv" accept="text/csv" wire:model="csv" enctype="multipart/form-data" required>
                        @error('csv')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="tile-footer">
                    <button class="btn btn-success" type="submit" style="min-width: 120px; min-height: 40px;">
                        <div wire:loading.remove><i class="fa fa-fw fa-lg fa-check-circle"></i>Importar</div>
                        <div wire:loading>
                            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                            <span role="status">Carregando...</span>
                        </div>
                    </button>
                    <a href="{{ route('importacao-erros.index') }}" class="btn btn-warning" style="min-height: 40px;"><i class="fa fa-fw fa-lg fa-exclamation-triangle"></i>Erros de Importação</a>
                </div>
            </form>
        </div>
    </div>
</div>


