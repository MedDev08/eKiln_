<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DetailEssai;
use App\Models\Chargement;
use Exception;

class DetailEssaiController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'chargement_id' => 'required|integer|exists:chargements,id',
                'essais_ids' => 'required|array',
                'essais_ids.*' => 'integer|exists:essais,id',
            ]);

            $chargement = Chargement::findOrFail($request->chargement_id);

            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            $existingEssais = DetailEssai::where('id_chargement', $chargement->id)
                ->pluck('id_essais')
                ->toArray();

            $newEssais = $request->essais_ids;

            $toDelete = array_diff($existingEssais, $newEssais);
            DetailEssai::where('id_chargement', $chargement->id)
                ->whereIn('id_essais', $toDelete)
                ->delete();

            $toAdd = array_diff($newEssais, $existingEssais);

            foreach ($toAdd as $essai_id) {
                DetailEssai::create([
                    'id_chargement' => $chargement->id,
                    'id_essais' => $essai_id,
                    'id_user_cre' => $user->id_user
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Essais enregistrés avec succès !'
            ]);
        } catch (Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement des essais',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function history(Request $request, int $numFour)
    {
        try {
            $perPage = $request->input('per_page', 50);
            $page = $request->input('page', 1);

            $query = DetailEssai::with([
                'chargement.wagon',
                'chargement.type_wagon',
                'chargement.four',
                'chargement.details.famille',
                'chargement.user',
                'user_cre',
                'user_rep',
                'essai.service'
            ])
                ->join('chargements', 'chargements.id', '=', 'details_essais.id_chargement')
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

            if ($request->valeur) {
                $query->where('valeur', 'like', "%{$request->valeur}%");
            }

            if ($request->essai) {
                $query->whereHas(
                    'essai',
                    fn($q) => $q->where('nom_essais', 'like', "%{$request->essai}%")
                );
            }

            if ($request->service) {
                $query->whereHas(
                    'essai.service',
                    fn($q) => $q->where('nom_service', 'like', "%{$request->service}%")
                );
            }

            $query->orderBy('chargements.datetime_sortieEstime', 'desc')
                ->select('details_essais.*');

            $essais = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'success' => true,
                'data' => $essais,
                'total' => $essais->total(),
                'current_page' => $essais->currentPage(),
                'per_page' => $essais->perPage(),
                'last_page' => $essais->lastPage()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'historique des essais',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function saveValeur(Request $request, $id_chargement)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $essai = DetailEssai::where('id_chargement', $id_chargement)->first();

        $data = $request->validate([
            'valeur' => 'required|numeric',
        ]);

        // Assigner l'utilisateur connecté
        $data['id_user_rep'] = $user->id_user ?? null;

        $essai->update([
            'valeur'  => $request->valeur,
            'id_user_rep' => $user->id_user,
        ]);

        return response()->json([
            'message' => 'Valeur enregistrée avec succès',
            'essai' => $essai
        ]);
    }
    public function destroy($id)
    {
        try {
            $detail = DetailEssai::findOrFail($id);

            $detail->delete();

            return response()->json([
                'success' => true,
                'message' => 'Essai supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Détail d\'essai supprimé avec succès',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
