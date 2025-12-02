import random

#Define the list of cards
#In the final project this would be done by reading from the databae
rooms = ["Kitchen", "Ballroom", "Conservatory", "Dining Room", "Lounge", "Hall", "Study", "Library", "Billiard Room"]
weapons = ["Knife", "Revolver", "Rope", "Lead Pipe", "Wrench", "Candlestick"]
suspects = ["Miss Scarlet", "Colonel Mustard", "Reverend Green", "Mrs. Peacock", "Professor Plum", "Dr. Orchid"]

#Function to shuffle the deck
def shuffle_deck(deck):
    random.shuffle(deck)
    return deck

#Function to combine all cards into 1 deck
#The cards are prefixed with R, W, or S to indicate type
def create_full_deck():
    deck = []
    for room in rooms:
        deck.append(f"R{room}")
    for weapon in weapons:
        deck.append(f"W{weapon}")
    for suspect in suspects:
        deck.append(f"S{suspect}")

    return deck

if __name__ == "__main__":
    full_deck = create_full_deck()
    shuffled_deck = shuffle_deck(full_deck)
    
    #Get number of players
    players = int(input("Enter number of players (2-6): "))
    #Validate number of players
    while players < 2 or players > 6:
        print("Invalid number of players. Please enter a number between 2 and 6.")
        players = int(input("Enter number of players (2-6): "))

    #Create hidden cards for final guess
    hidden_cards = []
    while len(hidden_cards) < 3:
        #Gets next card from the deck
        card = shuffled_deck.pop()
        #If that type of card isn't already in hidden cards, add it
        if (card.startswith("R") and not any(c.startswith("R") for c in hidden_cards)) or \
           (card.startswith("W") and not any(c.startswith("W") for c in hidden_cards)) or \
           (card.startswith("S") and not any(c.startswith("S") for c in hidden_cards)):
            hidden_cards.append(card)
        #If the card type is already in hidden cards, put it back at the bottom of the deck
        else:
            shuffled_deck.insert(0, card) 
    
    #Distribute remaining cards to players
    player_hands = [[] for _ in range(players)]
    current_player = 0
    while shuffled_deck:
        card = shuffled_deck.pop()
        player_hands[current_player].append(card)
        current_player = (current_player + 1) % players

    #Print player hands and hidden cards for verification
    for i, hand in enumerate(player_hands):
        print(f"Player {i+1} hand: {hand}")
    print(f"Hidden Cards: {hidden_cards}")
    
    