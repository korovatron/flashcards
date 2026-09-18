import json

# Load Unit 1
with open('flashcards_unit1.json', 'r', encoding='utf-8') as f:
    u1 = json.load(f)

# Load Unit 2
with open('flashcards_unit2.json', 'r', encoding='utf-8') as f:
    u2 = json.load(f)

from classify_u1 import u1_sections
from classify_u2 import get_u2_section

# Tag Unit 1
u1_tagged = []
for i, card in enumerate(u1):
    new_card = {
        'front': card['front'],
        'back': card['back'],
        'section': u1_sections[i]
    }
    u1_tagged.append(new_card)

# Tag Unit 2
u2_tagged = []
for i, card in enumerate(u2):
    new_card = {
        'front': card['front'],
        'back': card['back'],
        'section': get_u2_section(i, card)
    }
    u2_tagged.append(new_card)

with open('flashcards_unit1.json', 'w', encoding='utf-8') as f:
    json.dump(u1_tagged, f, indent=2, ensure_ascii=False)

with open('flashcards_unit2.json', 'w', encoding='utf-8') as f:
    json.dump(u2_tagged, f, indent=2, ensure_ascii=False)

print(f"Successfully tagged {len(u1_tagged)} cards in Unit 1 and {len(u2_tagged)} cards in Unit 2.")
