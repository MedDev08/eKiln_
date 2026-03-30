<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return response()->json(Service::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom_service' => 'required|string|max:255',
            'color' => 'required|string|max:20'
        ]);

        $service = Service::create($data);

        return response()->json([
            'success' => true,
            'data' => $service
        ], 201);
    }

    public function update(Request $request, Service $service)
    {
        $request->validate([
            'nom_service' => 'required|string|max:255',
            'color' => 'nullable|string|max:20'
        ]);

        $service->update($request->all());

        return response()->json([
            'success' => true,
            'message' => "Service mis à jour avec succès",
            'data' => $service
        ]);
    }
    public function show(Service $service)
    {
        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    public function destroy(Service $service)
    {
        if ($service->anneaux()->exists()) {
            return response()->json([
                'success' => false,
                'message' => "Impossible de supprimer : ce service contient des anneaux."
            ], 400);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => "Service supprimé avec succès."
        ]);
    }
    public function servicesSansEssais()
    {
        $services = Service::whereDoesntHave('essais')->get();

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }
}
