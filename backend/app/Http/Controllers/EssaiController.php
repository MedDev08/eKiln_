<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Essai;
use Illuminate\Support\Facades\Auth;

class EssaiController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = Essai::with('service', 'details')
            ->orderBy('id', 'desc');

        if ($user->role !== 'admin') {

            $query->where('id_service', $user->id_service);
        }

        $essais = $query->get();

        return response()->json([
            'success' => true,
            'data' => $essais
        ]);
    }

    public function show($id)
    {
        $essais = Essai::with('service', 'details')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $essais
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom_essais' => 'required|string|max:255',
            'id_service' => 'required|exists:services,id',
        ]);

        $essais = Essai::create($data);

        return response()->json([
            'success' => true,
            'data' => $essais
        ]);
    }

    public function update(Request $request, int $id)
    {
        $essais = Essai::findOrFail($id);

        $data = $request->validate([
            'nom_essais' => 'sometimes|string|max:255',
            'id_service' => 'sometimes|exists:services,id',
        ]);

        $essais->update($data);

        return response()->json([
            'success' => true,
            'data' => $essais
        ]);
    }

    public function destroy(int $id)
    {
        $essai = Essai::findOrFail($id);

        if ($essai->details()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer : essai déjà utilisé.'
            ], 400);
        }

        $essai->delete();

        return response()->json([
            'success' => true,
            'message' => 'Essai supprimé avec succès'
        ]);
    }
}
