import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React from "react";
import {EMPTY_CARD} from "./Card";

const DealerHand = (props: { card1: string, card2: string }) => (
    <Container>
        <Row>
            <Col lg={4}></Col>
            <Col lg={2}>
                <div>
                    <img alt="deck" src={props.card1}/>
                </div>
            </Col>
            <Col lg={2}>
                <div>
                    <img alt="deck" src={props.card2}/>
                </div>
            </Col>
            <Col lg={4}></Col>
        </Row>
    </Container>
);

export default DealerHand
