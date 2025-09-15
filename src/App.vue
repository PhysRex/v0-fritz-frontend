<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>Fritz Game Board Demo</h1>
      <p>Interactive 9x9 animal hunting game board</p>
    </div>
    
    <div class="demo-content">
      <!-- Game Board Component -->
      <div class="game-board-container">
        <div class="board-header">
          <div class="board-info">
            <h2>{{ board.name }}</h2>
            <p class="board-description">{{ board.description }}</p>
          </div>
          
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color hit"></div>
              <span>Hit</span>
            </div>
            <div class="legend-item">
              <div class="legend-color miss"></div>
              <span>Miss</span>
            </div>
            <div class="legend-item">
              <div class="legend-color selected"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
        
        <div 
          class="game-board"
          :class="{ 'completed': isGameCompleted }"
          ref="boardRef"
          @keydown="handleKeyNavigation"
          tabindex="0"
        >
          <div 
            v-for="row in 9" 
            :key="`row-${row}`"
            class="board-row"
          >
            <div 
              v-for="col in 9" 
              :key="`${row}-${col}`"
              class="board-tile"
              :class="getTileClass(row, col)"
              :data-row="row"
              :data-col="col"
              :tabindex="isGameCompleted ? -1 : 0"
              @click="handleTileClick(row, col)"
              @keydown.enter.prevent="handleTileClick(row, col)"
            >
              <div class="tile-content">
                {{ getTileCoord(row, col) }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="board-footer">
          <div class="selection-counter">
            <span>{{ selections.length }}/3 tiles selected</span>
          </div>
          
          <button 
            class="submit-button"
            :disabled="selections.length !== 3 || isSubmitting"
            @click="submitTurn"
          >
            <span v-if="isSubmitting">
              <div class="spinner"></div>
              Submitting...
            </span>
            <span v-else>
              Submit Turn
            </span>
          </button>
        </div>
      </div>
      
      <!-- Demo Controls -->
      <div class="demo-controls">
        <h3>Demo Controls</h3>
        
        <div class="control-group">
          <h4>Game State</h4>
          <button @click="resetGame" class="control-button">Reset Game</button>
          <button @click="simulateHits" class="control-button">Simulate Some Hits</button>
          <button @click="simulateMisses" class="control-button">Simulate Some Misses</button>
          <button @click="toggleCompleted" class="control-button">
            {{ isGameCompleted ? 'Resume Game' : 'Complete Game' }}
          </button>
        </div>
        
        <div class="control-group">
          <h4>Turn History</h4>
          <div class="history-list">
            <div v-for="turn in gameHistory" :key="turn.id" class="history-item">
              <strong>Turn {{ turn.turnNumber }}:</strong>
              <span class="tiles">{{ turn.tiles.join(', ') }}</span>
              <span class="result" :class="{ 'hit': hasHits(turn.result), 'miss': !hasHits(turn.result) }">
                {{ formatResult(turn.result) }}
              </span>
            </div>
            <div v-if="gameHistory.length === 0" class="no-history">
              No turns played yet
            </div>
          </div>
        </div>
        
        <div class="control-group">
          <h4>Instructions</h4>
          <ul class="instructions">
            <li>Click tiles to select them (max 3 per turn)</li>
            <li>Use arrow keys for keyboard navigation</li>
            <li>Press Enter to select focused tile</li>
            <li>Green tiles = previous hits</li>
            <li>Red tiles = previous misses</li>
            <li>Blue tiles = current selection</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Game state
const board = ref({
  name: "Enchanted Forest",
  description: "Find the hidden animals in this mystical woodland"
})

const selections = ref([])
const gameHistory = ref([])
const isSubmitting = ref(false)
const isGameCompleted = ref(false)
const focusedTile = ref({ row: 1, col: 1 })
const boardRef = ref(null)

// Sample game history for demonstration
const sampleHistory = [
  {
    id: "1",
    turnNumber: 1,
    tiles: ["A1", "B2", "C3"],
    result: { deer: 1 }
  },
  {
    id: "2", 
    turnNumber: 2,
    tiles: ["D4", "E5", "F6"],
    result: {}
  },
  {
    id: "3",
    turnNumber: 3, 
    tiles: ["G7", "H8", "A5"],
    result: { lion: 1, rabbit: 1 }
  }
]

// Get tile coordinate in format "A1", "B2", etc.
const getTileCoord = (row, col) => {
  const colLetter = String.fromCharCode(64 + col) // A=1, B=2, etc.
  return `${colLetter}${row}`
}

// Check if a tile is in the current selections
const isTileSelected = (row, col) => {
  const coord = getTileCoord(row, col)
  return selections.value.includes(coord)
}

// Check if a tile was a hit in previous turns
const getTileHitStatus = (row, col) => {
  const coord = getTileCoord(row, col)
  
  // Check all previous turns
  for (const turn of gameHistory.value) {
    if (turn.tiles.includes(coord)) {
      // If this tile was selected in this turn
      if (turn.result && Object.values(turn.result).some(count => count > 0)) {
        // At least one hit in this turn - for demo, assume this tile was the hit
        return 'hit'
      } else {
        return 'miss'
      }
    }
  }
  
  return null
}

// Get CSS classes for a tile
const getTileClass = (row, col) => {
  const hitStatus = getTileHitStatus(row, col)
  const isSelected = isTileSelected(row, col)
  const isFocused = focusedTile.value.row === row && focusedTile.value.col === col
  
  return {
    'hit': hitStatus === 'hit',
    'miss': hitStatus === 'miss', 
    'selected': isSelected,
    'focused': isFocused
  }
}

// Handle tile click
const handleTileClick = (row, col) => {
  if (isGameCompleted.value) return
  
  const coord = getTileCoord(row, col)
  const index = selections.value.indexOf(coord)
  
  if (index === -1) {
    // Add selection if not already selected and less than 3 selections
    if (selections.value.length < 3) {
      selections.value.push(coord)
    }
  } else {
    // Remove selection if already selected
    selections.value.splice(index, 1)
  }
  
  // Update focused tile
  focusedTile.value = { row, col }
}

// Handle keyboard navigation
const handleKeyNavigation = (event) => {
  if (isGameCompleted.value) return
  
  const { row, col } = focusedTile.value
  let newRow = row
  let newCol = col
  
  switch (event.key) {
    case 'ArrowUp':
      newRow = Math.max(1, row - 1)
      event.preventDefault()
      break
    case 'ArrowDown':
      newRow = Math.min(9, row + 1)
      event.preventDefault()
      break
    case 'ArrowLeft':
      newCol = Math.max(1, col - 1)
      event.preventDefault()
      break
    case 'ArrowRight':
      newCol = Math.min(9, col + 1)
      event.preventDefault()
      break
    case 'Enter':
      // Enter is handled by the tile itself
      return
  }
  
  if (newRow !== row || newCol !== col) {
    focusedTile.value = { row: newRow, col: newCol }
    
    // Focus the new tile
    const tileElement = boardRef.value?.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`)
    if (tileElement) {
      tileElement.focus()
    }
  }
}

// Submit turn
const submitTurn = async () => {
  if (selections.value.length !== 3) return
  
  isSubmitting.value = true
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Create new turn
  const newTurn = {
    id: Date.now().toString(),
    turnNumber: gameHistory.value.length + 1,
    tiles: [...selections.value],
    result: Math.random() > 0.5 ? { deer: 1 } : {} // Random hit/miss for demo
  }
  
  gameHistory.value.push(newTurn)
  selections.value = []
  isSubmitting.value = false
}

// Demo control functions
const resetGame = () => {
  selections.value = []
  gameHistory.value = []
  isGameCompleted.value = false
  isSubmitting.value = false
}

const simulateHits = () => {
  gameHistory.value = [...sampleHistory]
}

const simulateMisses = () => {
  gameHistory.value = [
    {
      id: "1",
      turnNumber: 1,
      tiles: ["A1", "B2", "C3"],
      result: {}
    },
    {
      id: "2",
      turnNumber: 2,
      tiles: ["D4", "E5", "F6"], 
      result: {}
    }
  ]
}

const toggleCompleted = () => {
  isGameCompleted.value = !isGameCompleted.value
}

// Helper functions
const hasHits = (result) => {
  return Object.values(result).some(count => count > 0)
}

const formatResult = (result) => {
  if (!hasHits(result)) return 'Miss'
  
  return Object.entries(result)
    .filter(([_, count]) => count > 0)
    .map(([animal, count]) => `${animal}: ${count}`)
    .join(', ')
}

onMounted(() => {
  // Focus the board on mount for keyboard navigation
  if (boardRef.value) {
    boardRef.value.focus()
  }
})
</script>

<style scoped>
.demo-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.demo-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.demo-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.game-board-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.board-info h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.board-description {
  color: #6b7280;
  font-size: 0.875rem;
}

.legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
}

.legend-color.hit {
  background-color: #10b981;
}

.legend-color.miss {
  background-color: #ef4444;
}

.legend-color.selected {
  background-color: #3b82f6;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  outline: none;
}

.game-board.completed {
  opacity: 0.6;
  pointer-events: none;
}

.board-tile {
  aspect-ratio: 1;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  outline: none;
  border: 2px solid transparent;
}

.board-tile:hover {
  background-color: #e5e7eb;
  transform: scale(1.05);
}

.board-tile:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.board-tile.hit {
  background-color: #d1fae5;
  color: #065f46;
}

.board-tile.hit:hover {
  background-color: #a7f3d0;
}

.board-tile.miss {
  background-color: #fee2e2;
  color: #991b1b;
}

.board-tile.miss:hover {
  background-color: #fecaca;
}

.board-tile.selected {
  background-color: #dbeafe;
  color: #1e40af;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.board-tile.focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.board-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.selection-counter {
  color: #6b7280;
  font-size: 0.875rem;
}

.submit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.demo-controls {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.demo-controls h3 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.control-group {
  margin-bottom: 1.5rem;
}

.control-group h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.control-button {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.control-button:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.history-item:last-child {
  border-bottom: none;
}

.tiles {
  color: #6b7280;
  font-family: monospace;
}

.result {
  font-weight: 500;
}

.result.hit {
  color: #059669;
}

.result.miss {
  color: #dc2626;
}

.no-history {
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  padding: 1rem 0;
}

.instructions {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instructions li {
  padding: 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  position: relative;
  padding-left: 1rem;
}

.instructions li:before {
  content: "•";
  color: #3b82f6;
  position: absolute;
  left: 0;
}

@media (max-width: 768px) {
  .demo-content {
    grid-template-columns: 1fr;
  }
  
  .board-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .board-footer {
    flex-direction: column;
    text-align: center;
  }
}
</style>
