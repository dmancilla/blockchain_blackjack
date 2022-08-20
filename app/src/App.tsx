import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import {Navegacion} from "./Navegacion"
import React, {useReducer, useState} from "react"
import {Card, EMPTY_CARD, getRandomCard} from "./Card";
import {DealerDeck} from "./DealerDeck";
import DealerHand from "./DealerHand";
import PlayerHand from "./PlayerHand";
import PlayerInfo from "./PlayerInfo";

const minBet = 100

export const App = () => {

    function reset() {
        updateDealer1(EMPTY_CARD)
        updateDealer2(EMPTY_CARD)
        updateDealerMoney(10_000)

        updatePlayer1(EMPTY_CARD)
        updatePlayer2(EMPTY_CARD)
        updatePlayer3(EMPTY_CARD)
        updatePlayerMoney(1_000)

        updateBetMoney(0)
    }

    function iniciarJuego() {
        if (dealer2.num != 0 || player2.num != 0) {
            console.error("Estado Invalido")
            return
        }
        updateDealer1(getRandomCard())
        updatePlayer1(getRandomCard())
        updatePlayer2(getRandomCard())
        updatePlayerMoney(playerMoney - minBet)
        updateBetMoney(betMoney + minBet)
    }

    function hit() {
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
        }
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
                    <button onClick={() => iniciarJuego()} disabled={player1.num != 0}>Iniciar</button>
                </Col>
            </Row><Row>
            <Col>
                <button onClick={() => hit()} disabled={player1.num == 0}>Hit</button>
                <button onClick={() => stand()} disabled={player1.num == 0}>Stand</button>
                <button onClick={() => double()} disabled={player1.num == 0}>Double</button>
                <button onClick={() => split()} disabled={player1.num == 0}>Split</button>
                <button onClick={() => surrender()} disabled={player1.num == 0}>Surrender</button>
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
