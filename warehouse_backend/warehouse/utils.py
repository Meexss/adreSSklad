import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def read_json(filename):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as file:
        return json.load(file)

def write_json(filename, data):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)