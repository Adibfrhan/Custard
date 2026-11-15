# CUSTARD – Custom Edition

*Remember Your Cards. Outsmart Your Opponents.*

CUSTARD is a memory-and-bluff card game for 2–6 players. You're dealt four face-down cards, you peek at two, and you try to finish with the lowest total. Kings let you peek, Queens swap cards between players, Jacks give an extra draw, and the two Jokers are worth −2. When you think you're lowest, call **CUSTARD**.

## Quick start

```bash
npm install
npm test              # 56 engine + server tests
npm run dev           # local dev server (http://localhost:5173)
npm run build         # type-check, then emit ONE self-contained dist/index.html
npm run server        # online multiplayer server on http://localhost:3001 (serves dist/index.html too)
npm start             # build + server
```

**Local multiplayer** (hot-seat on one device) works anywhere, including when you open `dist/index.html` straight from disk.

**Online multiplayer:** run `npm start`. Players open the server's address (for example `http://<your-LAN-IP>:3001`). The host clicks **Create Room → Online**, shares the 5-letter code, and the others use **Join Room**. If the client page is hosted somewhere else, set the server address in **Settings → Online**.

Environment variables for the server are `PORT` (default 3001) and `TURN_TIMEOUT` (seconds before a disconnected player's turn is skipped, default 45).

## Project layout

```
src/engine/          Pure, UI-agnostic game engine (shared by client and server)
  types.ts           Card, Player, GameState, GamePhase, GameAction …
  cards.ts           createDeck, getCardValue (single source of truth), shuffleDeck (Fisher–Yates, crypto RNG)
  game.ts            createGame, dealCards, initializeRound, inspectInitialCards, drawCard, takeDiscardCard,
                     replaceCard, discardCard, activateKing/kingPeek, activateQueen/exchangeCards/queenSwap,
                     activateJack, skipAbility, callCustard, processFinalTurns, calculatePlayerScore,
                     calculateRoundResults, updateCumulativeScores, reshuffleDiscardPile, startNextRound,
                     finishGame, skipTurn, removePlayer, applyAction (validating dispatcher)
  view.ts            getPlayerView(state, playerId): the redacted projection one player is allowed to see
  engine.test.ts     50 rule tests
src/online/protocol.ts   Socket.IO message types shared by client and server
src/store/           Zustand stores: session (local hot-seat + online transport), settings (persisted)
src/game/, src/screens/, src/ui/   React UI (Tailwind + Framer Motion + Lucide)
server/              Authoritative Socket.IO server + integration tests
```

### Design principles

- **The engine is the only authority.** Every move goes through `applyAction`, which validates phase, turn, stage and inputs, then returns a new state. It never mutates the old one. The UI never computes a score or card value.
- **Hidden information is projected, not hidden by CSS.** Both modes render only `getPlayerView`. Hidden cards carry no rank, suit, value or id. Online, the server keeps the full state and sends each socket only its own view.
- **Card conservation** is tested: all 54 unique cards are present after every action, including reshuffles, Jack draws and Queen swaps (and a 400-move randomised game).

## Rules implemented

| Card | Value | Power (only when drawn from the pile **and discarded**) |
|---|---:|---|
| A | 1 | – |
| 2–10 | face value | – |
| J | 10 | Draw one extra card; the extra card never triggers a power |
| Q | 10 | Swap two face-down cards between two *different* players (yours ↔ opponent, or opponent ↔ opponent) |
| K | 10 | Privately peek at one of your own cards |
| Joker ×2 | −2 | – |

Taking a face card from the discard pile, or discarding one during a replacement, never activates its power. You can decline a King or Queen power. Queen swaps stay legal during final turns, including against players who have already finished.

**Matching the discard:** whenever there's a card on the discard pile, *any* player – not only the one whose turn it is – may discard one of their own face-down cards that they think has the same rank (suits don't matter, Jokers match Jokers). A correct match leaves that position empty (it scores 0). A wrong card is shown to everyone, returned to its position, and the player takes **two penalty cards** face-down (filling empty positions first, otherwise extending the grid). The current turn is unaffected. In local mode tap **Match** and choose who is matching; online, each player matches for themselves. Engine: `matchDiscard` / `{ type: "MATCH_DISCARD", slot }`.

