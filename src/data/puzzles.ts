import { Puzzle } from '../types/puzzle';

// Sample puzzle collection - you can expand this or load from JSON/API
export const puzzleCollection: Puzzle[] = [
  {
    id: "daily-2025-09-29",
    date: "2025-09-29",
    size: 8,
    title: "Daily Challenge",
    author: "Daily Team",
    grid: [
      [
        { letter: "C", isBlack: false, number: 1 },
        { letter: "O", isBlack: false },
        { letter: "M", isBlack: false },
        { letter: "P", isBlack: false },
        { letter: "U", isBlack: false },
        { letter: "T", isBlack: false },
        { letter: "E", isBlack: false },
        { letter: "R", isBlack: false }
      ],
      [
        { letter: "A", isBlack: false, number: 2 },
        { letter: "", isBlack: true },
        { letter: "O", isBlack: false, number: 3 },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "H", isBlack: false, number: 4 },
        { letter: "", isBlack: true },
        { letter: "E", isBlack: false }
      ],
      [
        { letter: "M", isBlack: false, number: 5 },
        { letter: "E", isBlack: false },
        { letter: "R", isBlack: false },
        { letter: "A", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "E", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "A", isBlack: false }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "L", isBlack: false },
        { letter: "E", isBlack: false },
        { letter: "M", isBlack: false },
        { letter: "O", isBlack: false },
        { letter: "N", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "D", isBlack: false }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "A", isBlack: false, number: 6 },
        { letter: "", isBlack: true },
        { letter: "C", isBlack: false, number: 7 },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "S", isBlack: false }
      ],
      [
        { letter: "T", isBlack: false, number: 8 },
        { letter: "A", isBlack: false },
        { letter: "B", isBlack: false },
        { letter: "L", isBlack: false },
        { letter: "E", isBlack: false },
        { letter: "T", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "L", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "A", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "E", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "R", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ]
    ],
    clues: [
      { number: 1, text: "Electronic calculating machine", answer: "COMPUTER", direction: "across", startRow: 0, startCol: 0 },
      { number: 5, text: "Just", answer: "MERE", direction: "across", startRow: 2, startCol: 0 },
      { number: 8, text: "Portable computer", answer: "TABLET", direction: "across", startRow: 5, startCol: 0 },
      { number: 2, text: "Breakfast food", answer: "MEAL", direction: "down", startRow: 1, startCol: 0 },
      { number: 3, text: "Mouths", answer: "ORAL", direction: "down", startRow: 1, startCol: 2 },
      { number: 4, text: "Opposite of cold", answer: "HEAT", direction: "down", startRow: 1, startCol: 5 },
      { number: 6, text: "Skill", answer: "ABLE", direction: "down", startRow: 4, startCol: 2 },
      { number: 7, text: "Automobile", answer: "CAR", direction: "down", startRow: 4, startCol: 4 }
    ]
  },
  
  {
    id: "daily-2025-09-28",
    date: "2025-09-28",
    size: 8,
    title: "Saturday Special",
    author: "Daily Team",
    grid: [
      [
        { letter: "B", isBlack: false, number: 1 },
        { letter: "O", isBlack: false },
        { letter: "O", isBlack: false },
        { letter: "K", isBlack: false },
        { letter: "S", isBlack: false },
        { letter: "H", isBlack: false },
        { letter: "E", isBlack: false },
        { letter: "L", isBlack: false }
      ],
      [
        { letter: "R", isBlack: false, number: 2 },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "O", isBlack: false, number: 3 },
        { letter: "", isBlack: true },
        { letter: "I", isBlack: false }
      ],
      [
        { letter: "I", isBlack: false, number: 4 },
        { letter: "C", isBlack: false },
        { letter: "E", isBlack: false },
        { letter: "C", isBlack: false },
        { letter: "R", isBlack: false },
        { letter: "E", isBlack: false },
        { letter: "A", isBlack: false },
        { letter: "M", isBlack: false }
      ],
      [
        { letter: "D", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "A", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "E", isBlack: false }
      ],
      [
        { letter: "G", isBlack: false, number: 5 },
        { letter: "U", isBlack: false },
        { letter: "I", isBlack: false },
        { letter: "T", isBlack: false },
        { letter: "A", isBlack: false },
        { letter: "R", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "E", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ]
    ],
    clues: [
      { number: 1, text: "Library furniture", answer: "BOOKSHEL", direction: "across", startRow: 0, startCol: 0 },
      { number: 4, text: "Frozen dessert", answer: "ICECREAM", direction: "across", startRow: 2, startCol: 0 },
      { number: 5, text: "Stringed instrument", answer: "GUITAR", direction: "across", startRow: 4, startCol: 0 },
      { number: 2, text: "Connects", answer: "BRIDGE", direction: "down", startRow: 1, startCol: 0 },
      { number: 3, text: "Ocean", answer: "HEAR", direction: "down", startRow: 1, startCol: 5 }
    ]
  },

  {
    id: "daily-2025-09-27",
    date: "2025-09-27",
    size: 8,
    title: "Friday Fun",
    author: "Weekend Team",
    grid: [
      [
        { letter: "K", isBlack: false, number: 1 },
        { letter: "I", isBlack: false },
        { letter: "T", isBlack: false },
        { letter: "C", isBlack: false },
        { letter: "H", isBlack: false },
        { letter: "E", isBlack: false },
        { letter: "N", isBlack: false },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "H", isBlack: false, number: 2 },
        { letter: "", isBlack: true },
        { letter: "A", isBlack: false, number: 3 },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "G", isBlack: false, number: 4 },
        { letter: "A", isBlack: false },
        { letter: "R", isBlack: false },
        { letter: "D", isBlack: false },
        { letter: "E", isBlack: false },
        { letter: "N", isBlack: false },
        { letter: "S", isBlack: false },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "A", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "G", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "W", isBlack: false, number: 5 },
        { letter: "I", isBlack: false },
        { letter: "N", isBlack: false },
        { letter: "T", isBlack: false },
        { letter: "E", isBlack: false },
        { letter: "R", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "E", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "R", isBlack: false },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ],
      [
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true },
        { letter: "", isBlack: true }
      ]
    ],
    clues: [
      { number: 1, text: "Room for cooking", answer: "KITCHEN", direction: "across", startRow: 0, startCol: 0 },
      { number: 4, text: "Outdoor plant spaces", answer: "GARDENS", direction: "across", startRow: 2, startCol: 0 },
      { number: 5, text: "Cold season", answer: "WINTER", direction: "across", startRow: 4, startCol: 0 },
      { number: 2, text: "Baby goat", answer: "CHEATER", direction: "down", startRow: 1, startCol: 3 },
      { number: 3, text: "Long time period", answer: "AGER", direction: "down", startRow: 1, startCol: 5 }
    ]
  }
];

// Utility functions for puzzle management
export const getPuzzleById = (id: string): Puzzle | undefined => {
  return puzzleCollection.find(puzzle => puzzle.id === id);
};

export const getPuzzleByDate = (date: string): Puzzle | undefined => {
  return puzzleCollection.find(puzzle => puzzle.date === date);
};

export const getTodaysPuzzle = (): Puzzle | undefined => {
  const today = new Date().toISOString().split('T')[0];
  return getPuzzleByDate(today) || puzzleCollection[0]; // Fallback to first puzzle
};

export const getAllPuzzles = (): Puzzle[] => {
  return [...puzzleCollection];
};

export const getPuzzlesBySize = (size: 5 | 7 | 8 | 10): Puzzle[] => {
  return puzzleCollection.filter(puzzle => puzzle.size === size);
};