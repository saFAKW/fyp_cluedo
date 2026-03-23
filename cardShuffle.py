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

def pick_hidden_cards(shuffled_deck):
    hidden_cards = []
    while len(hidden_cards) < 3:
        card = shuffled_deck.pop()
        if (card.startswith("R") and not any(c.startswith("R") for c in hidden_cards)) or \
           (card.startswith("W") and not any(c.startswith("W") for c in hidden_cards)) or \
           (card.startswith("S") and not any(c.startswith("S") for c in hidden_cards)):
            hidden_cards.append(card)
        else:
            shuffled_deck.insert(0, card)
    return hidden_cards

def distribute(shuffled_deck, numPlayers):
    hands = [[] for _ in range(numPlayers)]
    for i, card in enumerate(shuffled_deck):
        hands[i % numPlayers].append(card)
    return hands

def deal(numPlayers):
    deck = shuffle_deck(create_full_deck())
    hidden = pick_hidden_cards(deck) 
    hands = distribute(deck, numPlayers)
    return hidden, hands