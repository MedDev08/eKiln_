<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AnneauxBullers;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AnneauxBullersController extends Controller
{
    //Récupérer tous les anneaux 
    public function getAnneaux(Request $request)
    {
        $anneaux = AnneauxBullers::with([
            'chargement.wagon',
            'chargement.type_wagon',
            'chargement.four',
            'chargement.details.famille',
            'chargement.user',
            'user_cre',
            'user_rep'
        ])
            ->where(function ($q) {
                $q->whereNull('gauche')
                    ->orWhereNull('droit');
            })
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
            'total_count' => $anneaux->count(),
        ]);
    }

    public function getHistoriqueAnneauxParFour(Request $request, int $numFour)
    {
        try {
            $perPage = $request->input('per_page', 50);
            $page = $request->input('page', 1);

            $query = AnneauxBullers::with([
                'chargement.wagon',
                'chargement.type_wagon',
                'chargement.four',
                'chargement.details.famille',
                'chargement.user',
                'user_cre',
                'user_rep'
            ])
                ->join('chargements', 'chargements.id', '=', 'anneaux_bullers.id_chargement')
                ->where(function ($q) {
                    $q->whereNotNull('gauche')->orWhereNotNull('droit');
                })
                ->whereHas('chargement.four', fn($q) => $q->where('num_four', $numFour));

            // Filtrage 
            if ($request->dateFrom) {
                $query->whereDate('chargements.date_entrer', '>=', $request->dateFrom);
            }

            if ($request->dateTo) {
                $query->whereDate('chargements.date_entrer', '<=', $request->dateTo);
            }

            if ($request->wagon) {
                $query->whereHas(
                    'chargement.wagon',
                    fn($q) =>
                    $q->where('num_wagon', 'like', "%{$request->wagon}%")
                );
            }
            if ($request->type_wagon) {
                $query->whereHas(
                    'chargement.type_wagon',
                    fn($q) =>
                    $q->where('type_wagon', 'like', "%{$request->type_wagon}%")
                );
            }

            if ($request->four) {
                $query->whereHas(
                    'chargement.four',
                    fn($q) =>
                    $q->where('num_four', $request->four)
                );
            }

            if ($request->user_cre) {
                $query->whereHas('user_cre', fn($u) => $u->where('matricule', 'like', "%{$request->user_cre}%"));
            }

            if ($request->user_rep) {
                $query->whereHas('user_rep', fn($u) => $u->where('matricule', 'like', "%{$request->user_rep}%"));
            }
            if ($request->date_sortie) {
                $query->whereDate('chargements.datetime_sortieEstime', '=', $request->date_sortie);
            }
            if ($request->date_entrer) {
                $query->whereDate('chargements.date_entrer', '=', $request->date_entrer);
            }

            if ($request->gauche) {
                $query->where('gauche', 'like', "%{$request->gauche}%");
            }

            if ($request->droit) {
                $query->where('droit', 'like', "%{$request->droit}%");
            }


            $query->orderBy('chargements.datetime_sortieEstime', 'desc')
                ->select('anneaux_bullers.*');

            $Exporter = $query
                ->when(!$request->dateFrom && !$request->dateTo, function ($q) {
                    $q->whereYear('chargements.datetime_sortieEstime', now()->year)
                        ->whereMonth('chargements.datetime_sortieEstime', now()->month);
                })
                ->get();
            $anneaux = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $anneaux,
                'Exporter' => $Exporter,
                'total' => $anneaux->total(),
                'current_page' => $anneaux->currentPage(),
                'per_page' => $anneaux->perPage(),
                'last_page' => $anneaux->lastPage()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'historique des anneaux',
                'error' => $e->getMessage()
            ], 500);
        }
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
        $data['id_user_rep'] = $user->id_user ?? null;

        $anneau->update([
            'gauche' => $request->gauche,
            'droit'  => $request->droit,
            'id_user_rep' => $user->id_user,
        ]);

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
