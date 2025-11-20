import { 
  CreatorPuzzle, 
  CreatorCell, 
  CreatorClue, 
  DetectedWord, 
  GridAnalysis, 
  PuzzleValidation 
} from '../types/creator';
import { Puzzle, PuzzleCell } from '../types/puzzle';

/**
 * Creates an empty crossword grid for the creator
 */
export const createEmptyGrid = (size: 5 | 7 | 8 | 10): CreatorCell[][] => {
  return Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({
      letter: '',
      isBlack: false,
      userInput: '',
      isEditing: false,
      hasError: false
    }))
  );
};

/**
 * Converts a regular puzzle to a creator puzzle
 */
export const puzzleToCreatorPuzzle = (puzzle: Puzzle): CreatorPuzzle => {
  const creatorGrid: CreatorCell[][] = puzzle.grid.map(row =>
    row.map(cell => ({
      ...cell,
      isEditing: false,
      hasError: false
    }))
  );

  const creatorClues: CreatorClue[] = puzzle.clues.map((clue, index) => ({
    ...clue,
    id: `clue-${index}-${clue.direction}-${clue.number}`,
    isValid: true,
    validationErrors: [],
    isEditing: false
  }));

  return {
    ...puzzle,
    grid: creatorGrid,
    clues: creatorClues,
    isDraft: false,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    version: 1,
    autoNumber: true,
    showValidation: true
  };
};

/**
 * Converts a creator puzzle back to a regular puzzle for playing
 */
export const creatorPuzzleToPlayablePuzzle = (creatorPuzzle: CreatorPuzzle): Puzzle => {
  const playableGrid: PuzzleCell[][] = creatorPuzzle.grid.map(row =>
    row.map(cell => ({
      letter: cell.letter,
      isBlack: cell.isBlack,
      number: cell.number,
      userInput: ''
    }))
  );

  const playableClues = creatorPuzzle.clues.map(clue => ({
    number: clue.number,
    text: clue.text,
    answer: clue.answer,
    direction: clue.direction,
    startRow: clue.startRow,
    startCol: clue.startCol
  }));

  return {
    id: creatorPuzzle.id,
    date: creatorPuzzle.date,
    size: creatorPuzzle.size,
    title: creatorPuzzle.title,
    author: creatorPuzzle.author,
    grid: playableGrid,
    clues: playableClues
  };
};

/**
 * Detects all words in the grid (3+ letters)
 */
export const detectWords = (grid: CreatorCell[][]): DetectedWord[] => {
  const words: DetectedWord[] = [];
  const size = grid.length;

  // Helper function to extract word from cells
  const extractWord = (cells: [number, number][]): string => {
    return cells.map(([row, col]) => grid[row][col].letter).join('');
  };

  // Detect across words
  for (let row = 0; row < size; row++) {
    let wordCells: [number, number][] = [];
    
    for (let col = 0; col < size; col++) {
      if (!grid[row][col].isBlack) {
        wordCells.push([row, col]);
      } else {
        // End of word
        if (wordCells.length >= 3) {
          const letters = extractWord(wordCells);
          words.push({
            startRow: wordCells[0][0],
            startCol: wordCells[0][1],
            direction: 'across',
            length: wordCells.length,
            letters,
            cells: [...wordCells],
            hasClue: false
          });
        }
        wordCells = [];
      }
    }
    
    // Check end of row
    if (wordCells.length >= 3) {
      const letters = extractWord(wordCells);
      words.push({
        startRow: wordCells[0][0],
        startCol: wordCells[0][1],
        direction: 'across',
        length: wordCells.length,
        letters,
        cells: [...wordCells],
        hasClue: false
      });
    }
  }

  // Detect down words
  for (let col = 0; col < size; col++) {
    let wordCells: [number, number][] = [];
    
    for (let row = 0; row < size; row++) {
      if (!grid[row][col].isBlack) {
        wordCells.push([row, col]);
      } else {
        // End of word
        if (wordCells.length >= 3) {
          const letters = extractWord(wordCells);
          words.push({
            startRow: wordCells[0][0],
            startCol: wordCells[0][1],
            direction: 'down',
            length: wordCells.length,
            letters,
            cells: [...wordCells],
            hasClue: false
          });
        }
        wordCells = [];
      }
    }
    
    // Check end of column
    if (wordCells.length >= 3) {
      const letters = extractWord(wordCells);
      words.push({
        startRow: wordCells[0][0],
        startCol: wordCells[0][1],
        direction: 'down',
        length: wordCells.length,
        letters,
        cells: [...wordCells],
        hasClue: false
      });
    }
  }

  return words;
};

/**
 * Auto-numbers the grid based on word starts
 */
export const autoNumberGrid = (grid: CreatorCell[][]): CreatorCell[][] => {
  const newGrid: CreatorCell[][] = grid.map(row => 
    row.map(cell => ({ ...cell, number: undefined }))
  );
  const words = detectWords(newGrid);
  
  // Find unique start positions
  const startPositions = new Set<string>();
  words.forEach(word => {
    startPositions.add(`${word.startRow},${word.startCol}`);
  });

  // Number the start positions
  let number = 1;
  for (let row = 0; row < newGrid.length; row++) {
    for (let col = 0; col < newGrid[row].length; col++) {
      if (startPositions.has(`${row},${col}`)) {
        newGrid[row][col].number = number++;
      }
    }
  }

  return newGrid;
};

/**
 * Analyzes the grid for validation and statistics
 */
