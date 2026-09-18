import json

with open('flashcards_unit2.json', 'r', encoding='utf-8') as f:
    u2 = json.load(f)

def get_u2_section(i, c):
    # Block 1: 0 - 78 -> 4.5 Data representation
    if 0 <= i <= 78:
        return "4.5"
    
    # Block 2: 79 - 122 -> 4.6 Fundamentals of computer systems
    if 79 <= i <= 122:
        return "4.6"
    
    # Block 3: 123 - 199 -> 4.7 Computer organisation and architecture
    if 123 <= i <= 199:
        return "4.7"
    
    # Block 4: 200 - 214 -> 4.8 Consequences of uses of computing
    if 200 <= i <= 214:
        return "4.8"
    
    # Block 5: 215 - 254 -> 4.9 Communication and networking
    if 215 <= i <= 254:
        return "4.9"
    
    # Block 6: 255 - 301 (Detailed mapping for mixed/exam questions)
    if i == 255: return "4.6" # Define software
    if i == 256: return "4.6" # intermediate language code
    if i == 257: return "4.7" # main memory in execution of computer programs
    if i == 258: return "4.9" # physical star topology logically behave as bus
    if i == 259: return "4.5" # lossy compression
    if i == 260: return "4.8" # ethical issues
    if i == 261: return "4.8" # legal issues
    if i == 262: return "4.8" # cultural issues
    if i == 263: return "4.9" # physical star network
    if i == 264: return "4.9" # client-server network
    if i == 265: return "4.9" # physical & logical topology
    if i == 266: return "4.5" # RLE compression
    if i == 267: return "4.6" # role of operating system
    if i == 268: return "4.6" # resources operating system manages
    if i == 269: return "4.6" # system software vs application software
    if i == 270: return "4.7" # role of address, data & control bus
    if i == 271: return "4.7" # SSD & hard disk
    if i == 272: return "4.7" # faster to access data from SSD than optical
    if i == 273: return "4.9" # peer-to-peer
    if i == 274: return "4.9" # bandwidth
    if i == 275: return "4.9" # CSMA/CA & RTS/CTS
    if i == 276: return "4.9" # serial transmission
    if i == 277: return "4.9" # bit rate higher than baud rate
    if i == 278: return "4.9" # logical bus network
    if i == 279: return "4.5" # dictionary-based methods
    if i == 280: return "4.7" # SSD to magnetic hard disk
    if i == 281: return "4.5" # Vernam cipher perfectly secure
    if i == 282: return "4.7" # Steps of fetch & explanation
    if i == 283: return "4.7" # data bus bidirectional
    if i == 284: return "4.5" # Nyquist's theorem
    if i == 285: return "4.9" # WPA2 in wireless networking
    if i == 286: return "4.7" # digital camera
    if i == 287: return "4.7" # status register
    if i == 288: return "4.6" # libraries
    if i == 289: return "4.5" # sample resolution
    if i == 290: return "4.5" # parity bit over majority voting
    if i == 291: return "4.5" # MIDI
    if i == 292: return "4.6" # HLLs advantages
    if i == 293: return "4.6" # HLLs disadvantages
    if i == 294: return "4.6" # intermediate language
    if i == 295: return "4.6" # imperative HLL
    if i == 296: return "4.5" # rounding errors
    if i == 297: return "4.5" # absolute errors
    if i == 298: return "4.5" # relative errors
    if i == 299: return "4.5" # floating point vs fixed point
    if i == 300: return "4.5" # large exponent small mantissa
    if i == 301: return "4.5" # binary point closer to left

    # Block 7: 302 - 364 -> 4.9 Communication and networking (thin/thick client, WiFi, Internet, TCP/IP, IP addressing)
    if 302 <= i <= 364:
        return "4.9"
    
    # Block 8: 365 - 383 -> 4.5 Data representation (two's complement, fixed/floating point, rounding/abs/rel error, normalisation, overflow/underflow, ASCII, metadata, sample resolution, RLE, dictionary compression, Vernam security)
    if 365 <= i <= 383:
        return "4.5"
    
    # Block 9: 384 - 391 -> 4.6 Fundamentals of computer systems (intermediate language, source/object code, half/full adder, D-type flip-flop)
    if 384 <= i <= 391:
        return "4.6"
    
    # Block 10: 392 - 413 -> 4.7 Computer organisation & architecture (processor, memory, stored program concept, ALU, CU, clock, registers, F-E cycle, operand, interrupts/ISR, optical drive)
    if 392 <= i <= 413:
        return "4.7"
    
    # Block 11: 414 - 495 -> 4.9 Communication and networking (start/stop bit, logical topology, bandwidth, firewall, DNS, router, gateway, security, TCP/IP, DHCP, NAT, port forwarding, client-server/p2p, WebSocket, REST, CRUD, JSON/XML, thin/thick client)
    if 414 <= i <= 495:
        return "4.9"
    
    # Block 12: 496 - 523 -> 4.10 Fundamentals of databases (ER diagrams, relational DB, keys, normalisation, 3NF, SQL, client-server DB, concurrent access, record locks, timestamp/commitment ordering)
    if 496 <= i <= 523:
        return "4.10"
    
    # Block 13: 524 - 541 -> 4.11 Big Data (Big data, 3 Vs, distributed processing, machine learning, graph schema)
    if 524 <= i <= 541:
        return "4.11"
    
    # Block 14: 542 - 562 -> 4.12 Functional programming (functions, first-class objects, higher-order functions, map/filter/fold, list processing)
    if 542 <= i <= 562:
        return "4.12"

    raise ValueError(f"Unmapped index {i}")

from collections import Counter
counts = Counter(get_u2_section(i, c) for i, c in enumerate(u2))
print("Unit 2 counts by section:", counts)
