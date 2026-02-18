<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('details_controles', function (Blueprint $table) {

            // Supprimer les anciennes clés étrangères
            $table->dropForeign(['controle_id']);
            $table->dropForeign(['four_id']);

            $table->dropColumn(['controle_id', 'four_id']);

            $table->foreignId('id_controle_four')
                ->constrained('controle_four')
                ->onDelete('cascade');

            $table->foreignId('id_user')
                ->constrained('users')
                ->onDelete('cascade');
        });
    }

    public function down(): void {}
};
