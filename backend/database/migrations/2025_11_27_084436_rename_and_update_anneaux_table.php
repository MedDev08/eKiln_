<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Renommer la table
        Schema::rename('anneaux_angulaires', 'anneaux_bullers');

        // Ajouter la colonne id_user
        Schema::table('anneaux_bullers', function (Blueprint $table) {
            $table->unsignedBigInteger('id_user')->nullable()->after('id_chargement');

            // Clé étrangère vers users.id_user
            $table->foreign('id_user')
                ->references('id_user')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('anneaux_bullers', function (Blueprint $table) {
            $table->dropForeign(['id_user']);
            $table->dropColumn('id_user');
        });

        // Revenir au nom initial de la table
        Schema::rename('anneaux_bullers', 'anneaux_angulaires');
    }
};
