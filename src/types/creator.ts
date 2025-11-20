import { Puzzle, PuzzleCell, Clue } from './puzzle';

// Creator-specific cell that supports editing states
export interface CreatorCell extends PuzzleCell {
  isEditing?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

// Enhanced clue with validation and editing states
export interface CreatorClue extends Clue {
  id: string; // Unique identifier for editing
  isValid?: boolean;
  validationErrors?: string[];
  isEditing?: boolean;
  wordCells?: [number, number][]; // Cells that make up this word
}

// Validation result for individual aspects
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Comprehensive puzzle validation
export interface PuzzleValidation {
  overall: ValidationResult;
  grid: ValidationResult;
  clues: ValidationResult;
  connectivity: ValidationResult;
  completeness: ValidationResult;
}

// Creator puzzle extends base puzzle with creation metadata
export interface CreatorPuzzle extends Omit<Puzzle, 'clues' | 'grid'> {
  grid: CreatorCell[][];
  clues: CreatorClue[];
  
  // Creation metadata
  isDraft: boolean;
  createdDate: string;
  lastModified: string;
  version: number;
  
  // Validation state
  validation?: PuzzleValidation;
  
  // Creator settings
  autoNumber: boolean;
  showValidation: boolean;
}

// Saved puzzle with additional metadata
export interface SavedPuzzle {
  id: string;
  title: string;
  author: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  
  // Timestamps
  createdDate: string;
  lastModified: string;
  lastPlayed?: string;
  
  // Status
  isPublished: boolean;
  isDraft: boolean;
  
  // Stats
  timesPlayed?: number;
  averageTime?: number;
  
  // The actual puzzle data
  puzzle: CreatorPuzzle;
}

// Draft auto-save data
export interface PuzzleDraft {
  id: string;
  puzzle: CreatorPuzzle;
  autoSaveTime: string;
}

// Word detection result
export interface DetectedWord {
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
  length: number;
  letters: string;
  cells: [number, number][];
  number?: number;
  hasClue: boolean;
  clueId?: string;
}

// Grid analysis result
export interface GridAnalysis {
  words: DetectedWord[];
  numberedCells: { [key: string]: number }; // "row,col" -> number
  connectivity: {
    isConnected: boolean;
    isolatedRegions: [number, number][][];
  };
  statistics: {
    totalWords: number;
    acrossWords: number;
    downWords: number;
    blackSquares: number;
    whiteSquares: number;
    averageWordLength: number;
  };
}

// Creation history for undo/redo
export interface CreationAction {
  type: 'CELL_TOGGLE' | 'CELL_LETTER' | 'CLUE_ADD' | 'CLUE_EDIT' | 'CLUE_DELETE' | 'GRID_RESIZE';
  timestamp: string;
  data: any;
  description: string;
}

// Creator settings and preferences
export interface CreatorSettings {
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
  showGridNumbers: boolean;
  highlightWords: boolean;
  validateRealTime: boolean;
  defaultSize: 5 | 7 | 8 | 10;
  defaultAuthor: string;
}

// Export/Import formats
export interface ExportData {
  version: string;
  exportDate: string;
  puzzle: SavedPuzzle;
  metadata?: {
    exportedBy?: string;
    source?: string;
  };
}

// Creator mode types
export type CreatorMode = 'grid' | 'clues' | 'test' | 'settings';

// Cell edit modes
export type CellEditMode = 'toggle' | 'letter' | 'number';

// Validation severity levels
export type ValidationSeverity = 'error' | 'warning' | 'info';

// Validation message
export interface ValidationMessage {
  severity: ValidationSeverity;
  message: string;
  location?: {
    row?: number;
    col?: number;
    clueId?: string;
  };
}