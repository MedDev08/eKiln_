<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Controle;
use App\Models\ControleFour;
use App\Models\DetailControle;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ControleController extends Controller
{
    public function index()
    {
        return Controle::with('controleFours.four')->get();
    }

    public function show($id)
    {
        return Controle::with('controleFours.four')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'libelle'    => 'required|string|max:255',
            'type'       => 'required|string|max:50',
            'frequence'  => 'required|string|max:255',
            'ids_four'   => 'required|array|min:1',
            'ids_four.*.id_four' => 'required|exists:fours,id_four',
            'ids_four.*.required' => 'required|boolean',
        ]);

        try {
            $controle = Controle::create([
                'libelle'   => $validated['libelle'],
                'type'      => $validated['type'],
                'frequence' => $validated['frequence'] ?? null,
            ]);

            foreach ($validated['ids_four'] as $four) {
                ControleFour::firstOrCreate(
                    [
                        'id_controle' => $controle->id,
                        'id_four'     => $four['id_four'],
                    ],
                    [
                        'required' => $four['required'],
                    ]
                );
            }

            return response()->json([
                'message'  => 'Contrôle créé et lié aux fours avec succès',
                'controle' => $controle,
            ], 201);
        } catch (\Throwable $e) {

            return response()->json([
                'message' => 'Erreur lors de la création du contrôle',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $controle = Controle::findOrFail($id);

        $validated = $request->validate([
            'libelle' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|string|max:50',
            'frequence' => 'sometimes|string|max:255',
            'ids_four'   => 'sometimes|array|min:1',
            'ids_four.*.id_four' => 'required|exists:fours,id_four',
            'ids_four.*.required' => 'sometimes|boolean',
        ]);

        try {

            $controle->update([
                'libelle'   => $validated['libelle'] ?? $controle->libelle,
                'type'      => $validated['type'],
                'frequence' => $validated['frequence'] ?? null,
            ]);


            if (isset($validated['ids_four'])) {

                $fourIds = collect($validated['ids_four'])->pluck('id_four');

                ControleFour::where('id_controle', $controle->id)
                    ->whereNotIn('id_four', $fourIds)
                    ->delete();

                foreach ($validated['ids_four'] as $four) {
                    ControleFour::updateOrCreate(
                        [
                            'id_controle' => $controle->id,
                            'id_four'     => $four['id_four'],
                        ],
                        [
                            'required' => $four['required'],
                        ]
                    );
                }
            }

            return response()->json([
                'message'  => 'Contrôle mis à jour avec succès',
                'controle' => $controle,
            ]);
        } catch (\Throwable $e) {

            return response()->json([
                'message' => 'Erreur lors de la mise à jour du contrôle',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    public function destroy($id)
    {
        $controle = Controle::findOrFail($id);

        $controle->delete();

        return response()->json(['message' => 'Contrôle supprimé avec succès']);
    }
    public function controlesAFaire()
    {
        $now = Carbon::now();

        $controles = Controle::with('controleFours.four')->get();

        $result = [];
        $frequencesDejaFaitesParFour = [];
        $grouped = [];

        foreach ($controles as $controle) {
            $cfAFaire = [];

            foreach ($controle->controleFours as $cf) {
                $fourId = $cf->id_four;

                $last = DetailControle::where('id_controle_four', $cf->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

                $dejaFait = false;

                if ($last) {
                    $date = Carbon::parse($last->created_at);

                    switch ($controle->frequence) {
                        case 'heure':
                            $dejaFait = $date->isSameSecond($now);
                            break;
                        case 'shift':
                            $dejaFait = $this->isSameShift($date, $now);
                            break;
                        case 'jour':
                            $dejaFait = $this->isSameIndustrialDay($date, $now);
                            break;
                        case 'semaine':
                            $dejaFait = $date->isSameWeek($now);
                            break;
                        case 'mois':
                            $dejaFait = $date->isSameMonth($now);
                            break;
                        case 'annee':
                            $dejaFait = $date->isSameYear($now);
                            break;
                    }
                }
                //Si cette fréquence pour ce four n'existe pas encore,alors je la crée avec total = 0 et done = 0.
                if (!isset($grouped[$fourId][$controle->frequence])) {
                    $grouped[$fourId][$controle->frequence] = [
                        'total' => 0,
                        'done' => 0
                    ];
                }

                $grouped[$fourId][$controle->frequence]['total']++;

                if ($dejaFait) {
                    $grouped[$fourId][$controle->frequence]['done']++;
                } else {
                    $cfAFaire[] = $cf;
                }
            }

            if (count($cfAFaire)) {
                $controleCopy = $controle->toArray();
                $controleCopy['controle_fours'] = $cfAFaire;
                $result[] = $controleCopy;
            }
        }
        foreach ($grouped as $fourId => $frequences) {
            foreach ($frequences as $freq => $counts) {

                if ($counts['done'] === $counts['total']) {
                    $frequencesDejaFaitesParFour[$fourId][] = $freq;
                }
            }
        }

        foreach ($frequencesDejaFaitesParFour as $fourId => $freqs) {
            $frequencesDejaFaitesParFour[$fourId] = array_values(array_unique($freqs));
        }

        return response()->json([
            'controles' => $result,
            'frequences_deja_faites_par_four' => $frequencesDejaFaitesParFour
        ]);
    }

    private function getShift(Carbon $date)
    {
        $hour = $date->hour;

        if ($hour >= 6 && $hour < 14) {
            return 1;
        }

        if ($hour >= 14 && $hour < 22) {
            return 2;
        }

        return 3;
    }
    private function isSameShift(Carbon $date1, Carbon $date2)
    {
        $shift1 = $this->getShift($date1);
        $shift2 = $this->getShift($date2);

        if ($shift1 === $shift2 && $shift1 !== 3) {
            return $date1->isSameDay($date2);
        }

        if ($shift1 === 3 && $shift2 === 3) {
            return $date1->diffInHours($date2) <= 8;
        }

        return false;
    }
    private function isSameIndustrialDay(Carbon $date1, Carbon $date2)
    {
        $shiftStartHour = 6;

        $start1 = $date1->copy()->setTime($shiftStartHour, 0, 0);
        $end1 = $start1->copy()->addDay();

        return $date2->between($start1, $end1);
    }

    public function getByFour(int $idFour)
    {
        $frequences = DB::table('controles as c')
            ->join('controle_four as cf', 'cf.id_controle', '=', 'c.id')
            ->where('cf.id_four', $idFour)
            ->whereNotNull('c.frequence')
            ->distinct()
            ->orderBy('c.frequence')
            ->pluck('c.frequence');

        $controles = DB::table('controles as c')
            ->join('controle_four as cf', 'cf.id_controle', '=', 'c.id')
            ->where('cf.id_four', $idFour)
            ->select('c.id', 'c.libelle')
            ->orderBy('c.libelle')
            ->get();

        return response()->json([
            'success' => true,
            'frequences' => $frequences,
            'controles' => $controles
        ]);
    }
}
