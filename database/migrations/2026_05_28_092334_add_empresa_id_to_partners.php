<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->cascadeOnDelete()->after('id');
            $table->dropUnique(['cpf']);
            $table->unique(['empresa_id', 'cpf']);
            $table->unique(['empresa_id', 'matricula']);
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropUnique(['empresa_id', 'cpf']);
            $table->dropUnique(['empresa_id', 'matricula']);
            $table->unique('cpf');
            $table->dropForeign(['empresa_id']);
            $table->dropColumn('empresa_id');
        });
    }
};
