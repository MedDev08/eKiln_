<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AnneauxBullers;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AnneauxBullersController extends Controller
{
    //Récupérer tous les anneaux incomplets (gauche/droit null)//
    public function getAnneaux()
    {
        // $now = now();
        // $currentHour = $now->hour;

        // // Déterminer la fin du shift
        // if ($currentHour >= 6 && $currentHour < 14) {
        //     $end = $now->copy()->setTime(14, 0, 0);
        // } elseif ($currentHour >= 14 && $currentHour < 22) {
        //     $end = $now->copy()->setTime(22, 0, 0);
        // } else {
        //     $end = $currentHour >= 22
        //         ? $now->copy()->addDay()->setTime(6, 0, 0)
        //         : $now->copy()->setTime(6, 0, 0);
        // }
        // $endOfDay = $now->copy()->endOfDay(); // fin de la journée (23:59:59)
        // Récupérer les anneaux dont le chargement sort avant la fin du shift
        $anneaux = AnneauxBullers::with(['chargement' => function ($query) {
            $query->with(['wagon', 'type_wagon', 'four', 'details.famille', 'user']);
        }])
            ->where(function ($q) {
                $q->whereNull('gauche')
                    ->orWhereNull('droit');
            })
            // ->whereHas('chargement', function ($query) use ($endOfDay) {
            //     $query->where('datetime_sortieEstime', '<=', $endOfDay);
            // })
            ->join('chargements', 'chargements.id', '=', 'anneaux_bullers.id_chargement')
            ->orderBy('chargements.datetime_sortieEstime', 'ASC')
            ->get();
        // Grouper par id_four
        $anneauxParFour = $anneaux->groupBy(function ($item) {
            return $item->chargement->four->num_four ?? 'inconnu';
        });

        return response()->json([
            'anneaux' => $anneaux,
            'anneauxParFour' => $anneauxParFour,
            // 'shift_end' => $end->format('H:i'),
            // 'end_of_day' => $endOfDay->format('d-m-Y H:i:s'),
            'total_count' => $anneaux->count(),
        ]);
    }
    //Sauvegarder les mesures gauche/droit pour un chargement donné
    public function saveMeasures(Request $request, $id_chargement)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }
        // Récupère l'anneau correspondant au chargement
        $anneau = AnneauxBullers::where('id_chargement', $id_chargement)->first();

        $data = $request->validate([
            'gauche' => 'required|numeric',
            'droit'  => 'required|numeric',
        ]);

        // Assigner l'utilisateur connecté
        $data['id_user'] = $user->id_user;

        $anneau->update($data);

        return response()->json([
            'message' => 'Mesures enregistrées avec succès',
            'anneau' => $anneau
        ]);
    }
    //Retourner tous les id_chargement pour recherche (icon)
    public function getAllChargementIds()
    {
        $chargements = AnneauxBullers::select('id_chargement')->distinct()->get();
        $ids = $chargements->pluck('id_chargement'); // seulement les IDs uniques

        return response()->json([
            'ids' => $ids,
            'total_count' => $ids->count(),
        ]);
    }
}
