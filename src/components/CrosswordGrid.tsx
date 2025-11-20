import { useCallback, useEffect, useRef, useState } from 'react';
import { PuzzleCell, Clue } from '../types/puzzle';

interface CrosswordGridProps {
  size: 5 | 7 | 8 | 10;
  grid: PuzzleCell[][];
  clues: Clue[];
  onCellClick?: (row: number, col: number) => void;
  onCellInput?: (row: number, col: number, value: string) => void;
  selectedCell?: [number, number] | null;
  direction?: 'across' | 'down';
  onDirectionChange?: (direction: 'across' | 'down') => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  size,
  grid,
  clues,
  onCellClick,
  onCellInput,
  selectedCell,
  direction = 'across',
  onDirectionChange,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredWord, setHoveredWord] = useState<{row: number, col: number, direction: 'across' | 'down'} | null>(null);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (grid[row][col].isBlack) return;
    
    // If clicking the same cell, toggle direction
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      onDirectionChange?.(direction === 'across' ? 'down' : 'across');
    } else {
      onCellClick?.(row, col);
    }
  }, [grid, onCellClick, selectedCell, direction, onDirectionChange]);

  const findNextCell = useCallback((row: number, col: number, dir: 'across' | 'down', forward = true): [number, number] | null => {
    const delta = forward ? 1 : -1;
    let nextRow = row;
    let nextCol = col;

    if (dir === 'across') {
      nextCol += delta;
    } else {
      nextRow += delta;
    }

    // Check bounds and if cell is not black
    if (
      nextRow >= 0 && nextRow < size &&
      nextCol >= 0 && nextCol < size &&
      !grid[nextRow][nextCol].isBlack
    ) {
      return [nextRow, nextCol];
    }

    return null;
  }, [grid, size]);

  const handleKeyDown = useCallback((
    event: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    const { key } = event;
    
    // Handle letter input
    if (key.length === 1 && /[A-Za-z]/.test(key)) {
      const value = key.toUpperCase();
      onCellInput?.(row, col, value);
      event.preventDefault();
      
      // Move to next cell in current direction
      const nextCell = findNextCell(row, col, direction, true);
      if (nextCell) {
        onCellClick?.(nextCell[0], nextCell[1]);
      }
      return;
    }

    // Handle backspace/delete
    if (key === 'Backspace' || key === 'Delete') {
      onCellInput?.(row, col, '');
      event.preventDefault();
      
      // Move to previous cell on backspace if current cell is empty
      const currentValue = grid[row][col].userInput || '';
      if (currentValue === '' && key === 'Backspace') {
        const prevCell = findNextCell(row, col, direction, false);
        if (prevCell) {
          onCellClick?.(prevCell[0], prevCell[1]);
        }
      }
      return;
    }

    // Handle arrow keys
    let nextRow = row;
    let nextCol = col;
    
    switch (key) {
      case 'ArrowUp':
        nextRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        nextRow = Math.min(size - 1, row + 1);
        break;
      case 'ArrowLeft':
        nextCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        nextCol = Math.min(size - 1, col + 1);
        break;
      case 'Tab':
        // Tab through non-black cells
        event.preventDefault();
        const tabDirection = event.shiftKey ? false : true;
        const tabNext = findNextCell(row, col, direction, tabDirection);
        if (tabNext) {
          onCellClick?.(tabNext[0], tabNext[1]);
        }
        return;
      case ' ':
        // Spacebar toggles direction
        event.preventDefault();
        onDirectionChange?.(direction === 'across' ? 'down' : 'across');
        return;
      default:
        return;
    }

    // Move to next cell if it's not black
    if (!grid[nextRow][nextCol].isBlack) {
      onCellClick?.(nextRow, nextCol);
      event.preventDefault();
    }
  }, [onCellInput, findNextCell, direction, onCellClick, grid, size, onDirectionChange]);

  // Focus management
  useEffect(() => {
    if (selectedCell && gridRef.current) {
      const [row, col] = selectedCell;
      const input = gridRef.current.querySelector(
        `input[data-row="${row}"][data-col="${col}"]`
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }
  }, [selectedCell]);

  // Find which clue(s) a cell belongs to
  const findCluesForCell = useCallback((row: number, col: number): Clue[] => {
    return clues.filter(clue => {
      const { startRow, startCol, answer, direction } = clue;
      
      if (direction === 'across') {
        return row === startRow && col >= startCol && col < startCol + answer.length;
      } else {
        return col === startCol && row >= startRow && row < startRow + answer.length;
      }
    });
  }, [clues]);

  // Check if cell is part of the currently hovered word
  const isCellInHoveredWord = useCallback((row: number, col: number): boolean => {
    if (!hoveredWord) return false;
    
    const cellClues = findCluesForCell(row, col);
    return cellClues.some(clue => 
      clue.startRow === hoveredWord.row && 
      clue.startCol === hoveredWord.col && 
      clue.direction === hoveredWord.direction
    );
  }, [hoveredWord, findCluesForCell]);

  // Handle mouse enter on cell
  const handleCellMouseEnter = useCallback((row: number, col: number) => {
    if (grid[row][col].isBlack) return;
    
    const cellClues = findCluesForCell(row, col);
    if (cellClues.length > 0) {
      // Prefer the clue that matches current direction, or take the first one
      const preferredClue = cellClues.find(clue => clue.direction === direction) || cellClues[0];
      setHoveredWord({
        row: preferredClue.startRow,
        col: preferredClue.startCol,
        direction: preferredClue.direction
      });
    }
  }, [grid, findCluesForCell, direction]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredWord(null);
  }, []);

  const isCellSelected = (row: number, col: number) => {
    return selectedCell && selectedCell[0] === row && selectedCell[1] === col;
  };

  return (
    <div className="flex justify-center">
      <div 
        ref={gridRef}
        className={`
          grid gap-1 
          ${size === 5 ? 'grid-cols-5' : size === 7 ? 'grid-cols-7' : size === 8 ? 'grid-cols-8' : 'grid-cols-10'} 
          w-fit border-2 border-gray-800 dark:border-gray-200 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg
        `}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                relative w-12 h-12 border border-gray-400
                ${cell.isBlack 
                  ? 'bg-black' 
                  : isCellSelected(rowIndex, colIndex)
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900'
                  : isCellInHoveredWord(rowIndex, colIndex)
                  ? 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-150 dark:hover:bg-yellow-800'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                } cursor-pointer
              `}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
              onMouseLeave={handleMouseLeave}
            >
              {!cell.isBlack && (
                <>
                  {/* Cell number */}
                  {cell.number && (
                    <span className="absolute top-0 left-0.5 text-xs font-bold text-gray-700 dark:text-gray-300 leading-none">
                      {cell.number}
                    </span>
                  )}
                  
                  {/* Input field for the letter */}
                  <input
                    type="text"
                    value={cell.userInput || ''}
                    onChange={() => {}} // Handled by onKeyDown
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    onFocus={() => onCellClick?.(rowIndex, colIndex)}
                    data-row={rowIndex}
                    data-col={colIndex}
                    className="
                      w-full h-full bg-transparent border-none outline-none 
                      text-center text-lg font-bold text-gray-900 dark:text-white
                      focus:bg-blue-50 dark:focus:bg-blue-900 cursor-pointer
                    "
                    maxLength={1}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Direction indicator */}
      <div className="ml-4 flex flex-col justify-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Direction:</div>
        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 capitalize">
          {direction}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          (Press Space to toggle)
        </div>
      </div>
    </div>
  );
};