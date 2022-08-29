import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";

import session from "express-session";
import {getRandomCard} from "./Card";

dotenv.config();
const app: Express = express();

app.use(session({
        secret: 'keyboard cat'
    }
));

app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

interface GameStatus {
    dealer: {
        cards: string[]
        money: number
    }
    player: {
        cards: string[]
        money: number
    }
}


class Game {
    private dMoney: number;
    private dCards: string[];

    private playerMoney: number;
    private playerCards: string[];

    constructor(dMoney: number, dCards: string[], playerMoney: number, playerCards: string[]) {
        this.dMoney = dMoney;
        this.dCards = dCards;
        this.playerMoney = playerMoney;
        this.playerCards = playerCards;
    }

    stateInit() {
        this.dCards.push(getRandomCard())
        this.playerCards.push(getRandomCard());
        this.playerCards.push(getRandomCard());
    }

    getStatus(): GameStatus {
        return {
            dealer: {
                money: this.dMoney,
                cards: this.dCards
            },
            player: {
                money: this.playerMoney,
                cards: this.playerCards
            },
        }
    }
}

app.get("/new", async (req: Request, res: Response) => {
    const game = new Game(10_000, [], 1_000, []);
    // @ts-ignore
    req.session.game = game;

    res.json(game.getStatus());
})

app.get("/init", async (req: Request, res: Response) => {
    // @ts-ignore
    const g = req.session.game;

    const game = new Game(g.dMoney, g.dCards, g.playerMoney, g.playerCards);
    console.log('Parsed Game : ' + JSON.stringify(game.getStatus()));

    game.stateInit();
    console.log('New Game    : ' + JSON.stringify(game.getStatus()));

    // @ts-ignore
    req.session.game = game;
    res.json(game.getStatus());
})

/*
import {getContract} from "./contract";
const contract = getContract();
app.get("/", async (req: Request, res: Response) => {
    const response = await contract.sayHelloWorld();
    res.json({message: response});
});
*/

app.listen(process.env.PORT, () => {
    console.log(`[server]: API Server is running at http://localhost:${(process.env.PORT)}`);
});
