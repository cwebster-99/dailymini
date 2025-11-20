import { create } from 'zustand';
import { 
  CreatorPuzzle, 
  CreatorClue, 
  CreatorMode, 
  CellEditMode,
  PuzzleValidation,
  CreationAction,
  SavedPuzzle
} from '../types/creator';
import { 
  createNewPuzzle, 
  autoNumberGrid, 
  validatePuzzle, 
  analyzeGrid
} from '../utils/creatorUtils';
import { PuzzleStorageService } from '../utils/puzzleExport';

interface CreatorState {
  // Current puzzle being edited
  currentPuzzle: CreatorPuzzle | null;
  
  // UI State
  mode: CreatorMode;
  selectedCell: [number, number] | null;
  editMode: CellEditMode;
  isValidationVisible: boolean;
  
  // Validation
  validation: PuzzleValidation | null;
  
  // History for undo/redo
  history: CreationAction[];
  historyIndex: number;
  maxHistorySize: number;
  
  // Auto-save
  autoSaveInterval: number | null;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  
  // Actions
  // Puzzle management
  createPuzzle: (size?: 5 | 7 | 8 | 10, title?: string, author?: string) => void;
  loadPuzzle: (puzzle: CreatorPuzzle | SavedPuzzle) => void;
  savePuzzle: (publish?: boolean) => Promise<boolean>;
  exportPuzzle: () => void;
  
  // Grid editing
  toggleCell: (row: number, col: number) => void;
  setCellLetter: (row: number, col: number, letter: string) => void;
  clearCell: (row: number, col: number) => void;
  resizeGrid: (newSize: 5 | 7 | 8 | 10) => void;
  
  // Clue management
  addClue: (startRow: number, startCol: number, direction: 'across' | 'down', text: string, answer: string) => void;
  updateClue: (clueId: string, updates: Partial<CreatorClue>) => void;
  deleteClue: (clueId: string) => void;
  
  // UI actions
  setMode: (mode: CreatorMode) => void;
  setSelectedCell: (cell: [number, number] | null) => void;
  setEditMode: (mode: CellEditMode) => void;
  toggleValidation: () => void;
  
  // Validation
  validateCurrentPuzzle: () => void;
  
  // History
  addToHistory: (action: CreationAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Auto-save
  enableAutoSave: (intervalMs?: number) => void;
  disableAutoSave: () => void;
  saveNow: () => void;
  
  // Utility
  updateMetadata: (updates: { title?: string; author?: string; size?: 5 | 7 | 8 | 10 }) => void;
  resetPuzzle: () => void;
  clearAll: () => void;
}

export const useCreatorStore = create<CreatorState>((set, get) => ({
  // Initial state
  currentPuzzle: null,
  mode: 'grid',
  selectedCell: null,
  editMode: 'toggle',
  isValidationVisible: true,
  validation: null,
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  autoSaveInterval: null,
  lastSaved: null,
  hasUnsavedChanges: false,

  // Puzzle management
  createPuzzle: (size = 8, title = 'Untitled Puzzle', author = 'Anonymous') => {
    const newPuzzle = createNewPuzzle(size, title, author);
    
    set({
      currentPuzzle: newPuzzle,
      selectedCell: null,
      validation: null,
      history: [],
      historyIndex: -1,
      hasUnsavedChanges: true,
      lastSaved: null
    });
    
    // Add to history
    get().addToHistory({
      type: 'GRID_RESIZE',
      timestamp: new Date().toISOString(),
      data: { size, title, author },
      description: `Created new ${size}x${size} puzzle`
    });
    
    // Validate the new puzzle
    get().validateCurrentPuzzle();
  },

  loadPuzzle: (puzzle) => {
    let creatorPuzzle: CreatorPuzzle;
    
    if ('puzzle' in puzzle) {
      // It's a SavedPuzzle
      creatorPuzzle = puzzle.puzzle;
    } else {
      // It's already a CreatorPuzzle
      creatorPuzzle = puzzle;
    }
    
    set({
      currentPuzzle: creatorPuzzle,
      selectedCell: null,
      validation: null,
      history: [],
      historyIndex: -1,
      hasUnsavedChanges: false,
      lastSaved: new Date()
    });
    
    get().validateCurrentPuzzle();
  },

  savePuzzle: async (publish = false) => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) return false;
    
    try {
      const savedPuzzle: SavedPuzzle = {
        id: currentPuzzle.id,
        title: currentPuzzle.title || 'Untitled Puzzle',
        author: currentPuzzle.author || 'Anonymous',
        description: '',
        difficulty: 'medium',
        tags: [],
        createdDate: currentPuzzle.createdDate,
        lastModified: new Date().toISOString(),
        isPublished: publish,
        isDraft: !publish,
        timesPlayed: 0,
        puzzle: {
          ...currentPuzzle,
          lastModified: new Date().toISOString(),
          isDraft: !publish
        }
      };
      
      PuzzleStorageService.savePuzzle(savedPuzzle);
      
      set({
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        currentPuzzle: {
          ...currentPuzzle,
          isDraft: !publish,
          lastModified: new Date().toISOString()
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to save puzzle:', error);
      return false;
    }
  },

  exportPuzzle: () => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) return;
    
    // First save the puzzle, then export it
    get().savePuzzle().then(success => {
      if (success) {
        const savedPuzzle = PuzzleStorageService.getPuzzleById(currentPuzzle.id);
        if (savedPuzzle) {
          // This would trigger the download
          // PuzzleExportService.exportPuzzle(savedPuzzle);
          console.log('Puzzle ready for export:', savedPuzzle);
        }
      }
    });
  },

  // Grid editing
  toggleCell: (row, col) => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) {
      console.log('No current puzzle');
      return;
    }
    
    console.log('toggleCell called:', row, col);
    
    // Create a proper deep copy of the grid
    const newGrid = currentPuzzle.grid.map(gridRow => 
      gridRow.map(gridCell => ({ ...gridCell }))
    );
    
    const cell = newGrid[row][col];
    const wasBlack = cell.isBlack;
    
    console.log('Cell before toggle:', { isBlack: wasBlack, letter: cell.letter });
    
    // Toggle the cell state
    newGrid[row][col] = { 
      ...cell, 
      isBlack: !wasBlack,
      letter: wasBlack ? cell.letter : '', // Clear letter if making black
      userInput: '' // Clear user input when toggling
    };
    
    console.log('Cell after toggle:', { isBlack: !wasBlack });
    
    // Auto-number the grid
    const numberedGrid = autoNumberGrid(newGrid);
    
    const updatedPuzzle = {
      ...currentPuzzle,
      grid: numberedGrid,
      lastModified: new Date().toISOString()
    };
    
    set({ 
      currentPuzzle: updatedPuzzle, 
      hasUnsavedChanges: true 
    });
    
    get().addToHistory({
      type: 'CELL_TOGGLE',
      timestamp: new Date().toISOString(),
      data: { row, col, wasBlack },
      description: `Toggled cell ${row},${col}`
    });
    
    get().validateCurrentPuzzle();
  },

