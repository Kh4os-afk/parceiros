<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->integer('matricula')->nullable()->change();
        });

        Schema::table('partner_errors', function (Blueprint $table) {
            $table->integer('matricula')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Não força NOT NULL se já existirem matrículas nulas (evita falha no migrate:refresh)
        if (DB::table('partners')->whereNull('matricula')->doesntExist()) {
            Schema::table('partners', function (Blueprint $table) {
                $table->integer('matricula')->nullable(false)->change();
            });
        }

        if (DB::table('partner_errors')->whereNull('matricula')->doesntExist()) {
            Schema::table('partner_errors', function (Blueprint $table) {
                $table->integer('matricula')->nullable(false)->change();
            });
        }
    }
};
