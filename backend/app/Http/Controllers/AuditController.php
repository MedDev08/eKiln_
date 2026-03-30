<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $query = Audit::with([
            'user',
            'auditable',
            // 'auditable.type_wagon',
            // 'auditable.four',
            // 'auditable.wagon'
        ]);
        // Filtrer si "type" existe dans l'URL
        if ($request->filled('type')) {
            $model = 'App\\Models\\' . $request->type;
            $query->where('auditable_type', $model);
        }

        $audits = $query->orderBy('created_at', 'desc')->get();

        return response()->json($audits);
    }

    //  Retourner la liste des types disponibles
    public function types()
    {
        $types = Audit::selectRaw("REPLACE(auditable_type, 'App\\\\Models\\\\', '') as type")
            ->distinct()
            ->pluck('type');

        return response()->json($types);
    }
}
