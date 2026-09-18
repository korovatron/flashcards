import json

with open('flashcards_unit1.json', 'r', encoding='utf-8') as f:
    u1 = json.load(f)

# Let's map each card index in Unit 1
u1_sections = {}

for i in range(len(u1)):
    if 0 <= i <= 87:
        sec = "4.1"
    elif 88 <= i <= 144:
        sec = "4.2"
    elif 145 <= i <= 146:
        sec = "4.3" # BFS
    elif 147 <= i <= 149:
        sec = "4.2" # static/dynamic/heap
    elif 150 <= i <= 175:
        sec = "4.3" # graph traversal, tree traversal, RPN, searching, sorting, dijkstra
    elif 176 <= i <= 261:
        sec = "4.4" # abstraction, FSM, regex, BNF, big-o, turing machines
    else:
        raise ValueError(f"Unknown index {i}")
    u1_sections[i] = sec

from collections import Counter
counts = Counter(u1_sections.values())
print("Unit 1 counts by section:", counts)
