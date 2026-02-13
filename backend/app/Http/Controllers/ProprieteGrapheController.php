<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProprieteGraphe;

class ProprieteGrapheController extends Controller
{
    public function index()
    {
        return ProprieteGraphe::with('four')->get();
    }
    public function show($id)
    {
        return ProprieteGraphe::with('four')->findOrFail($id);
    }
    public function store(Request $request)
    {

        $data = $request->validate([
            'id_four' => 'required|exists:fours,id_four',
            'V1' => 'required|numeric',
            'V2' => 'required|numeric',
            'color' => 'required|string'
        ]);
        if ($data['V1'] >= $data['V2']) {
            return response()->json([
                'success' => false,
                'message' => 'V1 doit être inférieur à V2.'
            ], 400);
        }

        $propriete = ProprieteGraphe::create($data);
        return response()->json([
            'success' => true,
            'data' => $propriete
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'id_four' => 'required|exists:fours,id_four',
            'V1' => 'required|numeric',
            'V2' => 'required|numeric',
            'color' => 'required|string',
        ]);

        if ($data['V1'] >= $data['V2']) {
            return response()->json([
                'success' => false,
                'message' => 'V1 doit être inférieur à V2.'
            ], 400);
        }

        $zone = ProprieteGraphe::findOrFail($id);
        $zone->update($data);

        return response()->json([
            'success' => true,
            'data' => $zone
        ], 200);
    }


    public function destroy($id)
    {
        ProprieteGraphe::destroy($id);
        return response()->json(['success' => true]);
    }
    public function getZonesByFour(int $numFour)
    {
        try {
            $zones = ProprieteGraphe::whereHas('four', function ($q) use ($numFour) {
                $q->where('num_four', $numFour);
            })
                ->orderBy('V1')
                ->get([
                    'V1',
                    'V2',
                    'color'
                ]);

            return response()->json($zones);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur récupération zones',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
