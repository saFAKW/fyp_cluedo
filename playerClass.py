import random

#Needs to change based on how the board stores rooms
roomLocations = ["Kitchen", "Ballroom", "Conservatory", "Dining Room", "Billiard Room", "Library", "Lounge", "Hall", "Study"]

class Player:
    def __init__(self, name, character, location, hand, isTurn, inRoom, playerID, gameID, gameManager):
        self.name = name
        self.character = character
        self.location = location
        self.hand = hand
        self.playerID = playerID
        self.gameManager = gameManager
        self.gameID = gameID
        self.isTurn = isTurn
        #inRoom will store the name of the room the player is currently in, or None if they are not in a room
        self.inRoom = inRoom
        self.stillInGame = True
        self.hasMoved = False
        self.diceRoll = 0
        self.turnNumber = 0

    def rollDice(self):
            #Rolls the dice and returns the total
            die1 = random.randint(1, 6)
            die2 = random.randint(1, 6)
            self.diceRoll = die1 + die2
            return self.diceRoll

    def checkMovement(self, diceRoll):
            #Checks where the player can move to
            currentX =  self.location[0]
            currentY = self.location[1]

            possibleMoves = []
            for i in range(-diceRoll, diceRoll + 1):
                for j in range(-diceRoll, diceRoll + 1):
                    if abs(i) + abs(j) <= diceRoll:
                        possibleMoves.append((currentX + i, currentY + j))

            return possibleMoves

    def sendAccusation(self, accusation):
            #Accusation should be a list of (weapon, room, suspect)
            if accusation[1] != self.inRoom:
                    print("Your accusation must be for the room you are currently in.")
                    return False
            if not self.inRoom:
                print("You must be in a room to make a suggestion.")
                return False
                
            return accusation

    def receiveAccusation(self, accusation):
            #Accusation should be a list of (weapon, room, suspect)
            possibleCards = []
            for card in accusation[:3]: #Check the weapon, room, and suspect in the accusation
                if card in self.hand:
                    possibleCards.append(card)

            return possibleCards
        
    def finalGuess(self, guess):
        hidden = self.gameManager.hidden_cards
        if f"W{guess[0]}" in hidden and f"R{guess[1]}" in hidden and f"S{guess[2]}" in hidden:
            self.gameManager.playerWins(self)
            return True
        else:
            self.stillInGame = False
            self.gameManager.checkLastStanding()
            return False
            
    def startTurn(self):
            
            if not self.stillInGame:
                self.endTurn()
                return

            self.isTurn = True
            # tell the game to allow the player to take their turn
            self.hasMoved = False

            if self.turnNumber == 0:
                self.location = self.character.startingPosition

            self.turnNumber += 1

    def endTurn(self):
            self.isTurn = False
            # tell the game to move to the next player's turn
            self.gameManager.nextTurn()

    def moveTile(self, newLocation, diceRoll):
            possibleMoves = self.checkMovement(diceRoll)
            if newLocation in possibleMoves:
                self.location = newLocation
                self.hasMoved = True
                self.inRoom = None
            else:
                print("Invalid move. Please choose a valid location within your dice roll range.")

    def moveRoom(self, newRoom):
            if newRoom in roomLocations:
                self.inRoom = newRoom
                self.location = None
                self.hasMoved = True
            else:
                print("Invalid room. Please choose a valid room.")

    def timeOut(self):
            # If the player takes too long to make a move, this function can be called to end their turn
            self.endTurn()