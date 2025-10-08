import { 
  SavedPuzzle, 
  CreatorPuzzle, 
  ExportData, 
  PuzzleDraft 
} from '../types/creator';

const STORAGE_KEYS = {
  SAVED_PUZZLES: 'dailymini_saved_puzzles',
  DRAFTS: 'dailymini_drafts',
  SETTINGS: 'dailymini_creator_settings'
} as const;

const EXPORT_VERSION = '1.0.0';

/**
 * Local storage management for saved puzzles
 */
export class PuzzleStorageService {
  /**
   * Save a puzzle to local storage
   */
  static savePuzzle(puzzle: SavedPuzzle): void {
    try {
      const saved = this.getSavedPuzzles();
      const existingIndex = saved.findIndex(p => p.id === puzzle.id);
      
      if (existingIndex >= 0) {
        saved[existingIndex] = { ...puzzle, lastModified: new Date().toISOString() };
      } else {
        saved.push(puzzle);
      }
      
      localStorage.setItem(STORAGE_KEYS.SAVED_PUZZLES, JSON.stringify(saved));
    } catch (error) {
      console.error('Failed to save puzzle:', error);
      throw new Error('Failed to save puzzle to local storage');
    }
  }

  /**
   * Get all saved puzzles
   */
  static getSavedPuzzles(): SavedPuzzle[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_PUZZLES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load saved puzzles:', error);
      return [];
    }
  }

  /**
   * Get a specific puzzle by ID
   */
  static getPuzzleById(id: string): SavedPuzzle | null {
    const saved = this.getSavedPuzzles();
    return saved.find(p => p.id === id) || null;
  }

  /**
   * Delete a saved puzzle
   */
  static deletePuzzle(id: string): boolean {
    try {
      const saved = this.getSavedPuzzles();
      const filtered = saved.filter(p => p.id !== id);
      
      if (filtered.length === saved.length) {
        return false; // Puzzle not found
      }
      
      localStorage.setItem(STORAGE_KEYS.SAVED_PUZZLES, JSON.stringify(filtered));
      
      // Also remove any associated draft
      this.deleteDraft(id);
      
      return true;
    } catch (error) {
      console.error('Failed to delete puzzle:', error);
      return false;
    }
  }

  /**
   * Save a draft (auto-save functionality)
   */
  static saveDraft(puzzleId: string, puzzle: CreatorPuzzle): void {
    try {
      const drafts = this.getDrafts();
      const draft: PuzzleDraft = {
        id: puzzleId,
        puzzle,
        autoSaveTime: new Date().toISOString()
      };

      const existingIndex = drafts.findIndex(d => d.id === puzzleId);
      if (existingIndex >= 0) {
        drafts[existingIndex] = draft;
      } else {
        drafts.push(draft);
      }

      // Keep only the last 10 drafts to avoid storage bloat
      if (drafts.length > 10) {
        drafts.sort((a, b) => new Date(b.autoSaveTime).getTime() - new Date(a.autoSaveTime).getTime());
        drafts.splice(10);
      }

      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }

  /**
   * Get all drafts
   */
  static getDrafts(): PuzzleDraft[] {
    try {
      const drafts = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      return drafts ? JSON.parse(drafts) : [];
    } catch (error) {
      console.error('Failed to load drafts:', error);
      return [];
    }
  }

  /**
   * Get a specific draft
   */
  static getDraft(puzzleId: string): PuzzleDraft | null {
    const drafts = this.getDrafts();
    return drafts.find(d => d.id === puzzleId) || null;
  }

  /**
   * Delete a draft
   */
  static deleteDraft(puzzleId: string): void {
    try {
      const drafts = this.getDrafts();
      const filtered = drafts.filter(d => d.id !== puzzleId);
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  }

  /**
   * Clear all storage (for testing/reset)
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVED_PUZZLES);
      localStorage.removeItem(STORAGE_KEYS.DRAFTS);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): {
    savedPuzzles: number;
    drafts: number;
    totalSizeKB: number;
  } {
    try {
      const savedPuzzles = this.getSavedPuzzles().length;
      const drafts = this.getDrafts().length;
      
      const savedData = localStorage.getItem(STORAGE_KEYS.SAVED_PUZZLES) || '';
      const draftData = localStorage.getItem(STORAGE_KEYS.DRAFTS) || '';
      const totalSizeKB = Math.round((savedData.length + draftData.length) / 1024 * 100) / 100;

      return {
        savedPuzzles,
        drafts,
        totalSizeKB
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { savedPuzzles: 0, drafts: 0, totalSizeKB: 0 };
    }
  }
}

/**
 * Export and import functionality
 */
export class PuzzleExportService {
  /**
   * Export a puzzle to downloadable JSON
   */
  static exportPuzzle(puzzle: SavedPuzzle, filename?: string): void {
    try {
      const exportData: ExportData = {
        version: EXPORT_VERSION,
        exportDate: new Date().toISOString(),
        puzzle,
        metadata: {
          exportedBy: 'Daily Mini Crossword Creator',
          source: 'dailymini'
        }
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const downloadFilename = filename || `${puzzle.title.replace(/[^a-z0-9]/gi, '_')}_${puzzle.id}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export puzzle:', error);
      throw new Error('Failed to export puzzle');
    }
  }

  /**
   * Import a puzzle from JSON file
   */
  static async importPuzzle(file: File): Promise<SavedPuzzle> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      // Validate the import data
      if (!data.puzzle || !data.version) {
        throw new Error('Invalid puzzle file format');
      }

      // Check version compatibility (for future use)
      if (data.version !== EXPORT_VERSION) {
        console.warn(`Importing puzzle with different version: ${data.version}`);
      }

      // Ensure the puzzle has a unique ID
      const importedPuzzle: SavedPuzzle = {
        ...data.puzzle,
        id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        lastModified: new Date().toISOString()
      };

      return importedPuzzle;
    } catch (error) {
      console.error('Failed to import puzzle:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to parse puzzle file');
    }
  }

  /**
   * Import puzzle from JSON string (for URL sharing, etc.)
   */
  static importPuzzleFromString(jsonString: string): SavedPuzzle {
    try {
      const data = JSON.parse(jsonString) as ExportData;
      
      if (!data.puzzle || !data.version) {
        throw new Error('Invalid puzzle data format');
      }

      return {
        ...data.puzzle,
        id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to import puzzle from string:', error);
      throw new Error('Invalid puzzle data');
    }
  }

  /**
   * Create shareable puzzle URL (base64 encoded)
   */
  static createShareableUrl(puzzle: SavedPuzzle, baseUrl: string = window.location.origin): string {
    try {
      const exportData: ExportData = {
        version: EXPORT_VERSION,
        exportDate: new Date().toISOString(),
        puzzle
      };

      const jsonString = JSON.stringify(exportData);
      const encoded = btoa(jsonString);
      
      return `${baseUrl}?import=${encoded}`;
    } catch (error) {
      console.error('Failed to create shareable URL:', error);
      throw new Error('Failed to create shareable URL');
    }
  }

  /**
   * Parse puzzle from shareable URL
   */
  static parsePuzzleFromUrl(url: string = window.location.href): SavedPuzzle | null {
    try {
      const urlObj = new URL(url);
      const importData = urlObj.searchParams.get('import');
      
      if (!importData) {
        return null;
      }

      const decoded = atob(importData);
      return this.importPuzzleFromString(decoded);
    } catch (error) {
      console.error('Failed to parse puzzle from URL:', error);
      return null;
    }
  }
}

/**
 * Utility functions for puzzle management
 */
export const puzzleUtils = {
  /**
   * Convert creator puzzle to saved puzzle format
   */
  creatorPuzzleToSaved(
    creatorPuzzle: CreatorPuzzle,
    title?: string,
    author?: string,
    isPublished: boolean = false
  ): SavedPuzzle {
    const now = new Date().toISOString();
    
    return {
      id: creatorPuzzle.id,
      title: title || creatorPuzzle.title || 'Untitled Puzzle',
      author: author || creatorPuzzle.author || 'Anonymous',
      description: '',
      difficulty: 'medium',
      tags: [],
      createdDate: creatorPuzzle.createdDate,
      lastModified: now,
      isPublished,
      isDraft: creatorPuzzle.isDraft,
      timesPlayed: 0,
      puzzle: {
        ...creatorPuzzle,
        lastModified: now
      }
    };
  },

  /**
   * Generate puzzle statistics for display
   */
  generatePuzzleStats(puzzle: CreatorPuzzle): {
    wordCount: number;
    averageWordLength: number;
    fillPercentage: number;
    clueCount: number;
  } {
    const totalCells = puzzle.size * puzzle.size;
    const blackCells = puzzle.grid.flat().filter(cell => cell.isBlack).length;
    const fillPercentage = Math.round(((totalCells - blackCells) / totalCells) * 100);
    
    const words = puzzle.clues.length;
    const totalLetters = puzzle.clues.reduce((sum, clue) => sum + clue.answer.length, 0);
    const averageWordLength = words > 0 ? Math.round((totalLetters / words) * 10) / 10 : 0;

    return {
      wordCount: words,
      averageWordLength,
      fillPercentage,
      clueCount: puzzle.clues.length
    };
  },

  /**
   * Validate file before import
   */
  validateImportFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      return { isValid: false, error: 'File must be a JSON file' };
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      return { isValid: false, error: 'File size must be less than 1MB' };
    }

    return { isValid: true };
  }
};