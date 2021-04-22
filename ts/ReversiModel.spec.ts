import { Board, Board_RO, C, L, R, TileCoords, Turn } from "./ReversiDefinitions";
import { ReversiModel } from "./ReversiModel";

function cToString(c: C): string {
	switch(c) {
		case 'Empty':   return ".";
		case 'Player1': return "X";
		case 'Player2': return "O";
	}
}
function LtoString(L: R): string {
	return L.reduce((acc, c, i) => `${i}${acc}${cToString(c)}`, '');
}
function BoardtoString(b: Board_RO): string {
	return b.map( LtoString ).join("\n");
}

class RM_test extends ReversiModel {
    
    constructor(conf?: string, turn?: 'O' | 'X') {
        super();
        if (conf) {
            this.setState(turn === 'X' ? 'Player1' : 'Player2', RM_test.stringToBoard(conf) );
        }
    }

    setState(t: Turn, b: Board): void {
        this.currentTurn = t;
        this.board = b;
        this.gameStateSubj.next( {turn: t, board: b} );
    }

    getBoard(): Board_RO {
        return this.board;
    }
    getTurn(): Turn {
        return this.currentTurn;
    }

    whereCanPlay(): TileCoords[] {
        const LC: TileCoords[] = [];
        this.board.forEach( (L, i) => L.forEach( (c, j) => {
            if (this.PionsTakenIfPlayAt(i, j).length > 0) {
                LC.push([i,j])
            }
        }));
        return LC;
    }

    static chatToC(c: string): C {
        return c === '.' ? 'Empty' : RM_test.charToTurn(c);
    }

    static charToTurn(c: string): Turn {
        return c === 'X' ? 'Player1' : 'Player2';
    }

    static stringToBoard(str: string): Board {
        return str.trim().split("\n").map(
            s => s.trim().split('').map( RM_test.chatToC ) as L
        ) as Board;
    }

    toString(): string {
        let str = `${BoardtoString(this.board)}
-> ${this.currentTurn} (${this.currentTurn === "Player1" ? 'X' : 'O'})
Coups possibles calculés: [
`;
        this.board.forEach( (L, i) => L.forEach( (c, j) => {
            if (this.PionsTakenIfPlayAt(i, j).length > 0) {
                str += `  [${i},${j}],\n`;
            }
        }));
        return str + ']';
    }
}

function initEmpty(): Board {
    return new Array(8).fill(0).map( l => new Array<C>(8).fill('Empty') ) as Board;
}

function placeToken(b: Board, p1: TileCoords[] = [], p2: TileCoords[] = []): Board {
    p1.forEach( ([x, y]) => b[x][y] = 'Player1' );
    p2.forEach( ([x, y]) => b[x][y] = 'Player2' );
    return b;
}

function differencesBoards(bok: Board_RO, b: Board_RO): TileCoords[] {
    const L: TileCoords[] = [];
    bok.forEach( (l, i) => l.forEach( (c, j) => {
        if (c !== b?.[i]?.[j]) {
            L.push( [i, j] );
        }
    } ) );
    return L;
}

/*
 * Tests sur le model de Reversi
 */
