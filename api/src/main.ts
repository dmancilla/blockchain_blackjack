import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import session from "express-session";
import {BigNumber, Contract, ethers} from "ethers";
import * as fs from "fs";

dotenv.config();

const providerUrl = process.env.LOCAL_URL !== '' ? process.env.LOCAL_URL : process.env.TESTNET_URL;

const app: Express = express();
app.use(express.json())

app.use(session({secret: 'keyboard cat'}));

app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, ContractAddress");
    next();
});


interface Game {
    address: string
    player: string
    status: string
    bet: number
    dealerCards: string[]
    playerCards: string[]
    mensajes: string[]
}

enum GameStatus {
    NUEVO,
    ESPERANDO_APUESTA,
    ESPERANDO_REPARTIR,
    ESPERANDO_JUGADOR_1,
    ESPERANDO_JUGADOR_N,
    FINALIZADO
}

enum CardSuit {
    S, H, C, D
}

function getFactory() {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const fileContent = fs.readFileSync("../blockchain/artifacts/contracts/BlackjackGame.sol/BlackjackGame.json", {encoding: 'utf-8'})
    const factory = ethers.ContractFactory.fromSolidity(fileContent, wallet);
    return {wallet, factory};
}

function getCards(nombre: string, cards: any) {
    for (const card of cards) {
        console.log(nombre + ' Card: ', card)
    }
    return cards.map((c: any) => ({suit: CardSuit[BigNumber.from(c.suit).toNumber()], number: BigNumber.from(c.number).toNumber()}))
}

async function getNewGameStatus(contract: Contract, contractAddress: string) {
    const gameFullStatus = await contract.getStatus();
    console.log('GameFullStatus:', gameFullStatus);
    const mensajes = await contract.queryFilter({topics: []});

    const newGame: Game = {
        address: contractAddress,
        player: gameFullStatus.player,
        status: GameStatus[gameFullStatus.status],
        bet: parseInt(gameFullStatus.bet._hex, 16),
        dealerCards: getCards('Dealer', gameFullStatus.dealerCards),
        playerCards: getCards('Player', gameFullStatus.playerCards),
        mensajes: mensajes.map(m => m.args?.text)
    };
    console.log('New Game: ', newGame);
    return newGame;
}

app.get("/new", async (req: Request, res: Response) => {
    const {wallet, factory} = getFactory();
    const contract = await factory.deploy();
    const deployedContract = await contract.deployTransaction.wait();
    const iniciado = await contract.iniciar(wallet.address);
    console.log('Iniciado: ', iniciado);
    const newGame = await getNewGameStatus(contract, deployedContract.contractAddress);

    // @ts-ignore
    req.session.game = newGame;
    res.json(newGame);
})

function getAttachedContract(contractAddress: string) {
    const {factory} = getFactory();
    return factory.attach(contractAddress);
}

app.post("/init", async (req: Request, res: Response) => {
    console.log('Full Body: ', req.body)
    const amount = parseInt(req.body.amount, 10);
    if (isNaN(amount)) {
        res.send("Amount no es numero")
        return;
    }
    const contractAddress: string = req.header("ContractAddress") || "";
    const contract = getAttachedContract(contractAddress);
    const apostar = await contract.apostar(amount);
    console.log('Apostar: ', apostar);
    const newGame = await getNewGameStatus(contract, contractAddress);

    // @ts-ignore
    req.session.game = newGame;
    res.json(newGame);
})

app.post("/repartir", async (req: Request, res: Response) => {
    const contractAddress: string = req.header("ContractAddress") || "";
    const contract = getAttachedContract(contractAddress);
    const repartir = await contract.repartir();
    console.log('Repartir: ', repartir);
    const newGame = await getNewGameStatus(contract, contractAddress);

    // @ts-ignore
    req.session.game = newGame;
    res.json(newGame);
})

app.listen(process.env.PORT, () => {
    console.log(`[server]: API Server is running at http://localhost:${(process.env.PORT)}`);
});
