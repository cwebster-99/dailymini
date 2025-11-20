import { useCallback } from 'react';
import { CreatorCell } from '../../types/creator';

interface CreatorGridProps {
  size: 5 | 7 | 8 | 10;
  grid: CreatorCell[][];
  selectedCell?: [number, number] | null;
  onCellClick?: (row: number, col: number) => void;
  onCellToggle?: (row: number, col: number) => void;
  onCellInput?: (row: number, col: number, letter: string) => void;
  editMode?: 'toggle' | 'letter';
}

export const CreatorGrid: React.FC<CreatorGridProps> = ({
  size,
  grid,
  selectedCell,
  onCellClick,
  onCellToggle,
  onCellInput,
  editMode = 'toggle'
}) => {
  const handleCellClick = useCallback((row: number, col: number) => {
    console.log('Cell clicked:', row, col, 'editMode:', editMode, 'isBlack:', grid[row][col].isBlack);
    onCellClick?.(row, col);
    
    if (editMode === 'toggle') {
      console.log('Calling onCellToggle for:', row, col);
      onCellToggle?.(row, col);
    }
  }, [onCellClick, onCellToggle, editMode, grid]);

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
      return;
    }

    // Handle backspace/delete
    if (key === 'Backspace' || key === 'Delete') {
      onCellInput?.(row, col, '');
      event.preventDefault();
      return;
    }

    // Handle arrow keys for navigation
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
      default:
        return;
    }

    onCellClick?.(nextRow, nextCol);
    event.preventDefault();
  }, [onCellInput, onCellClick, size]);

  const isCellSelected = (row: number, col: number) => {
    return selectedCell && selectedCell[0] === row && selectedCell[1] === col;
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`
          grid gap-1 
          ${size === 5 ? 'grid-cols-5' : size === 7 ? 'grid-cols-7' : size === 8 ? 'grid-cols-8' : 'grid-cols-10'} 
          w-fit border-2 border-gray-800 p-2 bg-white rounded-lg shadow-lg
        `}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                relative w-12 h-12 border border-gray-400
                ${cell.isBlack 
                  ? 'bg-black cursor-pointer' 
                  : isCellSelected(rowIndex, colIndex)
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'bg-white hover:bg-gray-50 cursor-pointer'
                }
                ${cell.hasError ? 'ring-2 ring-red-500' : ''}
              `}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {!cell.isBlack && (
                <>
                  {/* Cell number */}
                  {cell.number && (
                    <span className="absolute top-0 left-0.5 text-xs font-bold text-gray-700 leading-none">
                      {cell.number}
                    </span>
                  )}
                  
                  {/* Input field for the letter */}
                  <input
                    type="text"
                    value={cell.letter || ''}
                    onChange={() => {}} // Handled by onKeyDown
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    onFocus={() => onCellClick?.(rowIndex, colIndex)}
                    className="
                      w-full h-full bg-transparent border-none outline-none 
                      text-center text-lg font-bold text-gray-900
                      focus:bg-blue-50 cursor-pointer
                    "
                    maxLength={1}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={editMode === 'toggle'}
                  />
                </>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Edit mode indicator */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          Mode: <span className="font-semibold capitalize">{editMode}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {editMode === 'toggle' 
            ? 'Click cells to toggle black/white' 
            : 'Click cell and type letter'
          }
        </div>
      </div>
    </div>
  );
};