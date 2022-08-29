import {expect} from "chai"
import {ethers} from "hardhat"
import {BlackjackGame} from "../typechain-types"
import {ContractReceipt, Event} from "ethers";
import {Result} from "@ethersproject/abi";

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

describe("Blackjack Game", function () {
    let contract: any
    let blackjackGame: BlackjackGame

    beforeEach(async function () {
        contract = await ethers.getContractFactory("BlackjackGame")
        blackjackGame = await contract.deploy()
    });

    describe("Blackjack Tests", function () {
        it("Debe finalizar correctamente", async function () {
            const [owner] = await ethers.getSigners()

            let iniciarTransaction = await blackjackGame.iniciar(owner.address);
            let iniciarReceipt = await iniciarTransaction.wait();
            let iniciarText = getSingleEventText(iniciarReceipt);
            expect(iniciarText).to.be.equals('Juego iniciado')

            let apostarTransaction = await blackjackGame.apostar(100);
            let apostarReceipt = await apostarTransaction.wait()
            let apostarText = getSingleEventText(apostarReceipt)
            expect(apostarText).to.be.equals('Apuesta de 100 chips iniciada')

            let repartirTransaccion = await blackjackGame.repartir();
            let repartirReceipt = await repartirTransaccion.wait();
            let eventos = getMultipleEventsText(repartirReceipt);
            expect(eventos.length).to.be.equals(3)
            for (let evento of eventos) {
                console.log("Evento: " + evento);
            }

            let status = await blackjackGame.gameStatus();
            expect(status).to.be.equals("Esperando Jugador")
        });

        it("Debe fallar por chips invalidos", async function () {
            const [owner] = await ethers.getSigners()

            let iniciarTransaction = await blackjackGame.iniciar(owner.address);
            let iniciarReceipt = await iniciarTransaction.wait();
            let iniciarText = getSingleEventText(iniciarReceipt);
            expect(iniciarText).to.be.equals('Juego iniciado')

            try {
                await blackjackGame.apostar(101);
                expect.fail('Deberia fallar la transaccion')
            } catch ({message}) {
                expect(message).to.contain('Cantidad de chips invalida')
            }
        });
    });

    describe("Pruebas de Puntajes", function () {

        it("Debe devolver puntaje 4 (2 cartas)", async function () {
            let cards = [{suit: 1, number: 2}, {suit: 2, number: 2}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).to.be.equal(4);
        });

        it("Debe devolver puntaje 20 (1 carta, 1 as)", async function () {
            let cards = [{suit: 1, number: 9}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).to.be.equal(20);
        });

        it("Debe devolver puntaje 21 (2 cartas, 1 as)", async function () {
            let cards = [{suit: 1, number: 12}, {suit: 2, number: 13}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).to.be.equal(21);
        });

        it("Debe devolver 21 (2 cartas, 2 aces)", async function () {
            let cards = [{suit: 1, number: 4}, {suit: 2, number: 5}, {suit: 2, number: 1}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).to.be.equal(21);
        });

        it("Debe devolver Blackjack", async function () {
            let cards = [{suit: 1, number: 12}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).to.be.equal(21);
        });

        it("Debe devolver 22", async function () {
            let cards = [{suit: 1, number: 12}, {suit: 2, number: 13}, {suit: 2, number: 1}, {suit: 2, number: 1}];
            let puntaje = (await blackjackGame.callStatic.getPuntaje(cards)).toNumber();
            expect(puntaje).to.be.equal(22);
        });

    });
});
