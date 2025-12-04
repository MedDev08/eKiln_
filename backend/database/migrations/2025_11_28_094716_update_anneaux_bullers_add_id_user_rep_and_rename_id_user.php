<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        //  Renommer id_user → id_user_cre
        Schema::table('anneaux_bullers', function (Blueprint $table) {
            if (Schema::hasColumn('anneaux_bullers', 'id_user')) {
                $table->renameColumn('id_user', 'id_user_cre');
            }
        });

        //  Ajouter id_user_rep après id_user_cre
        Schema::table('anneaux_bullers', function (Blueprint $table) {
            if (!Schema::hasColumn('anneaux_bullers', 'id_user_rep')) {
                $table->unsignedBigInteger('id_user_rep')->nullable()->after('id_user_cre');

                // Clé étrangère vers users.id_user
                $table->foreign('id_user_rep')
                    ->references('id_user')
                    ->on('users')
                    ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        // Supprimer id_user_rep
        Schema::table('anneaux_bullers', function (Blueprint $table) {
            if (Schema::hasColumn('anneaux_bullers', 'id_user_rep')) {
                $table->dropForeign(['id_user_rep']);
                $table->dropColumn('id_user_rep');
            }
        });

        // Renommer id_user_cre → id_user
        Schema::table('anneaux_bullers', function (Blueprint $table) {
            if (Schema::hasColumn('anneaux_bullers', 'id_user_cre')) {
                $table->renameColumn('id_user_cre', 'id_user');
            }
        });
    }
};
