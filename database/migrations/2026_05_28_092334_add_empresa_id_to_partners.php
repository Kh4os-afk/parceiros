<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            if (! Schema::hasColumn('partners', 'empresa_id')) {
                $table->foreignId('empresa_id')->nullable()->constrained('empresas')->cascadeOnDelete()->after('id');
            }
            if (Schema::hasIndex('partners', ['cpf'])) {
                $table->dropUnique(['cpf']);
            }
            if (! Schema::hasIndex('partners', ['empresa_id', 'cpf'])) {
                $table->unique(['empresa_id', 'cpf']);
            }
            if (! Schema::hasIndex('partners', ['empresa_id', 'matricula'])) {
                $table->unique(['empresa_id', 'matricula']);
            }
        });
    }

    public function down(): void
    {
        // FK primeiro — no MySQL o índice composto pode estar ligado à foreign key de empresa_id
        if (Schema::hasColumn('partners', 'empresa_id')) {
            Schema::table('partners', function (Blueprint $table) {
                $table->dropForeign(['empresa_id']);
            });
        }

        Schema::table('partners', function (Blueprint $table) {
            if (Schema::hasIndex('partners', ['empresa_id', 'cpf'])) {
                $table->dropUnique(['empresa_id', 'cpf']);
            }
            if (Schema::hasIndex('partners', ['empresa_id', 'matricula'])) {
                $table->dropUnique(['empresa_id', 'matricula']);
            }
            if (! Schema::hasIndex('partners', ['cpf'])) {
                $table->unique('cpf');
            }
            if (Schema::hasColumn('partners', 'empresa_id')) {
                $table->dropColumn('empresa_id');
            }
        });
    }
};
