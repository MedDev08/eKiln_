<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Chargement;
use Carbon\Carbon;

class UpdateChargementStatus extends Command
{
    protected $signature = 'chargement:update-status';
    protected $description = 'Met à jour les statuts des chargements automatiquement';

    public function handle()
    {
        $now = Carbon::now();

        /*Chargement::where('statut', 'en attente')
            ->where('created_at', '<=', $now->copy()->subSeconds(2))
            ->get()
            ->each(function($chargement) {
                $chargement->update(['statut' => 'en cuisson']);
            });*/

        Chargement::where('statut', 'en cuisson')
            ->where('datetime_sortieEstime', '<=', $now->copy()->addseconds(2))
            ->get()
            ->each(function ($chargement) {
                $chargement->update(['statut' => 'prêt à sortir']);
            });

        Chargement::where(function ($query) use ($now) {
            $query->where('statut', 'prêt à sortir')
                ->orWhere('statut', 'en cuisson');
        })
            ->where('datetime_sortieEstime', '<=', $now)
            ->get()
            ->each(function ($chargement) {
                $chargement->update(['statut' => 'sorti']);
            });
    }
}
