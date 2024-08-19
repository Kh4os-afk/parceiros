<div class="row justify-content-center">
    @if($show)
        <div class="col-md-8">
            <div class="tile">
                <h3 class="tile-title">Extrato Por Periodo</h3>
                <form wire:submit.prevent="submit">
                    <div class="tile-body">
                        <div class="form-group">
                            <label for="dtinicial" class="form-label">Data Inicial</label>
                            <input type="text" class="form-control" wire:model="dtinicial" x-mask="99/99/9999">
                        </div>
                        <div class="form-group">
                            <label for="dtfinal" class="form-label">Data Final</label>
                            <input type="text" class="form-control" wire:model="dtfinal" x-mask="99/99/9999">
                        </div>
                    </div>
                    <div class="tile-footer">
                        <button type="submit" class="btn btn-success"><i class="fa fa-search"></i> Buscar</button>
                    </div>
                </form>
            </div>
        </div>
    @else
        <div class="col-md-12">
            <div class="tile">
                <h3 class="tile-title mb-0">Extrato Por Funcionario</h3>
                <h3 class="tile-title mt-0">Periodo {{ \Carbon\Carbon::parse($dtinicial)->format('d/m/Y') ?? '' }} a {{ \Carbon\Carbon::parse($dtfinal)->format('d/m/Y') ?? '' }}</h3>
                <div class="tile-body">
                    <table id="table" class="display compact" style="width: 100%">
                        <thead>
                        <tr>
                            <th>CPF</th>
                            <th>Nome</th>
                            <th>Valor</th>
                        </tr>
                        </thead>
                        <tbody>
                        @forelse($vendas as $venda)
                            <tr>
                                <td>{{ $venda->cpf }}</td>
                                <td>{{ $venda->funcionario->nome ?? 'FUNCIONÁRIO NÃO CADASTRADO'}}</td>
                                <td>{{ number_format($venda->total_valor,2,',','.') }}</td>
                            </tr>
                        @empty
                        @endforelse
                        </tbody>
                    </table>
                </div>
                <div class="tile-footer">
                    <button class="btn btn-secondary" wire:click="resetar">Voltar</button>
                </div>
            </div>
        </div>

        @script
        <script>
            $(document).ready(function () {
                new DataTable('#table', {
                    language: {
                        url: '{!! asset('datatables/pt-BR.json') !!}'
                    },
                    lengthMenu: [
                        [10, 25, 50, 100, -1],
                        [10, 25, 50, 100, 'All']
                    ],
                    layout: {
                        topStart: 'buttons',
                        bottomStart: 'pageLength',
                    },
                    colReorder: true,
                    scrollX: true,
                    buttons: [
                        'colvis',
                        'searchBuilder',
                        'excelHtml5',
                        {
                            extend: 'print',
                            title: 'Compras Por Funcionario',
                            messageTop: function () {
                                return '<h2 style="text-align: center; margin-bottom: 30px;">' + {!! json_encode(now() ? now()->format('d/m/Y H:i:s') : '') !!} + '</h2>';
                            },
                            customize: function (win) {
                                $(win.document.body).find('h1').css('text-align', 'center');
                            },
                            exportOptions: {
                                columns: ':visible',
                            }
                        },
                        {
                            extend: 'pdfHtml5',
                            title: 'Compras Por Funcionario',
                            filename: 'Compras Por Funcionario',
                            orientation: 'landscape',
                            pageSize: 'A3',
                            customize: function (doc) {
                                doc.content[0].margin = [0, 0, 0, 5];
                                doc.content.splice(1, 0, {
                                    margin: [0, 0, 0, 12],
                                    alignment: 'center',
                                    fontSize: 12,
                                    text: {!! json_encode(now() ? now()->format('d/m/Y H:i:s') : '') !!},
                                });
                            },
                            exportOptions: {
                                columns: ':visible'
                            },
                        },
                        'csvHtml5',
                    ]
                });
            });
        </script>
        @endscript
    @endif
</div>

@script
<script data-navigate-once>
    $(document).ready(function () {
        $('.select2').select2({
            placeholder: "Buscar",
            theme: 'bootstrap4',
        });
        $('.select2').on('change', function (e) {
            @this.
            set('mes', e.target.value);
        });
    });
</script>

@endscript
