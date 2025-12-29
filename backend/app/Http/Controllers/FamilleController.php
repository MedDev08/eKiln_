<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Famille;
use App\Models\DetailChargement;
use Dotenv\Validator;

class FamilleController extends Controller
{

    public function index()
    {
        $familles = Famille::all(); // ou filtrer selon certains critères
        return response()->json($familles);
    }
    public function getTotalPiecesCount()
    {
        $total = DetailChargement::sum('quantite');
        return response()->json(['count' => $total]);
    }

    public function getTotalPiecesSum()
    {
        $total = DetailChargement::whereHas('chargement', function ($query) {
            $query->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir']);
        })->sum('quantite');

        return response()->json(['count' => $total]);
    }
    public function show($id)
    {
        try {
            $famille = Famille::findOrFail($id);

            // Calculer le total des pièces pour cette famille dans tous les chargements actifs
            $totalPieces = DetailChargement::where('id_famille', $id)
                ->whereHas('chargement', function ($query) {
                    $query->whereIn('statut', ['en attente', 'en cuisson', 'prêt à sortir', 'sorti']);
                })
                ->sum('quantite');

            return response()->json([
                ...$famille->toArray(),
                'total_pieces' => $totalPieces
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Famille non trouvée',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_famille' => 'required|string|max:50|unique:familles,nom_famille',
            'valeur_trieur' => 'required|numeric|min:0',
            'active' => 'sometimes|boolean',
        ]);

        $famille = Famille::create($validated);

        return response()->json($famille, 201);
    }

    public function update(Request $request, Famille $famille)
    {
        $validated = $request->validate([
            'nom_famille' => 'required|string|max:50|unique:familles,nom_famille,' . $famille->id_famille . ',id_famille',
            'valeur_trieur' => 'required|numeric|min:0',
            'active' => 'sometimes|boolean',
        ]);

        $famille->update($validated);

        return response()->json($famille);
    }

    public function destroy(Famille $famille)
    {
        // Vérifier si la famille est utilisée dans des relations avant de supprimer
        if ($famille->polyvalences()->exists() || $famille->affectationsTrieur()->exists()) {
            return response()->json([
                'message' => 'Cette famille est utilisée dans des relations et ne peut pas être supprimée'
            ], 422);
        }

        $famille->delete();

        return response()->json(['message' => 'Famille supprimée avec succès']);
    }
}
