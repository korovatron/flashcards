"""Extract flashcard front/back text pairs from a GoodNotes 6 .goodnotes file.

GoodNotes 6 documents are zip archives containing an index.events.pb file:
an undocumented, schema-less stream of length-prefixed protobuf messages
(one per autosave event). This was reverse engineered by inspecting the raw
bytes - there is no official .proto schema available.

Each event's top-level field [1] is the UUID of a "card" (a group of two
text boxes: front and back of a flashcard). Events accumulate over time as
the student types, so for a given card id, the LAST event in the stream
holds the final text. Text content is nested under a MESSAGE containing
fields [1]='text/plain' (mimetype) and [2]=<text> - we walk the tree to find
these leaves in order (first = front, second = back).

Usage:
    python extract_flashcards.py "Computer Science P1.goodnotes" flashcards_unit1.json
"""
import sys
import json
import zipfile


def read_varint(data, i):
    result = 0
    shift = 0
    while True:
        b = data[i]
        i += 1
        result |= (b & 0x7F) << shift
        if not (b & 0x80):
            break
        shift += 7
    return result, i


def parse_fields(data):
    i = 0
    n = len(data)
    fields = []
    while i < n:
        tag, i = read_varint(data, i)
        field_no = tag >> 3
        wire_type = tag & 7
        if field_no == 0:
            raise ValueError("field 0")
        if wire_type == 0:
            val, i = read_varint(data, i)
            fields.append((field_no, 'varint', val))
        elif wire_type == 1:
            if i + 8 > n:
                raise ValueError("trunc64")
            fields.append((field_no, '64bit', data[i:i + 8])); i += 8
        elif wire_type == 2:
            length, i = read_varint(data, i)
            if i + length > n:
                raise ValueError("trunclen")
            fields.append((field_no, 'len', data[i:i + length])); i += length
        elif wire_type == 5:
            if i + 4 > n:
                raise ValueError("trunc32")
            fields.append((field_no, '32bit', data[i:i + 4])); i += 4
        else:
            raise ValueError("bad wiretype")
    return fields


def try_submessage(data):
    if len(data) == 0:
        return None
    try:
        fields = parse_fields(data)
    except (ValueError, IndexError):
        return None
    if not fields or not all(fn < 500 for fn, _, _ in fields):
        return None
    return fields


def find_text_plain_leaves(fields, out_list):
    d = {fn: (wt, val) for fn, wt, val in fields}
    if 1 in d and d[1][0] == 'len':
        try:
            s = d[1][1].decode('utf-8')
        except UnicodeDecodeError:
            s = None
        if s == 'text/plain':
            content = ''
            if 2 in d and d[2][0] == 'len':
                try:
                    content = d[2][1].decode('utf-8')
                except UnicodeDecodeError:
                    content = ''
            out_list.append(content)
            return
    for fn, wt, val in fields:
        if wt == 'len':
            sub = try_submessage(val)
            if sub:
                find_text_plain_leaves(sub, out_list)


def iter_delimited_records(data):
    i = 0
    n = len(data)
    while i < n:
        length, i = read_varint(data, i)
        yield data[i:i + length]
        i += length


def extract_cards(events_pb_bytes):
    card_order = []
    card_last_texts = {}

    for rec in iter_delimited_records(events_pb_bytes):
        try:
            fields = parse_fields(rec)
        except (ValueError, IndexError):
            continue
        d = {}
        for fn, wt, val in fields:
            d.setdefault(fn, []).append((wt, val))
        if 1 not in d or d[1][0][0] != 'len':
            continue
        try:
            card_id = d[1][0][1].decode('utf-8')
        except UnicodeDecodeError:
            continue
        if len(card_id) != 36:
            continue

        payload = None
        best_len = -1
        for fn, wt, val in fields:
            if wt == 'len' and fn != 1 and len(val) > best_len:
                sub = try_submessage(val)
                if sub:
                    payload = sub
                    best_len = len(val)
        if payload is None:
            continue

        texts = []
        find_text_plain_leaves(payload, texts)

        if card_id not in card_last_texts:
            card_order.append(card_id)
        card_last_texts[card_id] = texts

    cards = []
    for cid in card_order:
        texts = card_last_texts[cid]
        if len(texts) == 0:
            continue  # not a real flashcard (document/page container record)
        front = texts[0].strip() if len(texts) > 0 else ''
        back = texts[1].strip() if len(texts) > 1 else ''
        cards.append({'front': front, 'back': back})
    return cards


def main():
    if len(sys.argv) != 3:
        print("usage: python extract_flashcards.py <input.goodnotes> <output.json>")
        sys.exit(1)
    infile, outfile = sys.argv[1], sys.argv[2]

    with zipfile.ZipFile(infile) as z:
        events_bytes = z.read('index.events.pb')

    cards = extract_cards(events_bytes)

    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)

    print(f"Extracted {len(cards)} flashcards from {infile} -> {outfile}")


if __name__ == '__main__':
    main()
