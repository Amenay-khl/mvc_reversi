import { fromEvent } from 'rxjs';
import {GameState, ReversiModelInterface} from './ReversiDefinitions';

const reversiView = `
    <table class="reversi">
        <tbody></tbody>
    </table>
`;

export class ReversiPresenter {
    tds: HTMLElement[][] = [];

    constructor(private root: HTMLElement, private model: ReversiModelInterface) {
        root.innerHTML = reversiView;
        this.initBoard();
        // Traduire le Modèle vers la Vue
        model.gameStateObs.subscribe( gs => this.updatePresentation(gs) );
    }

    updatePresentation({board, turn}: GameState) {
        // à compléter
        // Les cases (balises td) contenant un pion du joueur 1 ont la classe CSS Player1 (voir le CSS)
        // Les cases (balises td) contenant un pion du joueur 2 ont la classe CSS Player2 (voir le CSS)
        // Les cases sur lesquelles le joueur courant peut poser un pion ont la classe CSS canPlayHere
        for(let i=0; i<8; i++) {​​
            for(let j=0; j<8; j++) {​​
                this.tds[i][j].className = board[i][j];
                 if (this.model.PionsTakenIfPlayAt(i, j).length > 0) {
                    this.tds[i][j].classList.add('canPlayHere');
                 }
            }​​
        }​​
    }

    private initBoard() {
        // à compléter
        // Remplir le tableau avec 8x8 cases contenant chacune une balise div
        // Utiliser la fonction document.createElement
        // Stockez les balises td dans l'attribut tds de l'objet => ça vous facilitera la vie plus tard
        const tbody = this.root.querySelector('tbody') as HTMLTableSectionElement;
        for (let i=0; i<8; i++) {
            const L: HTMLElement[] = [];
            const tr = document.createElement("tr");
            tbody.appendChild(tr);
            for(let j=0; j<8; j++) {
                const td = document.createElement("td");
                tr.appendChild(td);
                L.push(td);
                td.appendChild( document.createElement("div") );
                td.onclick = () => this.model.play(i, j);
            }
            this.tds.push(L);
        }

        /*  OU
        const V = Array(8).fill(0);
        tbody.innerHTML = V.map( () => `<tr>  ${V.map( () => '<td><div></div></td>').join('')}  </tr> `).join('');

        // Récupérer les balises td dans tds
        this.tds = Array.from( tbody.querySelectorAll('tr') ).map( (tr, i) => {
                const tab = Array.from( tr.querySelectorAll('td') );
                tab.forEach( (td, j) => td.onclick = () => this.model.play(i, j) );
                return tab;
            }
        );*/
    }​​

}
