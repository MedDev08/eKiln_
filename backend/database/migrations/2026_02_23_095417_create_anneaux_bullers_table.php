<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('anneaux_bullers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_chargement');
            $table->decimal('gauche', 10, 2)->nullable();
            $table->decimal('droit', 10, 2)->nullable();
            $table->unsignedBigInteger('id_user_cre')->nullable();
            $table->unsignedBigInteger('id_user_rep')->nullable();
            $table->timestamps();

            // Clés étrangères
            $table->foreign('id_chargement')
                ->references('id')
                ->on('chargements')
                ->onDelete('cascade');

            $table->foreign('id_user_cre')
                ->references('id_user')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('id_user_rep')
                ->references('id_user')
                ->on('users')
                ->noActionOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anneaux_bullers', function (Blueprint $table) {
            // Supprimer les clés étrangères avant de drop
            $table->dropForeign(['id_chargement']);
            $table->dropForeign(['id_user_cre']);
            $table->dropForeign(['id_user_rep']);
        });

        Schema::dropIfExists('anneaux_bullers');
    }
};
