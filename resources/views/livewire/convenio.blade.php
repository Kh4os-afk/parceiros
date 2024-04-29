<div>
    <div class="row">
        <div class="col-md-6 col-lg-6" wire:click="funcionarios">
            <div class="widget-small primary coloured-icon"><i class="icon fa fa-users fa-3x"></i>
                <div class="info">
                    <h4>Funcionarios</h4>
                    <p><b>{{ \App\Models\Partner::count() }}</b></p>
                </div>
            </div>
        </div>
        {{--<div class="col-md-6 col-lg-3">
            <div class="widget-small info coloured-icon"><i class="icon fa fa-thumbs-o-up fa-3x"></i>
                <div class="info">
                    <h4>Likes</h4>
                    <p><b>25</b></p>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="widget-small warning coloured-icon"><i class="icon fa fa-files-o fa-3x"></i>
                <div class="info">
                    <h4>Uploades</h4>
                    <p><b>10</b></p>
                </div>
            </div>
        </div>--}}
        <div class="col-md-6 col-lg-6" wire:click="funcionariosErros">
            <div class="widget-small danger coloured-icon"><i class="icon fa fa-exclamation fa-3x"></i>
                <div class="info">
                    <h4>Erros de Importação</h4>
                    <p><b>{{ \App\Models\PartnerError::count() }}</b></p>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div class="tile">
                <h3 class="tile-title"></h3>
                <div class="tile-body">
                    <div class="">
                        <div class="text-center">
                            <i class="fa fa-home fa-2x"></i>
                            <h2 class="h22">ENDEREÇO</h2>
                            <span class="font-l">Av. Tancredo Neves, 1760 - Parque 10 de Novembro</span>
                        </div>
                        <div class="text-center">
                            <i class="fa fa-phone fa-2x"></i>
                            <h2 class="h22">TELEFONE</h2>
                            <span class="font-l">(92) 3582-3294</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
