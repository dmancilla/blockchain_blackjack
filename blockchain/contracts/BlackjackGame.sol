// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/Strings.sol";

contract BlackjackGame {
    uint randNonce = 0;

    enum GameStatus {
        NUEVO,
        ESPERANDO_APUESTA,
        ESPERANDO_REPARTIR,
        ESPERANDO_JUGADOR_1,
        ESPERANDO_JUGADOR_N,
        FINALIZADO
    }

    event Chat(string text);

    error EstadoInvalido(string text);

    struct Card {
        uint suit;
        uint number;
    }

    struct Game {
        address player;
        GameStatus status;
        uint bet;
        Card[] dealerCards;
        Card[] playerCards;
    }

    Game public _game;

    constructor() {
        _game.status = GameStatus.NUEVO;
        _game.bet = 0;
    }

    function iniciar(address player) public {
        require(_game.status == GameStatus.NUEVO);
        _game.player = player;
        _game.status = GameStatus.ESPERANDO_APUESTA;
        emit Chat('Juego iniciado');
    }

    function apostar(uint chips) public {
        require(_game.status == GameStatus.ESPERANDO_APUESTA);
        if (chips % 100 != 0) {
            revert EstadoInvalido('Cantidad de chips invalida');
        }
        casinoRecibeChips(chips);
        _game.bet = chips;
        _game.status = GameStatus.ESPERANDO_REPARTIR;
        emit Chat(string.concat('Apuesta de ', Strings.toString(chips), ' chips iniciada'));
    }

    function repartir() public {
        require(_game.status == GameStatus.ESPERANDO_REPARTIR);

        Card memory dealerCard1 = getRandomCard();
        _game.dealerCards.push(dealerCard1);

        Card memory playerCard1 = getRandomCard();
        _game.playerCards.push(playerCard1);

        Card memory playerCard2 = getRandomCard();
        _game.playerCards.push(playerCard1);


        emit Chat(string.concat('Se reparte ', getCardText(dealerCard1), ' al dealer'));
        emit Chat(string.concat('Se reparte ', getCardText(playerCard1), ' al jugador'));
        emit Chat(string.concat('Se reparte ', getCardText(playerCard2), ' al jugador'));

        //if blackjack
        _game.status = GameStatus.ESPERANDO_JUGADOR_1;
        calcularJuego();
    }

    //Las propias reglas del blackjack obligan al crupier a pedir carta si tiene menos de 16 puntos y plantarse si cuenta con entre 17 y 21 puntos
    //Si la banca no logra el blackjack, se paga 3 a 2 (2.5 unidades por cada apostada)
    //Si la banca consigue el blackjack, el pago es 1 a 1
    //Si resulta en empate se anulan las apuestas y se devuelve lo apostado a cada jugador.
    function doblar() public {
        require(_game.status == GameStatus.ESPERANDO_JUGADOR_1);
        _game.bet = _game.bet * 2;
        emit Chat(string.concat('El jugador dobla la apuesta a ', Strings.toString(_game.bet), ' chips'));

        Card memory carta = getRandomCard();
        _game.playerCards.push(carta);
        emit Chat(string.concat('Se reparte ', getCardText(carta), ' al dealer'));
        _game.status = GameStatus.ESPERANDO_JUGADOR_N;
        calcularJuego();
    }

    function pedir() public {
        require(_game.status == GameStatus.ESPERANDO_JUGADOR_1 || _game.status == GameStatus.ESPERANDO_JUGADOR_N);
        Card memory carta = getRandomCard();
        _game.playerCards.push(carta);
        emit Chat(string.concat('Se reparte ', getCardText(carta), ' al dealer'));
        _game.status = GameStatus.ESPERANDO_JUGADOR_N;
        calcularJuego();
    }

    function rendirse() public {
        require(_game.status == GameStatus.ESPERANDO_JUGADOR_1 || _game.status == GameStatus.ESPERANDO_JUGADOR_N);
        uint devolucion = _game.bet / 2;
        //TODO: Devolucion de la mitad de la apuesta
        emit Chat(string.concat('El jugador se retira de la partida, se le devuelven ', Strings.toString(devolucion), ' chips'));
        _game.status = GameStatus.FINALIZADO;
        calcularJuego();
    }

    function calcularJuego() private {
        if (getPuntaje(_game.dealerCards) > 21) {
            emit Chat(string.concat('El dealer perdio el juego. Se paga al jugador'));
            _game.status = GameStatus.FINALIZADO;
        }
    }

    function getPuntaje(Card[] memory cards) public pure returns (uint)  {
        uint aces = 0;
        for (uint i = 0; i < cards.length; i++) {
            if (cards[i].number == 1) {
                aces++;
            }
        }
        uint puntaje = 0;
        for (uint i = 0; i < cards.length; i++) {
            if (cards[i].number == 1) {
                puntaje = puntaje + 11;
            } else {
                if (cards[i].number >= 10) {
                    puntaje = puntaje + 10;
                } else {
                    puntaje = puntaje + cards[i].number;
                }
            }
        }
        for (uint i = 0; i < aces; i++) {
            if (puntaje > 21) {
                puntaje = puntaje - 10;
            }
        }
        return puntaje;
    }

    function casinoRecibeChips(uint chips) private {
        emit Chat(string.concat('Recibiendo  ', Strings.toString(chips), ' del jugador'));
        //TODO: Agregar cobro
    }

    function casinoPagaChips(uint chips) private {
        emit Chat(string.concat('Pagando ', Strings.toString(chips), ' al jugador'));
        //TODO: Agregar pago
    }

    function gameStatus() public view returns (string memory){
        return getStatusText(_game.status);
    }

    function getStatusText(GameStatus status) private pure returns (string memory){
        if (status == GameStatus.NUEVO)
            return "Nuevo";
        if (status == GameStatus.ESPERANDO_APUESTA)
            return "Esperando Apuesta";
        if (status == GameStatus.ESPERANDO_REPARTIR)
            return "Esperando Repartir";
        if (status == GameStatus.ESPERANDO_JUGADOR_1)
            return "Esperando Jugador";
        if (status == GameStatus.ESPERANDO_JUGADOR_N)
            return "Esperando Jugador";
        if (status == GameStatus.FINALIZADO)
            return "Finalizado";
        return "Error";
    }

    function getCardText(Card memory card) private pure returns (string memory){
        string memory numberText;
        if (card.number == 1)
            numberText = "As";
        if (card.number > 1 && card.number < 11)
            numberText = Strings.toString(card.number);
        if (card.number == 11)
            numberText = "J";
        if (card.number == 12)
            numberText = "Q";
        if (card.number == 13)
            numberText = "K";

        string memory suitText;
        if (card.suit == 0)
            suitText = "Pica";
        if (card.suit == 1)
            suitText = "Corazon";
        if (card.suit == 2)
            suitText = "Trebol";
        if (card.suit == 3)
            suitText = "Diamante";
        return string.concat(numberText, ' de ', suitText);
    }

    function getRandomCard() private returns (Card memory){
        Card memory card;
        card.suit = randomVal(4);
        card.number = randomVal(13) + 1;
        return card;
    }

    function randomVal(uint max) private returns (uint){
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % max;
    }
}