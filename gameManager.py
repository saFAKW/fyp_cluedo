import playerClass
import cardShuffle

class gameManager:
    def __init__(self, gameID):
        self.gameID = gameID
        #Get a list of players from the databse, blank names mean nobody chose that character so they are not in the game
        self.players = [player for player in self.gameID.players if player.name != None]

    def startGame(self):
        #Set the first player to have their turn
        numPlayers = len(self.players)
        self.hidden_cards, self.player_hands = cardShuffle.deal(numPlayers)
        for player, hand in zip(self.players, self.player_hands):
            player.hand = hand
        self.players[0].startTurn()

    def nextTurn(self):
        #Start the next player's turn
        currentPlayerIndex = self.players.index(next(player for player in self.players if player.isTurn))
        self.players[currentPlayerIndex].isTurn = False
        nextPlayerIndex = (currentPlayerIndex + 1) % len(self.players)
        self.players[nextPlayerIndex].startTurn()

    def checkLastStanding(self):
        activePlayers = [player for player in self.players if player.stillInGame]
        if len(activePlayers) == 1:
            self.playerWins(activePlayers[0])
    
    def handleSuggestion(self, suggesting_session_id, suspect, weapon, room_name):
        # Find the suggesting player object
        suggesting_player = next(
            (p for p in self.players if p.playerID == suggesting_session_id), None
        )
        if not suggesting_player:
            return None, []

        # Cards are stored with R/W/S prefix, so build prefixed versions to check
        suggestion_cards = [f"S{suspect}", f"W{weapon}", f"R{room_name}"]

        # Get all other players in order starting from the one after the suggester
        idx = self.players.index(suggesting_player)
        ordered = self.players[idx+1:] + self.players[:idx]

        for player in ordered:
            if not player.stillInGame:
                continue
            if player == suggesting_player:
                continue
            # Check which of the suggested cards this player holds
            matching = [card[1:] for card in suggestion_cards if card in player.hand]
            if matching:
                return player, matching

        return None, []  # Nobody could disprove it

    def playerWins(self, player):
        print(f"{player.name} wins the game!")
        #End the game and declare the winner