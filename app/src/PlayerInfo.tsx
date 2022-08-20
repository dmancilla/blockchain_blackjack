import React from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const PlayerInfo = (props: { money: number }) => (
    <Container>
        <Row>
            <Col>Dinero Jugador: $ {props.money}</Col>
        </Row>
    </Container>
);

export default PlayerInfo