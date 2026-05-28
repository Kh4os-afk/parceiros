<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
        Schema::table('partners', function (Blueprint $table) {
            $table->integer('matricula')->nullable(false)->change();
        });

        Schema::table('partner_errors', function (Blueprint $table) {
            $table->integer('matricula')->nullable(false)->change();
        });
    }
};
