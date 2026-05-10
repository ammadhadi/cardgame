import { calculateEquity } from "poker-odds";
import { cards } from "./cards"
import * as Setup from "./setup"
import {cardBack} from "./setup"

function parsePlayerCount() {
    const params = new URLSearchParams(window.location.search)
    const raw = parseInt(params.get("players") || "2", 10)
    const allowed = [2, 4, 6, 8]
    return allowed.includes(raw) ? raw : 2
}

const playerCount = parsePlayerCount()
Setup.initBoard(playerCount)

// --- Game state
let hands = Array.from({ length: playerCount }, () => [null, null])
let boardCards = [null, null, null, null, null]
let selectedDeckIdx = new Set()

// stage = { kind: "hand", p, c } or { kind: "board", i } or { kind: "done" }
let stage = { kind: "hand", p: 0, c: 0 }

function allHandsSelected() {
    return hands.every(h => !h.includes(null))
}

function knownBoardCards() {
    return boardCards.filter(c => c !== null)
}

function setInstruction(text, x = 170, y = 200) {
    const existing = d3.select("#instruction")
    if (!existing.empty()) {
        existing.attr("x", x).attr("y", y).attr("fill", "white").text(text)
        return
    }

    Setup.board.append("text")
        .attr("id", "instruction")
        .attr("x", x)
        .attr("y", y)
        .attr("fill", "white")
        .text(text)
}

function showReset() {
    d3.select("#instruction").remove()
    Setup.board.append("a")
        .attr("xlink:href", ".")
        .attr("id", "final-instruction")
        .append("text")
        .attr("x", 340)
        .attr("y", 420)
        .text("Click Here to Reset!")
}

function updateOdds() {
    if (!allHandsSelected()) return

    const odds = calculateEquity(hands, knownBoardCards(), 1200, false)
    for (let p = 0; p < playerCount; p++) {
        const winPct = (odds[p].wins / odds[p].count) * 100
        const tiePct = (odds[p].ties / odds[p].count) * 100

        d3.select(`#p${p}-win`).text(`Win: ${winPct.toFixed(2)}%`)
        d3.select(`#p${p}-tie`).text(`Tie: ${tiePct.toFixed(2)}%`)
    }

    // Highlight current leader(s) by win% (ties included separately)
    const winPcts = odds.map(o => (o.wins / o.count) * 100)
    const maxWin = Math.max(...winPcts)
    for (let p = 0; p < playerCount; p++) {
        d3.select(`#p${p}-win`).style("fill", winPcts[p] === maxWin ? "white" : "red")
    }
}

function advanceStage() {
    if (stage.kind === "hand") {
        if (stage.c === 0) {
            stage = { kind: "hand", p: stage.p, c: 1 }
        } else {
            const nextP = stage.p + 1
            if (nextP < playerCount) {
                stage = { kind: "hand", p: nextP, c: 0 }
            } else {
                stage = { kind: "board", i: 0 }
            }
        }
        return
    }

    if (stage.kind === "board") {
        const nextI = stage.i + 1
        if (nextI < 5) {
            stage = { kind: "board", i: nextI }
        } else {
            stage = { kind: "done" }
        }
    }
}

function stageInstruction() {
    if (stage.kind === "hand") {
        setInstruction(`Select card ${stage.c + 1} for Player ${stage.p + 1}`)
        return
    }

    if (stage.kind === "board") {
        const labels = ["flop (1/3)", "flop (2/3)", "flop (3/3)", "turn", "river"]
        setInstruction(`Select community card: ${labels[stage.i]}`, 220, 420)
        return
    }
}

stageInstruction()

// --- Deck click handling (single handler, no add/remove juggling)
let cardsArr = document.getElementsByClassName("cards");

function onDeckCardClick(evt) {
    if (stage.kind === "done") return

    const id = this.id || ""
    const parts = id.split("-")
    const idx = parseInt(parts[1], 10)
    if (Number.isNaN(idx)) return
    if (selectedDeckIdx.has(idx)) return

    selectedDeckIdx.add(idx)

    const picked = cards[idx]
    d3.select(this).attr("xlink:href", cardBack)

    if (stage.kind === "hand") {
        hands[stage.p][stage.c] = picked.code
        d3.select(`#p${stage.p}-${stage.c + 1}`).attr("xlink:href", picked.image)
        advanceStage()
        stageInstruction()
        updateOdds()
        return
    }

    if (stage.kind === "board") {
        boardCards[stage.i] = picked.code
        d3.select(`#board-${stage.i + 1}`).attr("xlink:href", picked.image)
        advanceStage()
        if (stage.kind === "done") {
            showReset()
        } else {
            stageInstruction()
        }
        updateOdds()
    }
}

for (let i = 0; i < cardsArr.length; i++) {
    cardsArr[i].addEventListener("click", onDeckCardClick)
}

// --- Optional player dropdown wiring (if present in index.html)
const playerSelect = document.getElementById("playerCount")
if (playerSelect) {
    playerSelect.value = String(playerCount)
    playerSelect.addEventListener("change", () => {
        const next = playerSelect.value
        const url = new URL(window.location.href)
        url.searchParams.set("players", next)
        window.location.href = url.toString()
    })
}

document.getElementById("playerCount").addEventListener("click", function () {
    const select = document.getElementById("playerCount");

    // Get last option value
    const lastValue = parseInt(select.options[select.options.length - 1].value);

    // Add next even number
    const newValue = lastValue + 2;

    const option = document.createElement("option");
    option.value = newValue;
    option.textContent = newValue;

    select.appendChild(option);
});