export const analyzeGrid = (grid: CreatorCell[][], clues: CreatorClue[]): GridAnalysis => {
  const words = detectWords(grid);
  const size = grid.length;

  // Auto-number and get numbered cells
  const numberedGrid = autoNumberGrid(grid);
  const numberedCells: { [key: string]: number } = {};
  
  numberedGrid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.number) {
        numberedCells[`${rowIndex},${colIndex}`] = cell.number;
      }
    });
  });

  // Add numbers to words and check for clues
  words.forEach(word => {
    const key = `${word.startRow},${word.startCol}`;
    word.number = numberedCells[key];
    
    // Check if word has a clue
    const matchingClue = clues.find(clue => 
      clue.startRow === word.startRow && 
      clue.startCol === word.startCol && 
      clue.direction === word.direction
    );
    
    if (matchingClue) {
      word.hasClue = true;
      word.clueId = matchingClue.id;
    }
  });

  // Check connectivity using flood fill
  const visited = Array(size).fill(null).map(() => Array(size).fill(false));
  const regions: [number, number][][] = [];

  const floodFill = (row: number, col: number, region: [number, number][]) => {
    if (row < 0 || row >= size || col < 0 || col >= size || 
        visited[row][col] || grid[row][col].isBlack) {
      return;
    }
    
    visited[row][col] = true;
    region.push([row, col]);
    
    // Check 4 directions
    floodFill(row - 1, col, region);
    floodFill(row + 1, col, region);
    floodFill(row, col - 1, region);
    floodFill(row, col + 1, region);
  };

  // Find all connected regions
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!visited[row][col] && !grid[row][col].isBlack) {
        const region: [number, number][] = [];
        floodFill(row, col, region);
        if (region.length > 0) {
          regions.push(region);
        }
      }
    }
  }

  // Calculate statistics
  const blackSquares = grid.flat().filter(cell => cell.isBlack).length;
  const whiteSquares = size * size - blackSquares;
  const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = words.length > 0 ? totalWordLength / words.length : 0;

  return {
    words,
    numberedCells,
    connectivity: {
      isConnected: regions.length <= 1,
      isolatedRegions: regions.length > 1 ? regions.slice(1) : []
    },
    statistics: {
      totalWords: words.length,
      acrossWords: words.filter(w => w.direction === 'across').length,
      downWords: words.filter(w => w.direction === 'down').length,
      blackSquares,
      whiteSquares,
      averageWordLength
    }
  };
};

/**
 * Validates a creator puzzle
 */
export const validatePuzzle = (puzzle: CreatorPuzzle): PuzzleValidation => {
  const analysis = analyzeGrid(puzzle.grid, puzzle.clues);
  
  // Grid validation
  const gridErrors: string[] = [];
  const gridWarnings: string[] = [];
  
  if (!analysis.connectivity.isConnected) {
    gridErrors.push('Grid has disconnected regions');
  }
  
  if (analysis.statistics.averageWordLength < 4) {
    gridWarnings.push('Average word length is quite short');
  }
  
  if (analysis.statistics.blackSquares > (puzzle.size * puzzle.size * 0.3)) {
    gridWarnings.push('High number of black squares');
  }

  // Clues validation
  const clueErrors: string[] = [];
  const clueWarnings: string[] = [];
  
  const wordsWithoutClues = analysis.words.filter(word => !word.hasClue);
  if (wordsWithoutClues.length > 0) {
    clueErrors.push(`${wordsWithoutClues.length} words missing clues`);
  }
  
  const cluesWithoutWords = puzzle.clues.filter(clue => {
    return !analysis.words.some(word => 
      word.startRow === clue.startRow &&
      word.startCol === clue.startCol &&
      word.direction === clue.direction
    );
  });
  
  if (cluesWithoutWords.length > 0) {
    clueErrors.push(`${cluesWithoutWords.length} clues reference non-existent words`);
  }

  // Completeness validation
  const completenessErrors: string[] = [];
  
  if (!puzzle.title?.trim()) {
    completenessErrors.push('Puzzle needs a title');
  }
  
  if (!puzzle.author?.trim()) {
    completenessErrors.push('Puzzle needs an author');
  }

  // Overall validation
  const allErrors = [...gridErrors, ...clueErrors, ...completenessErrors];
  const allWarnings = [...gridWarnings, ...clueWarnings];

  return {
    overall: {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    },
    grid: {
      isValid: gridErrors.length === 0,
      errors: gridErrors,
      warnings: gridWarnings
    },
    clues: {
      isValid: clueErrors.length === 0,
      errors: clueErrors,
      warnings: clueWarnings
    },
    connectivity: {
      isValid: analysis.connectivity.isConnected,
      errors: analysis.connectivity.isConnected ? [] : ['Grid is not fully connected'],
      warnings: []
    },
    completeness: {
      isValid: completenessErrors.length === 0,
      errors: completenessErrors,
      warnings: []
    }
  };
};

/**
 * Generates a unique ID for new puzzles
 */
export const generatePuzzleId = (title?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const titleSlug = title?.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20) || 'puzzle';
  return `${titleSlug}-${timestamp}-${random}`;
};

/**
 * Creates a new empty creator puzzle
 */
export const createNewPuzzle = (
  size: 5 | 7 | 8 | 10 = 8, 
  title: string = 'Untitled Puzzle',
  author: string = 'Anonymous'
): CreatorPuzzle => {
  const id = generatePuzzleId(title);
  const now = new Date().toISOString();
  
  return {
    id,
    date: now.split('T')[0],
    size,
    title,
    author,
    grid: createEmptyGrid(size),
    clues: [],
    isDraft: true,
    createdDate: now,
    lastModified: now,
    version: 1,
    autoNumber: true,
    showValidation: true
  };
};