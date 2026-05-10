export const cardBack =
    "https://cdn.shopify.com/s/files/1/0200/7616/products/playing-cards-bicycle-rider-back-2_1024x1024.png?v=1535755695"
import { cards } from "./cards"

export const board = d3.select("#board")
    .attr("x", 1000)
    .append("svg")
    .attr("height", 650)
    .attr("width", 1100);

const TABLE = { x: 52, y: 70, w: 860, h: 430 }
const TABLE_CENTER = { x: TABLE.x + TABLE.w / 2, y: TABLE.y + TABLE.h / 2 }

export function renderTable() {
    board.append("svg:image")
        .attr("xlink:href", "https://i.imgur.com/VHDSPO7.png")
        .attr("class", "ellipse")
        .attr("x", TABLE.x)
        .attr("y", TABLE.y)
        .attr("width", TABLE.w)
        .attr("height", TABLE.h)
        .attr("fill", "green")
}

export function renderCommunityCards() {
    const startX = 185
    const y = 252
    const step = 110

    for (let i = 0; i < 5; i++) {
        board.append("svg:image")
            .attr("xlink:href", cardBack)
            .attr("id", `board-${i + 1}`)
            .attr("x", startX + step * i)
            .attr("y", y)
            .attr("width", 100)
            .attr("height", 136)
            .attr("fill", "white")
            .style("stroke", "black")
    }
}

export function renderDeck() {
    for (let i = 0; i < 13; i++) { 
        board.append("svg:image")
            .attr("xlink:href", cards[i].image ? cards[i].image : cards.cards[i].image)
            .attr("id", "cardselect-" + i)
            .attr("class", "cards")
            .attr("height", 80)
            .attr("width", 60)
            .attr("x", 860)
            .attr("y", 36 * i + 10)
    }

    for (let i = 13; i < 26; i++) {
        board.append("svg:image")
            .attr("xlink:href", cards[i].image ? cards[i].image : cards.cards[i].image)
            .attr("id", "cardselect-" + i)
            .attr("class", "cards")
            .attr("x", 920)
            .attr("y", 36 * (i - 13) + 10)
            .attr("height", 80)
            .attr("width", 60)
    }

    for (let i = 26; i < 39; i++) {
        board.append("svg:image")
            .attr("xlink:href", cards[i].image ? cards[i].image : cards.cards[i].image)
            .attr("id", "cardselect-" + i)
            .attr("class", "cards")
            .attr("x", 980)
            .attr("y", 36 * (i - 26) + 10)
            .attr("height", 80)
            .attr("width", 60)
    }

    for (let i = 39; i < 52; i++) {
        board.append("svg:image")
            .attr("xlink:href", cards[i].image ? cards[i].image : cards.cards[i].image)
            .attr("id", "cardselect-" + i)
            .attr("class", "cards")
            .attr("x", 1040)
            .attr("y", 36 * (i - 39) + 10)
            .attr("height", 80)
            .attr("width", 60)
    }
}

function seatPosition(playerCount, playerIndex) {
    const angleStart = -Math.PI / 2
    const angle = angleStart + (2 * Math.PI * playerIndex) / playerCount
    const rx = 315
    const ry = 195
    return {
        x: TABLE_CENTER.x + rx * Math.cos(angle),
        y: TABLE_CENTER.y + ry * Math.sin(angle),
    }
}

export function renderPlayers(playerCount) {
    board.select("#players-layer").remove()
    const layer = board.append("g").attr("id", "players-layer")

    const cardW = 78
    const cardH = 106
    const gap = 8

    for (let p = 0; p < playerCount; p++) {
        const pos = seatPosition(playerCount, p)
        const group = layer.append("g").attr("id", `player-${p}`)

        group.append("text")
            .attr("x", pos.x - 12)
            .attr("y", pos.y - 8)
            .attr("fill", "white")
            .style("font-size", "14px")
            .style("text-shadow", "2px 2px black")
            .text(`P${p + 1}`)

        group.append("svg:image")
            .attr("xlink:href", cardBack)
            .attr("id", `p${p}-1`)
            .attr("x", pos.x - cardW - gap / 2)
            .attr("y", pos.y)
            .attr("width", cardW)
            .attr("height", cardH)
            .style("stroke", p === 0 ? "red" : "black")

        group.append("svg:image")
            .attr("xlink:href", cardBack)
            .attr("id", `p${p}-2`)
            .attr("x", pos.x + gap / 2)
            .attr("y", pos.y)
            .attr("width", cardW)
            .attr("height", cardH)
            .style("stroke", "black")

        group.append("rect")
            .attr("id", `p${p}-odds-bg`)
            .attr("x", pos.x - cardW - gap / 2)
            .attr("y", pos.y + cardH + 6)
            .attr("width", cardW * 2 + gap)
            .attr("height", 42)
            .attr("fill", "rgba(128,128,128,0.85)")

        group.append("text")
            .attr("id", `p${p}-win`)
            .attr("x", pos.x - cardW - gap / 2 + 8)
            .attr("y", pos.y + cardH + 22)
            .attr("fill", "white")
            .style("font-size", "16px")
            .text("")

        group.append("text")
            .attr("id", `p${p}-tie`)
            .attr("x", pos.x - cardW - gap / 2 + 8)
            .attr("y", pos.y + cardH + 40)
            .attr("fill", "orange")
            .style("font-size", "16px")
            .text("")
    }
}

export function initBoard(playerCount) {
    renderTable()
    renderCommunityCards()
    renderPlayers(playerCount)
    renderDeck()
}