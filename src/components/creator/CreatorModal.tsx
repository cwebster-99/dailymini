import React, { useState, useEffect } from 'react';
import { CreatorGrid } from './CreatorGrid';
import { useCreatorStore } from '../../store/creatorStore';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose }) => {
  const [newPuzzleForm, setNewPuzzleForm] = useState({
    title: '',
    author: '',
    size: 8 as 5 | 7 | 8 | 10
  });

  const {
    currentPuzzle,
    selectedCell,
    editMode,
    validation,
    hasUnsavedChanges,
    createPuzzle,
    savePuzzle,
    toggleCell,
    setCellLetter,
    setSelectedCell,
    setEditMode,
    updateMetadata,
    clearAll
  } = useCreatorStore();

  // Initialize auto-save when component mounts
  useEffect(() => {
    const { enableAutoSave } = useCreatorStore.getState();
    enableAutoSave();
    
    return () => {
      const { disableAutoSave } = useCreatorStore.getState();
      disableAutoSave();
    };
  }, []);

  const handleCreateNew = () => {
    createPuzzle(newPuzzleForm.size, newPuzzleForm.title, newPuzzleForm.author);
  };

  const handleSave = async () => {
    const success = await savePuzzle(false); // Save as draft
    if (success) {
      alert('Puzzle saved successfully!');
    } else {
      alert('Failed to save puzzle. Please try again.');
    }
  };

  const handlePublish = async () => {
    const success = await savePuzzle(true); // Save as published
    if (success) {
      alert('Puzzle published successfully!');
    } else {
      alert('Failed to publish puzzle. Please try again.');
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!shouldClose) return;
    }
    clearAll();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crossword Creator</h2>
            {hasUnsavedChanges && (
              <p className="text-sm text-orange-600">• Unsaved changes</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {!currentPuzzle ? (
            // New Puzzle Form
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Create New Puzzle</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPuzzleForm.title}
                    onChange={(e) => setNewPuzzleForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter puzzle title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={newPuzzleForm.author}
                    onChange={(e) => setNewPuzzleForm(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Enter author name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grid Size
                  </label>
                  <select
                    value={newPuzzleForm.size}
                    onChange={(e) => setNewPuzzleForm(prev => ({ ...prev, size: Number(e.target.value) as 5 | 7 | 8 | 10 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5×5 (Mini)</option>
                    <option value={7}>7×7 (Medium)</option>
                    <option value={8}>8×8 (Large)</option>
                    <option value={10}>10×10 (Extra Large)</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateNew}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Puzzle
                </button>
              </div>
            </div>
          ) : (
            // Creator Interface
            <div className="space-y-6">
              {/* Puzzle Metadata */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={currentPuzzle.title || ''}
                      onChange={(e) => updateMetadata({ title: e.target.value })}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={currentPuzzle.author || ''}
                      onChange={(e) => updateMetadata({ author: e.target.value })}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <select
                      value={currentPuzzle.size}
                      onChange={(e) => updateMetadata({ size: Number(e.target.value) as 5 | 7 | 8 | 10 })}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={5}>5×5</option>
                      <option value={7}>7×7</option>
                      <option value={8}>8×8</option>
                      <option value={10}>10×10</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode('toggle')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      editMode === 'toggle'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Toggle Cells
                  </button>
                  <button
                    onClick={() => setEditMode('letter')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      editMode === 'letter'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Add Letters
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handlePublish}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                  >
                    Publish
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="flex justify-center">
                <CreatorGrid
                  size={currentPuzzle.size}
                  grid={currentPuzzle.grid}
                  selectedCell={selectedCell}
                  onCellClick={(row, col) => setSelectedCell([row, col])}
                  onCellToggle={toggleCell}
                  onCellInput={setCellLetter}
                  editMode={editMode as 'toggle' | 'letter'}
                />
              </div>

              {/* Validation */}
              {validation && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Puzzle Status</h4>
                  
                  {validation.overall.isValid ? (
                    <p className="text-green-600">✓ Puzzle is valid and ready to publish!</p>
                  ) : (
                    <div>
                      <p className="text-red-600 mb-2">Issues found:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                        {validation.overall.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.overall.warnings.length > 0 && (
                    <div className="mt-2">
                      <p className="text-orange-600 mb-1">Warnings:</p>
                      <ul className="text-sm text-orange-600 list-disc list-inside space-y-1">
                        {validation.overall.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p className="font-medium mb-1">Quick Start:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Use "Toggle Cells" mode to click and create black squares for your pattern</li>
                  <li>Switch to "Add Letters" mode to fill in letters for your words</li>
                  <li>Numbers will automatically appear on word start positions</li>
                  <li>Add clues for your words (coming soon!)</li>
                  <li>Save as draft or publish when complete</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};