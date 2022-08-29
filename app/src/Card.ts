enum Suit {
    NONE = '',
    SPADE = 'S',
    CLUB = 'C',
    HEART = 'H',
    DIAMOND = 'D'
}

export interface Card {
    suit: Suit
    num: number
    src: string
}

export const EMPTY_CARD: Card = {suit: Suit.NONE, num: 0, src: `cards/back.png`}

export function getCardFromString(str: string): Card {
    const suit = str.substring(0, 1) as Suit
    const num = parseInt(str.substring(1))
    const src = `cards/${suit}${num}.png`
    return {suit, num, src}
}
