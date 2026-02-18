<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('controle_four', function (Blueprint $table) {
            $table->boolean('required')->default(true)->after('id_four');
        });
    }

    public function down(): void
    {
        Schema::table('controle_four', function (Blueprint $table) {
            $table->dropColumn('required');
        });
    }
};
