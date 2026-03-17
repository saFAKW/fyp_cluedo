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

    def checkMovement(self, targetX, targetY, diceRoll):
        currentX = self.location[0]
        currentY = self.location[1]
        distance = abs(targetX - currentX) + abs(targetY - currentY)
        if distance <= diceRoll and 0 <= targetX < 25 and 0 <= targetY < 25:
            return True
        return False

    def sendAccusation(self, accusation):
        pass

    def receiveAccusation(self, accusation):
        pass

    def isInRoom(self, room_name=None):
        if room_name in roomLocations:
            self.inRoom = True
        else:
            self.inRoom = False
        return self.inRoom