describe("Instanciation d'un ReversiModel", () => {
    it("L'attribut board devrait avoir une valeur initiale correcte.", () => {
        const M = new RM_test();
        const B = M.getBoard();
        expect(B).withContext("L'attribut board devrait être initialisé, or il est undefined").toBeDefined();
        if (B) {
            expect(B.length).withContext("Le plateau devrait contenir 8 lignes").toEqual(8);
            B.forEach(
                (l, i) => expect(l.length).withContext(`La ligne ${i} devrait contenir 8 colonne`).toEqual(8)
            );
            const BOK: Board_RO = placeToken( initEmpty(), [[3,4], [4,3]], [[3,3], [4,4]] );
            const L = differencesBoards(BOK, B);
            L.forEach( ([i, j]) => {
                expect(false).withContext(`[${i},${j}] devrait valoir ${BOK[i][j]} au lieu de ${B[i]?.[j]}`).toEqual( true );
            });
        }
        
    });

    it("gameStateObs devrait être définit", () => {
        const M = new ReversiModel();
        expect(M.gameStateObs).toBeDefined();
    });

    it("On devrait pouvoir s'abonner à gameStateObs et recevoir une valeur", (done) => {
        const M = new ReversiModel();
        if (M.gameStateObs) {
            M.gameStateObs.subscribe( v => {expect(v).toBeDefined(); done();} );
        } else {
            expect("gameStateObs devrait être définit").toBe("true");
            done();
        }
    });

    it("La valeur initiale devrait être correcte", (done) => {
        const M = new RM_test();
        if (M.gameStateObs) {
            M.gameStateObs.subscribe( v => {
                expect(v).toBeDefined();
                expect(v.board).toBe(M.getBoard());

                // Compare with correct version
                expect(v.turn).toEqual('Player1');

                const B: Board_RO = placeToken( initEmpty(), [[3,4], [4,3]], [[3,3], [4,4]]);
                const L = differencesBoards(v.board, B);
                L.forEach( ([i, j]) => {
                    expect(false).withContext(`[${i},${j}] devrait valoir ${B[i][j]} au lieu de ${v.board[i][j]}`).toEqual( true );
                });
                done();
            } );
        } else {
            expect("gameStateObs devrait être définit").toBe("true");
            done();
        }
    });

});