  setCellLetter: (row, col, letter) => {
    const { currentPuzzle } = get();
    if (!currentPuzzle || currentPuzzle.grid[row][col].isBlack) return;
    
    const newGrid = [...currentPuzzle.grid];
    const oldLetter = newGrid[row][col].letter;
    newGrid[row][col] = { 
      ...newGrid[row][col], 
      letter: letter.toUpperCase() 
    };
    
    const updatedPuzzle = {
      ...currentPuzzle,
      grid: newGrid,
      lastModified: new Date().toISOString()
    };
    
    set({ 
      currentPuzzle: updatedPuzzle, 
      hasUnsavedChanges: true 
    });
    
    get().addToHistory({
      type: 'CELL_LETTER',
      timestamp: new Date().toISOString(),
      data: { row, col, oldLetter, newLetter: letter.toUpperCase() },
      description: `Set cell ${row},${col} to '${letter.toUpperCase()}'`
    });
    
    get().validateCurrentPuzzle();
  },

  clearCell: (row, col) => {
    get().setCellLetter(row, col, '');
  },

  resizeGrid: (newSize) => {
    const { currentPuzzle } = get();
    if (!currentPuzzle || currentPuzzle.size === newSize) return;
    
    const newPuzzle = createNewPuzzle(newSize, currentPuzzle.title, currentPuzzle.author);
    
    // Copy over existing cells that fit
    const minSize = Math.min(currentPuzzle.size, newSize);
    for (let row = 0; row < minSize; row++) {
      for (let col = 0; col < minSize; col++) {
        newPuzzle.grid[row][col] = { ...currentPuzzle.grid[row][col] };
      }
    }
    
    // Auto-number the new grid
    newPuzzle.grid = autoNumberGrid(newPuzzle.grid);
    
    set({ 
      currentPuzzle: newPuzzle, 
      hasUnsavedChanges: true,
      selectedCell: null 
    });
    
    get().addToHistory({
      type: 'GRID_RESIZE',
      timestamp: new Date().toISOString(),
      data: { oldSize: currentPuzzle.size, newSize },
      description: `Resized grid from ${currentPuzzle.size}x${currentPuzzle.size} to ${newSize}x${newSize}`
    });
    
    get().validateCurrentPuzzle();
  },

