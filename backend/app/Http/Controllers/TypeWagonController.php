<?php

namespace App\Http\Controllers;

use App\Models\TypeWagon;
use Illuminate\Http\Request;

class TypeWagonController extends Controller
{
    public function index()
    {
        return response()->json(TypeWagon::all());
    }

    public function store(Request $request)
    {
        $typeWagon = TypeWagon::create($request->all());
        return response()->json($typeWagon, 201);
    }

    public function update(Request $request, TypeWagon $typeWagon)
    {
        $request->validate([
            'type_wagon' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20'
        ]);

        $typeWagon->update($request->all());

        return response()->json([
            'success' => true,
            'message' => "Type wagon updated successfully",
            'data' => $typeWagon
        ]);
    }
    public function show(TypeWagon $typeWagon)
    {
        return response()->json([
            'success' => true,
            'data' => $typeWagon
        ]);
    }

    public function destroy(TypeWagon $typeWagon)
    {
        if ($typeWagon->chargements()->exists()) {
            return response()->json([
                'success' => false,
                'message' => "Impossible de supprimer : ce type de wagon est utilisé dans un ou plusieurs chargements."
            ], 400);
        }

        $typeWagon->delete();

        return response()->json([
            'success' => true,
            'message' => "Type wagon supprimé."
        ]);
    }
}