describe("Vérifier que ReversiModel implémente bien les règles", () => {
    it("On teste les possibilités de jeu initiale (devrait être <2,4>, <3,5>, <4,2> et <5,3>)", done => {
        const M = new RM_test();
        M.setState('Player1', placeToken( initEmpty(), [[3,4], [4,3]], [[3,3], [4,4]]) );
        M.gameStateObs.subscribe( v => {
            const L = M.whereCanPlay();
            expect(L.length).withContext(`Il devrait y avoir 4 coups possibles et pas ${L.length} ${JSON.stringify(L)}`).toEqual(4);
            expect(L.find( c => c[0] === 2 && c[1] === 3)).withContext("[2,3] devrait faire parti de la liste des coups possibles").toBeDefined();
            expect(L.find( c => c[0] === 3 && c[1] === 2)).withContext("[3,2] devrait faire parti de la liste des coups possibles").toBeDefined();
            expect(L.find( c => c[0] === 4 && c[1] === 5)).withContext("[4,5] devrait faire parti de la liste des coups possibles").toBeDefined();
            expect(L.find( c => c[0] === 5 && c[1] === 4)).withContext("[5,4] devrait faire parti de la liste des coups possibles").toBeDefined();
            done();
        });
    });

    it(`On teste une situation S1 (voir console)`, done => {
        const M = new RM_test( `........
                                ........
                                ....XXX.
                                X..XO...
                                .XOOOO..
                                ..X.O...
                                .X.O....
                                ........`, 'O');
        console.log(`------ Situation S1:\n${M.toString()}`);
        M.gameStateObs.subscribe( v => {
            const L = M.whereCanPlay();
            expect(L.length).withContext(`Il devrait y avoir 9 coups possibles et pas ${L.length}`).toEqual(9);
            const LOK = [ [1,4], [1,5], [1,6], [2,2], [2,3], [3,2], [4,0], [6,2], [7,0] ];
            LOK.forEach( ([x,y]) => {
                expect(L.find( c => c[0] === x && c[1] === y)).withContext(`[${x},${y}] devrait faire parti de la liste des coups possibles`).toBeDefined();
            });
            L.forEach( ([x,y]) => {
                expect(LOK.find( c => c[0] === x && c[1] === y)).withContext(`[${x},${y}] ne devrait PAS faire parti de la liste des coups possibles`).toBeDefined();
            });
            done();
        });
    });

    it(`On teste une situation S2 (voir console)`, done => {
        const M = new RM_test( `.O...O..
                                .O..O...
                                .O.O....
                                OOO.....
                                OXOOOOOO
                                OOO.O...
                                .O.O....
                                .O..O...`, 'X');
        console.log(`------ Situation S2:\n${M.toString()}`);
        M.gameStateObs.subscribe( v => {
            const L = M.whereCanPlay();
            expect(L.length).withContext(`Il devrait y avoir 0 coups possibles et pas ${L.length}`).toEqual(0);
            done();
        });
    });

    it(`On teste une situation S3 (voir console)`, done => {
        const M = new RM_test( `........
                                ...X..X.
                                .X.X.X..
                                ..XXX...
                                .XXOXXX.
                                ..XXX...
                                .X.X.X..
                                ........`, 'O');
        console.log(`------ Situation S3:\n${M.toString()}`);
        M.gameStateObs.subscribe( v => {
            const L = M.whereCanPlay();
            expect(L.length).withContext(`Il devrait y avoir 8 coups possibles et pas ${L.length}`).toEqual(8);
            const LOK = [ [0,3], [0,7], [1,0], [4,0], [4,7], [7,0], [7,3], [7,6] ];
            LOK.forEach( ([x,y]) => {
                expect(L.find( c => c[0] === x && c[1] === y)).withContext(`[${x},${y}] devrait faire parti de la liste des coups possibles`).toBeDefined();
            });
            L.forEach( ([x,y]) => {
                expect(LOK.find( c => c[0] === x && c[1] === y)).withContext(`[${x},${y}] ne devrait PAS faire parti de la liste des coups possibles`).toBeDefined();
            });
            done();
        });
    });

    it(`On teste une situation S3 (voir console)`, done => {
        const M = new RM_test( `........
                                ........
                                ........
                                ........
                                ..OXXX..
                                ........
                                ........
                                ........`, 'O');
        console.log(`------ Situation S3:\n${M.toString()}`);
        M.gameStateObs.subscribe( v => {
            const L = M.whereCanPlay();
            expect(L.length).withContext(`Il devrait y avoir 1 coups possibles et pas ${L.length}`).toEqual(1);
            const LOK = [ [4,6] ];
            LOK.forEach( ([x,y]) => {
                expect(L.find( c => c[0] === x && c[1] === y)).withContext(`[${x},${y}] devrait faire parti de la liste des coups possibles`).toBeDefined();
            });
            L.forEach( ([x,y]) => {
                expect(LOK.find( c => c[0] === x && c[1] === y)).withContext(`[${x},${y}] ne devrait PAS faire parti de la liste des coups possibles`).toBeDefined();
            });
            done();
        });
    });

    it('On teste une partie P1 (voir console)', done => {
        const P1: Board[] = [
           `........
            ........
            ........
            ........
            ..OXXX.X
            ........
            ........
            ........`, `........
                        ........
                        ........
                        ........
                        ..OOOOOX
                        ........
                        ........
                        ........`,
           `........
            ........
            ........
            ........
            .XXXXXXX
            ........
            ........
            ........`
        ].map<Board>( RM_test.stringToBoard );
        const M = new RM_test();
        M.setState('Player2', P1[0]);

        let nbUpdate = 0;
        M.gameStateObs.subscribe( () => nbUpdate++ );

        console.log( `---------- P1, step 0:\n${M.toString()}`);
        M.play(4,6);
        console.log( `---------- P1, step 1, after O plays at [4,6]:\n${M.toString()}`);
        expect(M.getTurn()).withContext("After O playing at [4,6], now it is X turn").toEqual('Player1');
        expect(differencesBoards(M.getBoard(), P1[1]).length).withContext(`step 1 : Board should be in another state`).toEqual(0);
        M.play(4,1);
        console.log( `---------- P1, step 2, afer X plays at [4,1]:\n${M.toString()}`);
        expect(differencesBoards(M.getBoard(), P1[2]).length).withContext(`step 2 : Board should be in another state`).toEqual(0);
        expect(M.getTurn()).withContext("After X playing at [4,1], it is still X turn cause O cannot play").toEqual('Player1');
        expect(M.whereCanPlay().length).withContext("End of game, X should not be able to play").toEqual(0);

        expect(nbUpdate).withContext(`Le modèle aurait dû nous notifier 3 fois (1 pour l'initialisation + 2 coups joués). Or nous avons été notifié ${nbUpdate} fois.`).toEqual(3);
        done();
    });
});
