#Needs to change based on how the board stores rooms
roomLocations = ["Kitchen", "Ballroom", "Conservatory", "Dining Room", "Billiard Room", "Library", "Lounge", "Hall", "Study"]

class Player:
    def __init__(self, name, character, location, hand, isTurn, inRoom, playerID, gameID):
        self.name = name
        self.character = character
        self.location = location
        self.hand = hand
        self.playerID = playerID
        self.gameID = gameID
        self.isTurn = isTurn
        self.inRoom = inRoom
        self.stillInGame = True
        self.hasMoved = False
        self.diceRoll = 0

        def rollDice(self):
            #Rolls the dice and returns the total
            import random
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
            #Sends the player's accusation
            pass

        def receiveAccusation(self, accusation):
            #Receives an accusation from another player
            pass

        def isInRoom(self):
            #Checks if the player is in a room
            if self.location in roomLocations:
                self.inRoom = True
            else:
                self.inRoom = False

            return self.inRoom
        
        def finalGuess(self, guess):
            #Sends the player's final guess
            # guess should be a tuple of (weapon, room, suspect)
            if guess[0] == self.gameID.HiddenWeapon and guess[1] == self.gameID.HiddenRoom and guess[2] == self.gameID.HiddenSuspect:
                return True 
            else:               
                self.stillInGame = False 
                return False
            
        def startTurn(self):
            self.isTurn = True
            # tell the game to allow the player to take their turn
            self.hasMoved = False

        def endTurn(self):
            self.isTurn = False
            # tell the game to move to the next player's turn

        def move(self, newLocation, diceRoll):
            possibleMoves = self.checkMovement(diceRoll)
            if newLocation in possibleMoves:
                self.location = newLocation
                self.hasMoved = True
            else:
                print("Invalid move. Please choose a valid location within your dice roll range.")

        def timeOut(self, turnTimeLimit):
            # If the player takes too long to make a move, this function can be called to end their turn
            self.endTurn()