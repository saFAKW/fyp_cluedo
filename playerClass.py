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