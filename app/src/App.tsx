import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import {Navegacion} from "./Navegacion"
import React, {useReducer, useState, useSyncExternalStore} from "react"
import {Card, EMPTY_CARD, getCardFromString} from "./Card";
import {DealerDeck} from "./DealerDeck";
import DealerHand from "./DealerHand";
import PlayerHand from "./PlayerHand";
import PlayerInfo from "./PlayerInfo";

const minBet = 100

interface Game {
    address: string
    player: string
    status: string
    bet: number
    dealerCards: Card[]
    playerCards: Card[]
    mensajes: string[]
}

export const App = () => {

    function reset() {
        fetch("http://localhost:8080/new", {credentials: "include"})
            .then(res => res.json())
            .then((game: Game) => {
                console.log('Respuesta HTTP /new: ', game)
                setContractAddress(game.address)

                updateDealer1(EMPTY_CARD)
                updateDealer2(EMPTY_CARD)

                updatePlayer1(EMPTY_CARD)
                updatePlayer2(EMPTY_CARD)
                updatePlayer3(EMPTY_CARD)
                //TODO: updatePlayerMoney(res.bet.money)

                updateBetMoney(game.bet)
            });
    }

    async function iniciarJuego() {
        if (dealer2.number != 0 || player2.number != 0) {
            console.error("Estado Invalido")
            return
        }

        await fetch("http://localhost:8080/init", {
            method: "POST",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'ContractAddress': contractAddress
            },
            credentials: "include",
            body: JSON.stringify({"amount": 300})
        })
            .then(res => res.json())
            .then((game: Game) => {
                console.log('Respuesta HTTP /init: ', game)
                //TODO: updatePlayerMoney(res.player.money - minBet)
                //TODO: updateBetMoney(betMoney + minBet)
            });

        await fetch("http://localhost:8080/repartir", {
            method: "POST",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'ContractAddress': contractAddress
            },
            credentials: "include"
        })
            .then(res => res.json())
            .then((game: Game) => {
                console.log('Respuesta HTTP /repartir: ', game)
                updateDealer1(getCardFromString(game.dealerCards[0]))
                updatePlayer1(getCardFromString(game.playerCards[0]))
                updatePlayer2(getCardFromString(game.playerCards[1]))
                //TODO: updatePlayerMoney(res.player.money - minBet)
                //TODO: updateBetMoney(betMoney + minBet)
            });
    }

    function hit() {
        /*
        if (player2.num == 0) {
            updatePlayer2(getRandomCard())
            return
        }
        if (player3.num == 0) {
            updatePlayer3(getRandomCard())
            return;
        }
        if (player4.num == 0) {
            updatePlayer4(getRandomCard())
        }*/
    }

    function stand() {
        console.log("Stand!")
    }

    function double() {
        console.log("Double!")
    }

    function split() {
        console.log("Split!")
    }

    function surrender() {
        console.log("Surrender!")
    }

    const [dealer1, updateDealer1] = useReducer((state: Card, updates: Card) => ({...state, ...updates}), EMPTY_CARD)
    const [dealer2, updateDealer2] = useReducer((state: Card, updates: Card) => ({...state, ...updates}), EMPTY_CARD)
    const [player1, updatePlayer1] = useReducer((state: Card, updates: Card) => ({...state, ...updates}), EMPTY_CARD)
    const [player2, updatePlayer2] = useReducer((state: Card, updates: Card) => ({...state, ...updates}), EMPTY_CARD)
    const [player3, updatePlayer3] = useReducer((state: Card, updates: Card) => ({...state, ...updates}), EMPTY_CARD)
    const [player4, updatePlayer4] = useReducer((state: Card, updates: Card) => ({...state, ...updates}), EMPTY_CARD)
    const [dealerMoney, updateDealerMoney] = useState(10_000)
    const [playerMoney, updatePlayerMoney] = useState(1_000)
    const [betMoney, updateBetMoney] = useState(0)
    const [contractAddress, setContractAddress] = useState("")

    function getBoard() {

        return <div>
            <DealerDeck/>
            <DealerHand card1={dealer1.src} card2={dealer2.src}/>
            <PlayerHand card1={player1.src} card2={player2.src} card3={player3.src} card4={player4.src}/>
            <PlayerInfo money={playerMoney}/>
            <div>Dinero Apuesta: $ {betMoney}</div>

            <div>
                <button onClick={() => reset()}>Nuevo Juego</button>
            </div>
            <Row>
                <Col>
                    <button onClick={() => iniciarJuego()} disabled={player1.number != 0}>Iniciar</button>
                </Col>
            </Row><Row>
            <Col>
                <button onClick={() => hit()} disabled={player1.number == 0}>Hit</button>
                <button onClick={() => stand()} disabled={player1.number == 0}>Stand</button>
                <button onClick={() => double()} disabled={player1.number == 0}>Double</button>
                <button onClick={() => split()} disabled={player1.number == 0}>Split</button>
                <button onClick={() => surrender()} disabled={player1.number == 0}>Surrender</button>
            </Col>
        </Row>
        </div>
    }

    return (
        <Container fluid>
            <Row>
                <Col style={{background: "#EEEEEE"}}><Navegacion/></Col>
            </Row>
            <Row>
                <Col lg={2}></Col>
                <Col
                    style={{background: "#4aa37a"}}>{getBoard()}</Col>
                <Col lg={2}></Col>
            </Row>
        </Container>
    )
}
