import {expect} from "chai"
import {ethers} from "hardhat"
import {BlackjackGame} from "../typechain-types"
import {ContractReceipt, Event} from "ethers";
import {Result} from "@ethersproject/abi";
import dotenv from "dotenv";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

dotenv.config();

const chai = require('chai');
chai.use(require('chai-string'))


function getSingleEventText(receipt: ContractReceipt) {
    const events = receipt.events;
    const event = events?.at(0) as Event;
    const args = event.args as Result;
    return args[0];
}

function getMultipleEventsText(receipt: ContractReceipt) {
    let eventsText = []
    const events = receipt.events as Event[];
    for (let event of events) {
        const args = event.args as Result;
        for (let arg of args) {
            eventsText.push(arg)
        }
    }
    return eventsText;
}

async function getBalance(signer: SignerWithAddress) {
    return await ethers.provider.getBalance(signer.address);
}

describe("Blackjack Game", function () {
    let contract: any
    let validOwnerSigner: SignerWithAddress;
    let validPlayerSigner: SignerWithAddress;

    let blackjackGame: BlackjackGame

    beforeEach(async function () {
        let signers = await ethers.getSigners();
        validOwnerSigner = (signers.filter(s => s.address == process.env.ADDRESS))[0];
        validPlayerSigner = (signers.filter(s => s.address == process.env.PLAYER_ADDRESS))[0];

        contract = await ethers.getContractFactory("BlackjackGame", validOwnerSigner)
        blackjackGame = await contract.deploy()
        console.log("Contract Signer: ", await blackjackGame.signer.getAddress());
    });

    describe("Blackjack Tests", function () {
        it("Debe finalizar correctamente", async function () {
            let balancePlayer = await getBalance(validPlayerSigner);
            let balanceCasino = await getBalance(validOwnerSigner);

            let iniciarTransaction = await blackjackGame.iniciar(validPlayerSigner.address);
            expect(balancePlayer).eq(await getBalance(validPlayerSigner));


            let iniciarReceipt = await iniciarTransaction.wait();
            let iniciarText = getSingleEventText(iniciarReceipt);
            expect(iniciarText).eq('Juego iniciado')
            expect(balancePlayer).eq(await getBalance(validPlayerSigner));

            let apostarTransaction = await blackjackGame.apostar({value: 200});
            let apostarReceipt = await apostarTransaction.wait()
            let apostarText = getSingleEventText(apostarReceipt)
            expect(apostarText).equalIgnoreCase('Recepcion OK de 200 chips del jugador ' + validPlayerSigner.address)
            expect(balancePlayer).eq(await getBalance(validPlayerSigner));

            let repartirTransaccion = await blackjackGame.repartir({value: 200});
            let repartirReceipt = await repartirTransaccion.wait();
            let eventos = getMultipleEventsText(repartirReceipt);
            for (let evento of eventos) {
                console.log('Evento: ', evento);
            }

            let balancePlayer2 = await getBalance(validPlayerSigner);
            let balancePlayer2Dif = balancePlayer2.sub(balancePlayer);
            expect(balancePlayer2Dif.toNumber()).eq(+200);

            expect(eventos.length).equals(4)
            for (let evento of eventos) {
                console.log("Evento: " + evento);
            }

            let status = await blackjackGame.gameStatus();
            expect(status).equals("Esperando Jugador")
        });

        it("Debe fallar por chips invalidos", async function () {
            let iniciarTransaction = await blackjackGame.iniciar(validPlayerSigner.address);
            let iniciarReceipt = await iniciarTransaction.wait();
            let iniciarText = getSingleEventText(iniciarReceipt);
            expect(iniciarText).equals('Juego iniciado')

            try {
                await blackjackGame.apostar({value: 101});
            } catch ({message}) {
                expect(message).to.contain('Cantidad de chips invalida')
            }
        });
    });

    describe("Pruebas de Puntajes", function () {

        it("Debe devolver puntaje 4 (2 cartas)", async function () {
            let cards = [{suit: 1, number: 2}, {suit: 2, number: 2}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).equals(4);
        });

        it("Debe devolver puntaje 20 (1 carta, 1 as)", async function () {
            let cards = [{suit: 1, number: 9}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).equals(20);
        });

        it("Debe devolver puntaje 21 (2 cartas, 1 as)", async function () {
            let cards = [{suit: 1, number: 12}, {suit: 2, number: 13}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).equals(21);
        });

        it("Debe devolver 21 (2 cartas, 2 aces)", async function () {
            let cards = [{suit: 1, number: 4}, {suit: 2, number: 5}, {suit: 2, number: 1}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).equals(21);
        });

        it("Debe devolver Blackjack", async function () {
            let cards = [{suit: 1, number: 12}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).equals(21);
        });

        it("Debe devolver 22", async function () {
            let cards = [{suit: 1, number: 12}, {suit: 2, number: 13}, {suit: 2, number: 1}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).equals(22);
        });

    });
});
