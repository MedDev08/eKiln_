<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => User::all()->map(function ($user) {
                return [
                    'id' => $user->id_user,
                    'Matricule' => $user->matricule,
                    'Nom' => $user->nom,
                    'Prenom' => $user->prenom,
                    'Role' => $user->role,
                    'is_active' => $user->is_active
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricule' => 'required|unique:users',
            'nom' => 'required',
            'prenom' => 'required',
            'role' => 'required|in:admin,chef d\'equipe,enfourneur,trieur,jeune four,manager,cuiseur',
            'password' => 'nullable|string|min:4'
        ]);

        $user = new User($validated);
        $user->password = Hash::make($request->password);
        $user->is_active = true; // Tous les utilisateurs sont actifs par défaut
        $user->save();

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $user->update($request->only(['nom', 'prenom', 'role', 'matricule']));

        if ($request->has('password') && $request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé'
        ]);
    }

    public function toggleActive($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Statut utilisateur mis à jour',
            'is_active' => $user->is_active
        ]);
    }
    public function getActiveEnfourneurs()
    {
        $enfourneurs = User::where('role', 'enfourneur')
            ->orderBy('created_at', 'desc')
            ->get(['id_user', 'matricule', 'nom', 'prenom', 'is_active']);

        return response()->json($enfourneurs);
    }

    public function getActiveTrieurs()
    {
        return User::with(['polyvalences.famille:id_famille,nom_famille'])
            ->where('role', 'trieur')
            ->orderBy('created_at', 'desc') // Ajouté pour trier par date de création décroissante
            ->get(['id_user', 'matricule', 'nom', 'prenom', 'is_active']);
    }

    public function getTrieursWithPolyvalences()
    {
        return User::with(['polyvalences.famille'])
            ->where('role', 'trieur')
            ->where('is_active', true)
            ->get(['id_user', 'matricule', 'nom', 'prenom']);
    }
    public function getTrieursPolyvalents($id_famille)
    {

        $trieurs = User::where('role', 'trieur')
            ->where('is_active', true)
            ->whereHas('polyvalences', function ($query) use ($id_famille) {
                $query->where('id_famille', $id_famille);
            })
            ->get(['id_user', 'matricule', 'nom', 'prenom']);

        return response()->json($trieurs);
    }

    public function countActiveTrieurs()
    {
        $count = User::where('role', 'trieur')
            ->where('is_active', true)
            ->count();

        return response()->json(['count' => $count]);
    }
    //public function index1()
    //{
    //  return response()->json([
    //    'success' => true,
    //  'data' => User::all()->map(function($user) {
    //    return [
    //      'id' => $user->id_user,
    //    'Matricule' => $user->matricule,
    //  'Nom' => $user->nom,
    //'Prenom' => $user->prenom,
    //'Role' => $user->role,
    //'is_active' => $user->is_active
    //];
    //})
    //]);
    //}

    public function show($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'Matricule' => $user->matricule,
                'Nom' => $user->nom,
                'Prenom' => $user->prenom,
                'Role' => $user->role
            ]
        ]);
    }
    // public function getActiveJeunesFour()
    // {
    //     $jeunesFour = User::where('role', 'jeune four')
    //         ->orderBy('created_at', 'desc')
    //         ->get(['id_user', 'matricule', 'nom', 'prenom', 'is_active']);

    //     return response()->json($jeunesFour);
    // }

    // Les autres méthodes (store, update, destroy) peuvent rester telles quelles

}