  // Clue management
  addClue: (startRow, startCol, direction, text, answer) => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) return;
    
    const clueId = `clue-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const analysis = analyzeGrid(currentPuzzle.grid, currentPuzzle.clues);
    
    // Find the word number for this position
    const word = analysis.words.find(w => 
      w.startRow === startRow && 
      w.startCol === startCol && 
      w.direction === direction
    );
    
    if (!word) {
      console.error('No word found at specified position');
      return;
    }
    
    const newClue: CreatorClue = {
      id: clueId,
      number: word.number || 1,
      text,
      answer: answer.toUpperCase(),
      direction,
      startRow,
      startCol,
      isValid: true,
      validationErrors: [],
      isEditing: false,
      wordCells: word.cells
    };
    
    const updatedPuzzle = {
      ...currentPuzzle,
      clues: [...currentPuzzle.clues, newClue],
      lastModified: new Date().toISOString()
    };
    
    set({ 
      currentPuzzle: updatedPuzzle, 
      hasUnsavedChanges: true 
    });
    
    get().addToHistory({
      type: 'CLUE_ADD',
      timestamp: new Date().toISOString(),
      data: { clue: newClue },
      description: `Added clue ${newClue.number}${direction}`
    });
    
    get().validateCurrentPuzzle();
  },

  updateClue: (clueId, updates) => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) return;
    
    const newClues = currentPuzzle.clues.map(clue =>
      clue.id === clueId ? { ...clue, ...updates } : clue
    );
    
    const updatedPuzzle = {
      ...currentPuzzle,
      clues: newClues,
      lastModified: new Date().toISOString()
    };
    
    set({ 
      currentPuzzle: updatedPuzzle, 
      hasUnsavedChanges: true 
    });
    
    get().addToHistory({
      type: 'CLUE_EDIT',
      timestamp: new Date().toISOString(),
      data: { clueId, updates },
      description: `Updated clue ${clueId}`
    });
    
    get().validateCurrentPuzzle();
  },

  deleteClue: (clueId) => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) return;
    
    const clueToDelete = currentPuzzle.clues.find(c => c.id === clueId);
    const newClues = currentPuzzle.clues.filter(clue => clue.id !== clueId);
    
    const updatedPuzzle = {
      ...currentPuzzle,
      clues: newClues,
      lastModified: new Date().toISOString()
    };
    
    set({ 
      currentPuzzle: updatedPuzzle, 
      hasUnsavedChanges: true 
    });
    
    get().addToHistory({
      type: 'CLUE_DELETE',
      timestamp: new Date().toISOString(),
      data: { clue: clueToDelete },
      description: `Deleted clue ${clueToDelete?.number}${clueToDelete?.direction}`
    });
    
    get().validateCurrentPuzzle();
  },

  // UI actions
  setMode: (mode) => set({ mode }),
  setSelectedCell: (cell) => set({ selectedCell: cell }),
  setEditMode: (editMode) => set({ editMode }),
  toggleValidation: () => set(state => ({ isValidationVisible: !state.isValidationVisible })),

  // Validation
  validateCurrentPuzzle: () => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) return;
    
    const validation = validatePuzzle(currentPuzzle);
    set({ validation });
  },

  // History
  addToHistory: (action) => {
    const { history, historyIndex, maxHistorySize } = get();
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add new action
    newHistory.push(action);
    
    // Limit history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },

  undo: () => {
    const { historyIndex } = get();
    if (historyIndex >= 0) {
      set({ historyIndex: historyIndex - 1 });
      // Note: Actual undo logic would need to be implemented based on action types
      console.log('Undo action - implementation needed');
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ historyIndex: historyIndex + 1 });
      // Note: Actual redo logic would need to be implemented based on action types
      console.log('Redo action - implementation needed');
    }
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex >= 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  // Auto-save
  enableAutoSave: (intervalMs = 30000) => {
    get().disableAutoSave(); // Clear existing interval
    
    const interval = setInterval(() => {
      const { hasUnsavedChanges, currentPuzzle } = get();
      if (hasUnsavedChanges && currentPuzzle) {
        PuzzleStorageService.saveDraft(currentPuzzle.id, currentPuzzle);
        console.log('Auto-saved draft');
      }
    }, intervalMs);
    
    set({ autoSaveInterval: interval });
  },

  disableAutoSave: () => {
    const { autoSaveInterval } = get();
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      set({ autoSaveInterval: null });
    }
  },

  saveNow: () => {
    const { currentPuzzle } = get();
    if (currentPuzzle) {
      PuzzleStorageService.saveDraft(currentPuzzle.id, currentPuzzle);
      set({ 
        lastSaved: new Date(),
        hasUnsavedChanges: false 
      });
    }
  },

  // Utility
  updateMetadata: (updates) => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) return;
    
    const updatedPuzzle = {
      ...currentPuzzle,
      ...updates,
      lastModified: new Date().toISOString()
    };
    
    // Handle size change specially
    if (updates.size && updates.size !== currentPuzzle.size) {
      get().resizeGrid(updates.size);
      return;
    }
    
    set({ 
      currentPuzzle: updatedPuzzle, 
      hasUnsavedChanges: true 
    });
  },

  resetPuzzle: () => {
    const { currentPuzzle } = get();
    if (!currentPuzzle) return;
    
    const resetPuzzle = createNewPuzzle(
      currentPuzzle.size, 
      currentPuzzle.title, 
      currentPuzzle.author
    );
    
    set({
      currentPuzzle: resetPuzzle,
      selectedCell: null,
      validation: null,
      history: [],
      historyIndex: -1,
      hasUnsavedChanges: true
    });
    
    get().validateCurrentPuzzle();
  },

  clearAll: () => {
    get().disableAutoSave();
    set({
      currentPuzzle: null,
      mode: 'grid',
      selectedCell: null,
      editMode: 'toggle',
      isValidationVisible: true,
      validation: null,
      history: [],
      historyIndex: -1,
      autoSaveInterval: null,
      lastSaved: null,
      hasUnsavedChanges: false
    });
  }
}));