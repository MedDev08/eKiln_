<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DetailControle;
use App\Models\ControleFour;
use App\Models\Controle;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DetailControleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_controle_four' => 'required|exists:controle_four,id',
            'valeur' => 'nullable|string',
        ]);

        $validated['id_user'] = Auth::id();

        $detail = DetailControle::create($validated);

        return response()->json([
            'message' => 'Contrôle enregistré avec succès',
            'data' => $detail
        ], 201);
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $frequence = $request->input('frequence');
        $controles = $request->input('controles', []);
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $four = $request->input('four');
        $poste = $request->input('poste');
        $matricule = $request->input('matricule');
        $query = DetailControle::with([
            'controleFour.controle',
            'controleFour.four',
            'user'
        ])->orderBy('created_at', 'desc');

        if (!$dateFrom && !$dateTo) {
            $query->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month);
        }
        if ($dateFrom) {
            $query->where('created_at', '>=', $dateFrom . ' 06:00:00');
        }
        if ($dateTo) {
            $end = Carbon::parse($dateTo)->addDay()->format('Y-m-d');
            $query->where('created_at', '<=', $end . ' 05:59:59');
        }

        if ($frequence) {
            $query->whereHas('controleFour.controle', fn($q) => $q->where('frequence', 'LIKE', "%{$frequence}%"));
        }
        if (!empty($controles)) {
            $query->whereHas('controleFour.controle', function ($q) use ($controles) {
                $q->whereIn('id', $controles);
            });
        }
        if ($four) {
            $query->whereHas('controleFour.four', fn($q) => $q->where('id_four', $four));
        }
        if ($matricule) {
            $query->whereHas(
                'user',
                fn($q) =>
                $q->where('matricule', 'like', "%{$matricule}%")
            );
        }
        if ($poste) {
            $query->where(function ($q) use ($poste) {
                if ($poste === 'P1') {
                    $q->whereTime('created_at', '>=', '06:00:00')
                        ->whereTime('created_at', '<', '14:00:00');
                } elseif ($poste === 'P2') {
                    $q->whereTime('created_at', '>=', '14:00:00')
                        ->whereTime('created_at', '<', '22:00:00');
                } elseif ($poste === 'P3') {
                    $q->where(function ($sub) {
                        $sub->whereTime('created_at', '>=', '22:00:00')
                            ->orWhereTime('created_at', '<', '06:00:00');
                    });
                }
            });
        }

        $historiques = $query->paginate($perPage);

        $historiques->transform(function ($item) {
            $heure = (int) date('H', strtotime($item->created_at));

            if ($heure >= 6 && $heure < 14) {
                $item->poste = 'P1';
            } elseif ($heure >= 14 && $heure < 22) {
                $item->poste = 'P2';
            } else {
                $item->poste = 'P3';
            }
            return $item;
        });

        return response()->json([
            'historiques' => $historiques,
            'total' => $historiques->total(),
            'current_page' => $historiques->currentPage(),
            'per_page' => $historiques->perPage(),
            'last_page' => $historiques->lastPage()
        ]);
    }
    public function destroy($id)
    {
        $historique = DetailControle::find($id);
        if (!$historique) {
            return response()->json(['message' => 'Élément non trouvé'], 404);
        }
        $historique->delete();

        return response()->json(['message' => 'Élément supprimé avec succès']);
    }
    public function update(Request $request, $id)
    {
        $historique = DetailControle::find($id);

        if (!$historique) {
            return response()->json(['message' => 'Élément non trouvé'], 404);
        }

        $request->validate([
            'valeur' => 'required',
        ]);

        $historique->valeur = $request->valeur;
        $historique->save();

        return response()->json([
            'message' => 'Contrôle modifié avec succès',
            'data' => $historique->load(['controleFour.controle', 'user'])
        ]);
    }
    public function troisDernieresRemarques($id_four)
    {

        $idControleRemarque = Controle::where('libelle', 'Remarques')->pluck('id');

        $idControleFours = ControleFour::where('id_four', $id_four)
            ->whereIn('id_controle', $idControleRemarque)
            ->pluck('id');

        $dernieresRemarques = DetailControle::with('user')
            ->whereIn('id_controle_four', $idControleFours)
            ->where('created_at', '>=', now()->subHours(48))
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($d) {
                $heure = (int) date('H', strtotime($d->created_at));
                $shift = $heure >= 6 && $heure < 14 ? 'P1' : ($heure >= 14 && $heure < 22 ? 'P2' : 'P3');
                return [
                    'valeur' => $d->valeur,
                    'user' => $d->user->matricule ?? 'N/A',
                    'shift' => $shift,
                    'created_at' => $d->created_at,
                ];
            });

        return response()->json($dernieresRemarques);
    }
}
