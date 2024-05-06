<div>
    @include('alerts.alerts')
    <div class="tile">
        <form wire:submit="editar">
            <h3 class="tile-title">Editar Funcionário - {{ ucwords(strtolower($nome)) }}</h3>
            <div class="title-body">
                <div class="row g-3">
                    <div class="col-md-7">
                        <label for="nome" class="form-label">Nome</label>
                        <input type="text" class="form-control @error('nome') is-invalid @enderror" id="nome" maxlength="60" name="nome" wire:model.blur="nome">
                        @error('nome')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-5">
                        <label for="cpf" class="form-label">CPF</label>
                        <input type="number" class="form-control @error('cpf') is-invalid @enderror" id="cpf" name="cpf" wire:model.blur="cpf" disabled>
                        @error('cpf')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-4">
                        <label for="matricula" class="form-label">Matricula</label>
                        <input type="text" class="form-control @error('matricula') is-invalid @enderror" id="matricula" name="matricula" placeholder="1234" wire:model.blur="matricula">
                        @error('matricula')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-4">
                        <label for="limcred" class="form-label">Limite de Credito</label>
                        <input type="number" step="0,01" min="0,01" max="999" class="form-control @error('limcred') is-invalid @enderror" id="limcred" name="limcred" wire:model.blur="limcred">
                        @error('limcred')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-4">
                        <label for="bloqueado" class="form-label">Bloqueado</label>
                        <select id="bloqueado" class="form-select @error('bloqueado') is-invalid @enderror @if($bloqueado) is-invalid @endif" name="bloqueado" wire:model.blur="bloqueado">
                            <option value="1">S</option>
                            <option value="0">N</option>
                        </select>
                        @error('bloqueado')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        @if($bloqueado)
                            <div class="invalid-feedback">Atenção - Funcionário Bloqueado!</div>
                        @endif
                    </div>
                    <div class="col-12">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="gridCheck" required>
                            <label class="form-check-label" for="gridCheck"> Confirmo os Dados Informados! </label>
                        </div>
                    </div>
                    <div class="tile-footer">
                        <button type="submit" class="btn btn-warning">Editar Funcionário</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>
