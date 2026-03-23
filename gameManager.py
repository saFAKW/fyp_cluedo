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
    
    def handleSuggestion(self, suggestingPlayer, weapon, suspect, askedPlayer):
        room = suggestingPlayer.inRoom
        suggestion = (weapon, room, suspect)
        
        # Get players in order starting after the player being asked
        idx = self.players.index(askedPlayer)
        orderedPlayers = self.players[idx+1:] + self.players[:idx]
        
        for player in orderedPlayers:
            if not player.stillInGame:
                continue
            if player == suggestingPlayer:
                continue  # Skip the suggesting player
            matchingCards = [c for c in suggestion if c in player.hand]
            if matchingCards:
                # Return to frontend: who refuted and what cards they *could* show
                # The suggesting player picks which card to see (or it's random)
                return player, matchingCards
        
        return None, []  # Nobody could answer

    def playerWins(self, player):
        print(f"{player.name} wins the game!")
        #End the game and declare the winner