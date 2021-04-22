import { Observable } from 'rxjs';                        // On importe la bilbiothèque RxJS

export type Turn  = 'Player1' | 'Player2';                // Tour de jeu
export type C     = 'Empty' | Turn;                       // Contenu d'une case du plateau

export type L     = [C, C, C, C, C, C, C, C];             // Une ligne du plateau
export type Board = [L, L, L, L, L, L, L, L];             // Le plateau

export type R        = readonly [C, C, C, C, C, C, C, C]; // Une ligne immuable
export type Board_RO = readonly [R, R, R, R, R, R, R, R]; // Un plateau immuable

export type TileCoords = readonly [x: number, y: number]; // Une coordonnée
export type PlayImpact = readonly TileCoords[];           // Une liste de coordonnées

export interface GameState {                              // Un état de jeu 
    board: Board_RO;                                      // L'état du plateau
    turn: Turn;                                           // Le joueur pour qui c'est le tour de jouer
}

export interface ReversiModelInterface {                  // Le modèle du jeu Reversi, au sens MVP/MVC
    PionsTakenIfPlayAt(x: number, y: number): PlayImpact; // La liste des coordonnées des pions pris à l'adversaire
    play(i: number, j: number): void;                     // Joueur courant joue en <i, j>

    gameStateObs: Observable<GameState>;                  // Un observable de l'état courant du jeu
}
