import {ReversiModel} from "./ReversiModel";
import {ReversiPresenter} from "./ReversiPresenter";
import {C, Board, Board_RO, R} from "./ReversiDefinitions";


// ____________________________ Init ____________________________
const m = new ReversiModel();
const p1 = new ReversiPresenter(document.querySelector("div.R1") as HTMLElement, m);
const p2 = new ReversiPresenter(document.querySelector("div.R2") as HTMLElement, m);

// ____________________________ Debugger ________________________
function cToString(c: C): string {
	switch(c) {
		case 'Empty':   return ".";
		case 'Player1': return "X";
		case 'Player2': return "O";
	}
}
function LtoString(L: R): string {
	return L.reduce((acc, c) => `${acc}${cToString(c)}`, '');
}
function BoardtoString(b: Board_RO): string {
	return b.map( LtoString ).join("\n");
}

m.gameStateObs?.subscribe( ({turn, board}) => {
	console.log( "_______________________" );
	console.log( BoardtoString(board) );
	console.log( "Player", cToString(turn), "can play at:" );
	board.forEach( (L, i) => L.forEach( (c, j) => {
		if (m.PionsTakenIfPlayAt(i, j).length > 0) {
			console.log("  *", i, ",", j)
		}
	}));
} );

// @ts-ignore
Window['debugReversi'] = m;