**CUSTARD:** call it only at the start of your turn. Every other player gets exactly one final turn, then all cards are revealed. A wrong caller (not lowest, and not tied for lowest) gets a configurable +10 penalty. Tied players share the round win.

**Draw pile:** when it's empty, the discard pile except its top card is shuffled into a new draw pile.

## Look & typefaces

The interface is styled after Attic black-figure pottery: flat orange clay, black glaze and cream slip, with no gradients, blur or drop shadows. Depth comes from tone steps and fine rules, the way a vase painter separates registers. Friezes (rays, a meander key and a running wave) frame the main menu like the bands on a vase. The tokens live in `src/index.css` and `tableTokens()` in `src/ui/designs.ts`. Each table colour sets its own ink: dark glaze on clay, cream slip on the dark grounds. Secondary text never drops below 80% ink, so it stays readable on the orange.

- **Forum** (inscriptional Roman) for the wordmark, headings and card ranks.
- **Alegreya Sans** (humanist sans) for the interface text.
- **GFS Didot**, Greek glyphs only, for the occasional inscription.
- All three are SIL Open Font License fonts, embedded as WOFF2 in `src/fonts/` (licences in `src/fonts/FONT-LICENSES.txt`), so the page works offline.

### Odyssey references

- **King: Athena's owl**, which sees in the dark. Peek at one of your cards.
- **Queen: Penelope's loom**, woven by day and unpicked by night. Swap two cards.
- **Jack: the great bow**, drawn. Draw an extra card.
- **Joker: "Nobody"**, the Cyclops' single eye. Odysseus told Polyphemus his name was Nobody; the card is worth less than nothing (−2).
- **Card backs: the ship's eye**, painted on the bows of Greek ships.
- The winner goes **home to Ithaca**, and the table can be set to the **wine-dark sea**.

## Card designs

Go to **Settings → Card design**, or **Customise card designs** on the main menu. You can change:

- **Card back**: Ship's eye, Meander, Wine-dark sea, Rays or Plain. There are six colours (black glaze, clay, wine, Aegean, olive, umber) plus a custom colour picker, four trims (clay, slip, added red, bronze), and a 1–3 letter monogram on the patterned backs.
- **Faces**: Classic (pips, with black-figure court panels), Modern (large centred rank) or Jumbo index (oversized corners for phones). Card stock can be slip, white ground or buff clay, and you can turn on four-colour suits.
- **Power accents**: a coloured frame and a PEEK, SWAP or DRAW label on Kings, Queens and Jacks. You can turn these off.
- **Table**: Attic clay, black glaze, wine-dark sea, Aegean or olive grove. **Dim the table** in Display darkens whichever you choose.

Designs are previewed live and saved in the browser. Settings saved by older versions keep their rules, names and server address, but the card design starts fresh.

## Hosting online

Online rooms need the CUSTARD server running somewhere your friends can reach. The server also serves the game page, so everyone just opens one address.

**Same Wi-Fi:** run `npm start`, find your computer's local IP address (for example `192.168.1.20`), and have everyone open `http://192.168.1.20:3001`.

**Anywhere (free, on Render):**

1. Push this folder to a GitHub repository.
2. On render.com, choose **New → Web Service** and connect the repository.
3. Set **Build command** to `npm install --include=dev && npm run build` and **Start command** to `npm run server`.
4. Choose the **Free** instance type, set **Health check path** to `/health`, and deploy.
5. Share the `https://<name>.onrender.com` address. The game connects to its own server automatically.

Free services sleep after 15 minutes without traffic, and the first visit after that takes about a minute to wake the server. Rooms live in memory, so a restart or a sleep ends any game in progress.

## Not included yet

- Persistence is in memory: server restarts drop rooms. The `Room` map in `server/custardServer.ts` is the single place to swap in Supabase or Postgres for durable rooms and player statistics.
- All sound effects are synthesised with the Web Audio API, so there are no audio files to license.
