import { Clue } from '../types/puzzle';

interface CluePanelProps {
  clues: Clue[];
  direction: 'across' | 'down';
  selectedCell?: [number, number] | null;
  onClueClick?: (clue: Clue) => void;
}

export const CluePanel: React.FC<CluePanelProps> = ({
  clues,
  direction,
  selectedCell,
  onClueClick,
}) => {
  const filteredClues = clues.filter(clue => clue.direction === direction);

  const getClueForCell = (row: number, col: number): Clue | null => {
    return filteredClues.find(clue => {
      const { startRow, startCol, answer } = clue;
      if (direction === 'across') {
        return row === startRow && col >= startCol && col < startCol + answer.length;
      } else {
        return col === startCol && row >= startRow && row < startRow + answer.length;
      }
    }) || null;
  };

  const selectedClue = selectedCell ? getClueForCell(selectedCell[0], selectedCell[1]) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="font-bold text-lg mb-3 capitalize text-gray-900 dark:text-white">{direction}</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredClues.map(clue => {
          const isSelected = selectedClue?.number === clue.number;
          return (
            <button
              key={`${clue.direction}-${clue.number}`}
              className={`
                text-left w-full p-2 rounded transition-colors
                ${isSelected
                  ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white'
                }
              `}
              onClick={() => onClueClick?.(clue)}
            >
              <span className="font-semibold">{clue.number}.</span>{' '}
              <span className="text-sm">{clue.text}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({clue.answer.length} letters)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};