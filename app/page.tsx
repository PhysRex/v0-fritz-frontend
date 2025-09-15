"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

export default function GameBoardDemo() {
  // Get tile coordinate in format "A1", "B2", etc.
  const getTileCoord = (row: number, col: number) => {
    const colLetter = String.fromCharCode(64 + col) // A=1, B=2, etc.
    return `${colLetter}${row}`
  }

  // Animal shape definitions
  const animalShapes = {
    rabbit: [
      [[0, 0]], // 1x1 square
    ],
    deer: [
      [
        [0, 0],
        [0, 1],
      ], // horizontal line
      [
        [0, 0],
        [1, 0],
      ], // vertical line
    ],
    lion: [
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ], // horizontal line
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ], // vertical line
    ],
    eagle: [
      // L shapes (4 rotations) - 3 tiles each
      [
        [0, 0],
        [1, 0],
        [1, 1],
      ], // L pointing right
      [
        [0, 0],
        [0, 1],
        [1, 0],
      ], // L pointing down
      [
        [0, 0],
        [0, 1],
        [1, 1],
      ], // L pointing left
      [
        [0, 1],
        [1, 0],
        [1, 1],
      ], // L pointing up
    ],
    bison: [
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ], // horizontal line
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ], // vertical line
    ],
    zebra: [
      // Z shapes (4 rotations)
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ], // Z horizontal
      [
        [0, 1],
        [1, 0],
        [1, 1],
        [2, 0],
      ], // Z vertical
      [
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
      ], // Z horizontal flipped
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ], // Z vertical flipped
    ],
  }

  // Generate a valid arrangement with no adjacent animals
  const generateValidArrangement = () => {
    const board = Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
    const animalPositions: { [key: string]: string } = {}

    // Helper function to check if a position is valid (no adjacent animals)
    const isValidPosition = (row: number, col: number, shape: number[][]) => {
      // Check if shape fits on board
      for (const [dr, dc] of shape) {
        const newRow = row + dr
        const newCol = col + dc
        if (newRow < 0 || newRow >= 9 || newCol < 0 || newCol >= 9) {
          return false
        }
        if (board[newRow][newCol] !== null) {
          return false
        }
      }

      // Check if any part of the shape is adjacent to existing animals
      for (const [dr, dc] of shape) {
        const newRow = row + dr
        const newCol = col + dc

        // Check all 8 adjacent positions
        for (let adjRow = newRow - 1; adjRow <= newRow + 1; adjRow++) {
          for (let adjCol = newCol - 1; adjCol <= newCol + 1; adjCol++) {
            if (adjRow >= 0 && adjRow < 9 && adjCol >= 0 && adjCol < 9) {
              if (board[adjRow][adjCol] !== null && !(adjRow === newRow && adjCol === newCol)) {
                return false
              }
            }
          }
        }
      }

      return true
    }

    // Helper function to place an animal
    const placeAnimal = (animalType: string, count: number) => {
      const shapes = animalShapes[animalType as keyof typeof animalShapes]
      let placed = 0

      for (let attempt = 0; attempt < 1000 && placed < count; attempt++) {
        const shapeIndex = Math.floor(Math.random() * shapes.length)
        const shape = shapes[shapeIndex]
        const row = Math.floor(Math.random() * 9)
        const col = Math.floor(Math.random() * 9)

        if (isValidPosition(row, col, shape)) {
          // Place the animal
          for (const [dr, dc] of shape) {
            const newRow = row + dr
            const newCol = col + dc
            board[newRow][newCol] = animalType
            const coord = getTileCoord(newRow + 1, newCol + 1)
            animalPositions[coord] = animalType
          }
          placed++
        }
      }

      return placed === count
    }

    // Try to place all animals
    const animals = [
      { type: "rabbit", count: 4 },
      { type: "deer", count: 2 },
      { type: "lion", count: 2 },
      { type: "eagle", count: 2 },
      { type: "bison", count: 1 },
      { type: "zebra", count: 1 },
    ]

    for (const animal of animals) {
      if (!placeAnimal(animal.type, animal.count)) {
        // If we can't place all animals, try again
        return generateValidArrangement()
      }
    }

    return animalPositions
  }

  // Game state
  const [board] = useState({
    name: "Enchanted Forest",
    description: "Find the hidden animals in this mystical woodland",
  })

  const [arrangements] = useState(() => [
    generateValidArrangement(),
    generateValidArrangement(),
    generateValidArrangement(),
  ])

  const [selections, setSelections] = useState<string[]>([])
  const [gameHistory, setGameHistory] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGameCompleted, setIsGameCompleted] = useState(false)
  const [focusedTile, setFocusedTile] = useState({ row: 1, col: 1 })
  const [tileNotes, setTileNotes] = useState<{ [key: string]: string }>({})
  const [guessedAnimals, setGuessedAnimals] = useState<{ [key: string]: string }>({})
  const [showNotesMode, setShowNotesMode] = useState(false)
  const [showGuessMode, setShowGuessMode] = useState(false)
  const [selectedGuessType, setSelectedGuessType] = useState<string>("rabbit")
  const [currentArrangement, setCurrentArrangement] = useState(0)
  const [showDebugBoard, setShowDebugBoard] = useState(false)
  const [guessResults, setGuessResults] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [gameOutcome, setGameOutcome] = useState<"win" | "lose" | null>(null)
  const [correctBoard, setCorrectBoard] = useState<{ [key: string]: string } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const [gameStats, setGameStats] = useState(() => {
    if (typeof window !== "undefined") {
      const savedStats = localStorage.getItem("fritzGameStats")
      return savedStats
        ? JSON.parse(savedStats)
        : {
            totalGames: 0,
            totalWins: 0,
            totalTurnsWonGames: 0,
            currentWinStreak: 0,
            longestWinStreak: 0,
          }
    }
    return { totalGames: 0, totalWins: 0, totalTurnsWonGames: 0, currentWinStreak: 0, longestWinStreak: 0 }
  })

  // Get current animal positions
  const animalPositions = arrangements[currentArrangement] || arrangements[0]

  // Animal emojis for display
  const animalEmojis: { [key: string]: string } = {
    rabbit: "🐰",
    deer: "🦌",
    lion: "🦁",
    eagle: "🦅",
    bison: "🦬",
    zebra: "🦓",
    empty: "❌", // Added for 'X' option
  }

  // Available guess options (removed empty option)
  const guessOptions = [
    { value: "rabbit", label: "🐰 Rabbit", emoji: "🐰" },
    { value: "deer", label: "🦌 Deer", emoji: "🦌" },
    { value: "lion", label: "🦁 Lion", emoji: "🦁" },
    { value: "eagle", label: "🦅 Eagle", emoji: "🦅" },
    { value: "bison", label: "🦬 Bison", emoji: "🦬" },
    { value: "zebra", label: "🦓 Zebra", emoji: "🦓" },
    { value: "empty", label: "❌ Empty", emoji: "❌" }, // Added 'X' option
    { value: "clear", label: "🗑️ Clear", emoji: "🗑️" }, // Clear guess option
  ]

  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Fritz Game! 🎮",
      content: (
        <div>
          <p>Fritz is a strategic animal hunting game where you need to find hidden animals on a 9x9 grid.</p>
          <p>
            <strong>Your Goal:</strong> Find all 28 animal tiles by using clues from your searches!
          </p>
          <div className="tutorial-animals">
            <h4>Animals to Find:</h4>
            <div className="animal-list">
              <div>🐰 4 Rabbits (1 tile each)</div>
              <div>🦌 2 Deer (2 tiles each)</div>
              <div>🦁 2 Lions (3 tiles each)</div>
              <div>🦅 2 Eagles (3 tiles each)</div>
              <div>🦬 1 Bison (4 tiles)</div>
              <div>🦓 1 Zebra (4 tiles)</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Animal Shapes & Rules 📐",
      content: (
        <div>
          <p>Each animal has a specific shape and can be rotated:</p>
          <div className="shape-examples">
            <div className="shape-item">
              <strong>🐰 Rabbit:</strong> Single tile (1x1)
              <div className="shape-visual">
                <div className="shape-grid">
                  <div className="shape-tile filled">■</div>
                </div>
              </div>
            </div>
            <div className="shape-item">
              <strong>🦌 Deer:</strong> 2 tiles in a line
              <div className="shape-visual">
                <div className="shape-grid horizontal">
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                </div>
                <span className="or-text">or</span>
                <div className="shape-grid vertical">
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                </div>
              </div>
            </div>
            <div className="shape-item">
              <strong>🦁 Lion:</strong> 3 tiles in a line
              <div className="shape-visual">
                <div className="shape-grid horizontal">
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                </div>
                <span className="or-text">or</span>
                <div className="shape-grid vertical">
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                </div>
              </div>
            </div>
            <div className="shape-item">
              <strong>🦅 Eagle:</strong> 3 tiles in L-shape (4 rotations)
              <div className="shape-visual">
                <div className="l-shapes">
                  <div className="shape-grid l-shape-1">
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile empty"></div>
                    <div className="shape-tile filled">■</div>
                  </div>
                  <div className="shape-grid l-shape-2">
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile empty"></div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile filled">■</div>
                  </div>
                  <div className="shape-grid l-shape-3">
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile empty"></div>
                  </div>
                  <div className="shape-grid l-shape-4">
                    <div className="shape-tile empty"></div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile filled">■</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="shape-item">
              <strong>🦬 Bison:</strong> 4 tiles in a line
              <div className="shape-visual">
                <div className="shape-grid horizontal">
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                </div>
                <span className="or-text">or</span>
                <div className="shape-grid vertical">
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                  <div className="shape-tile filled">■</div>
                </div>
              </div>
            </div>
            <div className="shape-item">
              <strong>🦓 Zebra:</strong> 4 tiles in Z-shape (2 main orientations)
              <div className="shape-visual">
                <div className="z-shapes">
                  <div className="shape-grid z-shape-1">
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile empty"></div>
                    <div className="shape-tile empty"></div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile filled">■</div>
                  </div>
                  <div className="shape-grid z-shape-2">
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile empty"></div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile filled">■</div>
                    <div className="shape-tile empty"></div>
                    <div className="shape-tile filled">■</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p>
            <strong>Important:</strong> No animals touch each other, not even diagonally!
          </p>
        </div>
      ),
    },
    {
      title: "How to Search 🔍",
      content: (
        <div>
          <p>You search for animals by selecting exactly 3 tiles and clicking "Search Tiles".</p>
          <div className="search-example">
            <h4>Search Results Tell You:</h4>
            <ul>
              <li>
                <strong>Which animals you hit</strong> (e.g., "🦌 1 deer, 🐰 2 rabbits")
              </li>
              <li>
                <strong>How many of each animal</strong> your 3 tiles touched
              </li>
              <li>
                <strong>But NOT which specific tiles</strong> had the animals
              </li>
              <li>
                <strong>But NOT which specific tiles</strong> had the animals
              </li>
            </ul>
          </div>
          <p>Use these clues to deduce where animals are located!</p>
          <div className="tip-box">
            <strong>💡 Pro Tip:</strong> If you search A1, A2, A3 and get "🦌 1 deer", you know one of those tiles is
            part of a deer!
          </div>
        </div>
      ),
    },
    {
      title: "Game Modes 🎯",
      content: (
        <div>
          <p>The game has three modes you can switch between:</p>
          <div className="mode-explanation">
            <div className="mode-item">
              <strong>Select Mode:</strong> Click tiles to select them for searching (max 3 at a time)
            </div>
            <div className="mode-item">
              <strong>📝 Notes Mode:</strong> Click tiles to add notes and track your deductions
            </div>
            <div className="mode-item">
              <strong>🎯 Guess Mode:</strong> Click tiles to mark what animal you think is there
            </div>
          </div>
          <p>Switch modes using the buttons at the bottom of the board.</p>
          <div className="tip-box">
            <strong>💡 Strategy Tip:</strong> Use notes to track clues like "A1-A3 has 1 deer" then use guesses when
            you're confident!
          </div>
        </div>
      ),
    },
    {
      title: "Making Notes 📝",
      content: (
        <div>
          <p>Notes help you track clues and deductions:</p>
          <div className="notes-example">
            <h4>Good Note Examples:</h4>
            <ul>
              <li>"Hit: 1 deer" - This tile was part of a search that found a deer</li>
              <li>"Empty" - You're confident this tile has no animal</li>
              <li>"Maybe 🦁" - This could be part of a lion</li>
              <li>"Not 🐰" - This tile definitely isn't a rabbit</li>
            </ul>
          </div>
          <p>Tiles with notes show a yellow background and display your note text.</p>
          <div className="tip-box">
            <strong>💡 Organization Tip:</strong> Keep notes short and clear. You can always edit them later!
          </div>
        </div>
      ),
    },
    {
      title: "Making Guesses 🎯",
      content: (
        <div>
          <p>When you're confident about an animal's location, make a guess:</p>
          <div className="guess-steps">
            <ol>
              <li>
                Switch to <strong>🎯 Guess Mode</strong>
              </li>
              <li>Select the animal type from the options</li>
              <li>Click tiles to mark them with that animal</li>
              <li>Or select multiple tiles and use "Apply to Selected"</li>
            </ol>
          </div>
          <p>Guessed tiles show a purple background with the animal emoji.</p>
          <div className="warning-box">
            <strong>⚠️ Important:</strong> You must guess ALL 28 animal tiles before you can use Final Submit!
          </div>
        </div>
      ),
    },
    {
      title: "Winning the Game 🏆",
      content: (
        <div>
          <p>To win Fritz, you need to:</p>
          <div className="winning-steps">
            <ol>
              <li>
                <strong>Search tiles</strong> to gather clues about animal locations
              </li>
              <li>
                <strong>Use notes</strong> to track your deductions and eliminate possibilities
              </li>
              <li>
                <strong>Make guesses</strong> for all 28 animal tiles
              </li>
              <li>
                <strong>Click Final Submit</strong> when all animal tiles are guessed
              </li>
            </ol>
          </div>
          <p>The Final Submit button will be red and only available when you've guessed all 28 tiles.</p>
          <div className="success-box">
            <strong>🎉 Victory Condition:</strong> Get all animal locations exactly right to win!
          </div>
          <div className="tip-box">
            <strong>💡 Final Tip:</strong> Take your time! Use the search history and your notes to make logical
            deductions.
          </div>
        </div>
      ),
    },
  ]

  // Check if a tile is in the current selections
  const isTileSelected = (row: number, col: number) => {
    const coord = getTileCoord(row, col)
    return selections.includes(coord)
  }

  // Check if a tile was tested in previous turns (but don't reveal if hit/miss)
  const wasTileTested = (row: number, col: number) => {
    const coord = getTileCoord(row, col)
    return gameHistory.some((turn) => turn.tiles.includes(coord))
  }

  // Get CSS classes for a tile
  const getTileClass = (row: number, col: number) => {
    const coord = getTileCoord(row, col)
    const isSelected = isTileSelected(row, col)
    const isFocused = focusedTile.row === row && focusedTile.col === col
    const wasTested = wasTileTested(row, col)
    const hasNote = tileNotes[coord]
    const hasGuess = guessedAnimals[coord]

    let classes = "board-tile"
    if (isSelected) classes += " selected"
    if (isFocused) classes += " focused"
    if (wasTested) classes += " tested"
    if (hasNote) classes += " has-note"
    if (hasGuess) classes += " has-guess"

    return classes
  }

  // Handle tile click
  const handleTileClick = (row: number, col: number) => {
    if (isGameCompleted) return

    const coord = getTileCoord(row, col)

    if (showNotesMode) {
      // Notes mode - open note editor
      const note = prompt(`Add note for ${coord}:`, tileNotes[coord] || "")
      if (note !== null) {
        setTileNotes((prev) => ({
          ...prev,
          [coord]: note,
        }))
      }
      return
    }

    if (showGuessMode) {
      if (selectedGuessType === "clear") {
        // Remove the guess entirely from the tile
        setGuessedAnimals((prev) => {
          const newGuesses = { ...prev }
          delete newGuesses[coord]
          return newGuesses
        })
      } else {
        // Guess mode - apply selected guess type to this tile
        setGuessedAnimals((prev) => ({
          ...prev,
          [coord]: selectedGuessType,
        }))
      }
      return
    }

    // Normal selection mode
    const index = selections.indexOf(coord)

    if (index === -1) {
      // Add selection if not already selected and less than 3 selections
      if (selections.length < 3) {
        setSelections([...selections, coord])
      }
    } else {
      // Remove selection if already selected
      setSelections(selections.filter((_, i) => i !== index))
    }

    // Update focused tile
    setFocusedTile({ row, col })
  }

  // Handle keyboard navigation
  const handleKeyNavigation = (event: React.KeyboardEvent) => {
    if (isGameCompleted) return

    const { row, col } = focusedTile
    let newRow = row
    let newCol = col

    switch (event.key) {
      case "ArrowUp":
        newRow = Math.max(1, row - 1)
        event.preventDefault()
        break
      case "ArrowDown":
        newRow = Math.min(9, row + 1)
        event.preventDefault()
        break
      case "ArrowLeft":
        newCol = Math.max(1, col - 1)
        event.preventDefault()
        break
      case "ArrowRight":
        newCol = Math.min(9, col + 1)
        event.preventDefault()
        break
      case "Enter":
        handleTileClick(row, col)
        return
    }

    if (newRow !== row || newCol !== col) {
      setFocusedTile({ row: newRow, col: newCol })
    }
  }

  // Apply selected guess to multiple tiles
  const applyGuessToSelected = () => {
    if (selections.length === 0) return

    const newGuesses = { ...guessedAnimals }
    if (selectedGuessType === "clear") {
      // Remove guesses from selected tiles
      selections.forEach((coord) => {
        delete newGuesses[coord]
      })
    } else {
      // Apply guess to selected tiles
      selections.forEach((coord) => {
        newGuesses[coord] = selectedGuessType
      })
    }
    setGuessedAnimals(newGuesses)
    setSelections([]) // Clear selections after applying
  }

  // Submit turn - only reveals hit counts, not locations
  const submitTurn = async () => {
    if (selections.length !== 3) return

    setIsSubmitting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check which animals were hit (but don't reveal locations)
    const result: { [key: string]: number } = {}

    selections.forEach((coord) => {
      const animal = animalPositions[coord as keyof typeof animalPositions]
      if (animal) {
        result[animal] = (result[animal] || 0) + 1
      }
    })

    // Create new turn
    const newTurn = {
      id: Date.now().toString(),
      turnNumber: gameHistory.length + 1,
      tiles: [...selections],
      result: result,
    }

    setGameHistory([...gameHistory, newTurn])
    setSelections([])
    setIsSubmitting(false)
  }

  // Check if all animal tiles have been guessed
  const areAllAnimalTilesGuessed = () => {
    const animalTileCoords = Object.keys(animalPositions)
    return animalTileCoords.every((coord) => {
      const guess = guessedAnimals[coord]
      return guess && guess !== "empty" // Must have a guess and not be marked as empty
    })
  }

  const checkGuesses = () => {
    let correctAnimalTiles = 0
    let totalAnimalTilesInGuesses = 0

    // Count correct animal guesses and total animal guesses made
    Object.entries(guessedAnimals).forEach(([coord, guessedAnimal]) => {
      if (guessedAnimal !== "empty") {
        // Only count actual animal guesses
        totalAnimalTilesInGuesses++
        const actualAnimal = animalPositions[coord as keyof typeof animalPositions]
        if (actualAnimal === guessedAnimal) {
          correctAnimalTiles++
        }
      }
    })

    // Check if all actual animal tiles are correctly guessed
    const allAnimalsCorrectlyGuessed = Object.keys(animalPositions).every((coord) => {
      const guess = guessedAnimals[coord]
      return guess === animalPositions[coord as keyof typeof animalPositions]
    })

    const totalAnimalTiles = Object.keys(animalPositions).length
    const resultText = allAnimalsCorrectlyGuessed
      ? `Final Results:\n${correctAnimalTiles}/${totalAnimalTiles} correct animal guesses!\n\n🎉 Perfect! You found all animals!`
      : `Final Results:\n${correctAnimalTiles}/${totalAnimalTiles} correct animal guesses!\n\nYou lost! Here's the correct board layout:`

    setGuessResults(resultText)
    setCorrectBoard(animalPositions) // Store the correct board for display

    const newGameStats = { ...gameStats }
    newGameStats.totalGames++

    if (allAnimalsCorrectlyGuessed) {
      setIsGameCompleted(true)
      setGameOutcome("win")
      newGameStats.totalWins++
      newGameStats.totalTurnsWonGames += gameHistory.length
      newGameStats.currentWinStreak++
      if (newGameStats.currentWinStreak > newGameStats.longestWinStreak) {
        newGameStats.longestWinStreak = newGameStats.currentWinStreak
      }
    } else {
      setIsGameCompleted(true)
      setGameOutcome("lose")
      newGameStats.currentWinStreak = 0
    }
    setGameStats(newGameStats)
    setShowResultsModal(true)
  }

  // Generate new arrangement
  const generateNewArrangement = () => {
    // Generate a new arrangement and replace the current one
    const newArrangement = generateValidArrangement()
    arrangements[currentArrangement] = newArrangement
    setShowDebugBoard(true)
    resetGame()
  }

  // Demo control functions
  const resetGame = () => {
    setSelections([])
    setGameHistory([])
    setIsGameCompleted(false)
    setIsSubmitting(false)
    setTileNotes({})
    setGuessedAnimals({})
    setShowNotesMode(false)
    setShowGuessMode(false)
    setSelectedGuessType("rabbit")
    setGuessResults(null)
    setShowResultsModal(false)
    setGameOutcome(null)
    setCorrectBoard(null)
    localStorage.removeItem("fritzSavedGame") // Clear saved game on reset
  }

  const simulateGame = () => {
    // Simulate a few turns with realistic results based on current arrangement
    const coords = Object.keys(animalPositions)
    const sampleTiles = [
      [coords[0], coords[1], coords[2]], // Should have some hits
      ["D4", "E5", "F6"], // Might have hits depending on arrangement
      ["G7", "H8", "A5"], // Likely misses
    ]

    const simulatedHistory = sampleTiles.map((tiles, index) => {
      const result: { [key: string]: number } = {}
      tiles.forEach((coord) => {
        const animal = animalPositions[coord as keyof typeof animalPositions]
        if (animal) {
          result[animal] = (result[animal] || 0) + 1
        }
      })

      return {
        id: `sim-${index + 1}`,
        turnNumber: index + 1,
        tiles,
        result,
      }
    })

    setGameHistory(simulatedHistory)

    // Add some sample notes
    setTileNotes({
      [coords[0]]: "Hit in turn 1",
      [coords[1]]: "Hit in turn 1",
      D4: "Tested in turn 2",
      E5: "Tested in turn 2",
    })
  }

  // Tutorial functions
  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1)
    } else {
      setShowTutorial(false)
      setTutorialStep(0)
    }
  }

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1)
    }
  }

  const closeTutorial = () => {
    setShowTutorial(false)
    setTutorialStep(0)
  }

  // Helper functions
  const hasHits = (result: any) => {
    return Object.values(result).some((count: any) => count > 0)
  }

  const formatResult = (result: any) => {
    if (!hasHits(result)) return "All Miss"

    return Object.entries(result)
      .filter(([_, count]) => (count as number) > 0)
      .map(([animal, count]) => `${animalEmojis[animal]} ${count} ${animal}${count > 1 ? "s" : ""}`)
      .join(", ")
  }

  // Count total animal tiles
  const getTotalAnimalTiles = () => {
    return Object.keys(animalPositions).length
  }

  // Render debug board
  const renderDebugBoard = () => {
    if (!showDebugBoard) return null

    return (
      <div className="debug-board">
        <h4>Current Board Layout (Debug View)</h4>
        <div className="debug-grid">
          {Array.from({ length: 9 }, (_, row) =>
            Array.from({ length: 9 }, (_, col) => {
              const coord = getTileCoord(row + 1, col + 1)
              const animal = animalPositions[coord]
              return (
                <div key={coord} className="debug-tile">
                  <div className="debug-coord">{coord}</div>
                  <div className="debug-animal">{animal ? animalEmojis[animal] : ""}</div>
                </div>
              )
            }),
          )}
        </div>
        <button onClick={() => setShowDebugBoard(false)} className="control-button">
          Hide Debug Board
        </button>
      </div>
    )
  }

  // Save/Load Game functions
  const saveGame = () => {
    const savedState = {
      selections,
      gameHistory,
      isGameCompleted,
      tileNotes,
      guessedAnimals,
      currentArrangement,
      gameStats, // Save stats along with game state
    }
    localStorage.setItem("fritzSavedGame", JSON.stringify(savedState))
    alert("Game saved!")
  }

  const loadGame = () => {
    const savedState = localStorage.getItem("fritzSavedGame")
    if (savedState) {
      const parsedState = JSON.parse(savedState)
      setSelections(parsedState.selections || [])
      setGameHistory(parsedState.gameHistory || [])
      setIsGameCompleted(parsedState.isGameCompleted || false)
      setTileNotes(parsedState.tileNotes || {})
      setGuessedAnimals(parsedState.guessedAnimals || {})
      setCurrentArrangement(parsedState.currentArrangement || 0)
      setGameStats(
        parsedState.gameStats || {
          totalGames: 0,
          totalWins: 0,
          totalTurnsWonGames: 0,
          currentWinStreak: 0,
          longestWinStreak: 0,
        },
      )
      alert("Game loaded!")
    } else {
      alert("No saved game found!")
    }
  }

  useEffect(() => {
    // Focus the board on mount for keyboard navigation
    if (boardRef.current) {
      boardRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Save game stats to localStorage whenever they change
    localStorage.setItem("fritzGameStats", JSON.stringify(gameStats))
  }, [gameStats])

  const totalAnimalTiles = getTotalAnimalTiles()
  const allAnimalTilesGuessed = areAllAnimalTilesGuessed()

  const winPercentage =
    gameStats.totalGames > 0 ? ((gameStats.totalWins / gameStats.totalGames) * 100).toFixed(1) : "0.0"
  const averageTurnsToWin =
    gameStats.totalWins > 0 ? (gameStats.totalTurnsWonGames / gameStats.totalWins).toFixed(1) : "N/A"

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>Fritz Game Board Demo</h1>
        <p>Find the hidden animals using clues from your searches</p>
        <button className="tutorial-button" onClick={() => setShowTutorial(true)}>
          📚 Tutorial
        </button>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-modal">
            <div className="tutorial-header">
              <h2>{tutorialSteps[tutorialStep].title}</h2>
              <button className="tutorial-close" onClick={closeTutorial}>
                ×
              </button>
            </div>

            <div className="tutorial-content">{tutorialSteps[tutorialStep].content}</div>

            <div className="tutorial-footer">
              <div className="tutorial-progress">
                Step {tutorialStep + 1} of {tutorialSteps.length}
              </div>
              <div className="tutorial-buttons">
                <button
                  className="tutorial-btn tutorial-btn-secondary"
                  onClick={prevTutorialStep}
                  disabled={tutorialStep === 0}
                >
                  Previous
                </button>
                <button className="tutorial-btn tutorial-btn-primary" onClick={nextTutorialStep}>
                  {tutorialStep === tutorialSteps.length - 1 ? "Start Playing!" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="tutorial-overlay">
          {" "}
          {/* Reusing tutorial-overlay styles */}
          <div className="tutorial-modal">
            <div className="tutorial-header">
              <h2>{gameOutcome === "win" ? "🎉 Victory! 🎉" : "Better Luck Next Time!"}</h2>
              <button className="tutorial-close" onClick={() => setShowResultsModal(false)}>
                ×
              </button>
            </div>
            <div className="tutorial-content">
              <p>{guessResults}</p>
              {correctBoard && (
                <div className="correct-board-display">
                  <h4>Correct Board Layout:</h4>
                  <div className="debug-grid">
                    {" "}
                    {/* Reusing debug-grid styles */}
                    {Array.from({ length: 9 }, (_, row) =>
                      Array.from({ length: 9 }, (_, col) => {
                        const coord = getTileCoord(row + 1, col + 1)
                        const animal = correctBoard[coord]
                        return (
                          <div key={coord} className="debug-tile">
                            <div className="debug-coord">{coord}</div>
                            <div className="debug-animal">{animal ? animalEmojis[animal] : animalEmojis["empty"]}</div>
                          </div>
                        )
                      }),
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="tutorial-footer">
              <button
                className="tutorial-btn tutorial-btn-primary"
                onClick={() => {
                  resetGame()
                  setShowResultsModal(false)
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="demo-content">
        {/* Game Board Component */}
        <div className="game-board-container">
          <div className="board-header">
            <div className="board-info">
              <h2>{board.name}</h2>
              <p className="board-description">{board.description}</p>
              <p className="arrangement-info">Arrangement #{currentArrangement + 1}</p>
            </div>

            <div className="header-right">
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color tested"></div>
                  <span>Tested</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color has-note"></div>
                  <span>Has Note</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color has-guess"></div>
                  <span>Guessed</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color selected"></div>
                  <span>Selected</span>
                </div>
              </div>

              {/* Guess Results Box */}
              {guessResults && (
                <div className="guess-results-box">
                  <button className="close-results" onClick={() => setGuessResults(null)}>
                    ×
                  </button>
                  <pre>{guessResults}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Board with Coordinates */}
          <div className="board-with-coords">
            {/* Column letters (A-I) */}
            <div className="col-labels">
              <div></div> {/* Empty corner */}
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="coord-label">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>

            <div className="board-row-container">
              {/* Row numbers (1-9) */}
              <div className="row-labels">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="coord-label">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Game Board */}
              <div
                className={`game-board ${isGameCompleted ? "completed" : ""}`}
                ref={boardRef}
                onKeyDown={handleKeyNavigation}
                tabIndex={0}
              >
                {Array.from({ length: 9 }, (_, row) =>
                  Array.from({ length: 9 }, (_, col) => {
                    const coord = getTileCoord(row + 1, col + 1)
                    const note = tileNotes[coord]
                    const guess = guessedAnimals[coord]

                    return (
                      <div
                        key={`${row + 1}-${col + 1}`}
                        className={getTileClass(row + 1, col + 1)}
                        data-row={row + 1}
                        data-col={col + 1}
                        tabIndex={isGameCompleted ? -1 : 0}
                        onClick={() => handleTileClick(row + 1, col + 1)}
                        onKeyDown={(e) => e.key === "Enter" && handleTileClick(row + 1, col + 1)}
                        title={note ? `Note: ${note}` : undefined}
                      >
                        <div className="tile-content">
                          {guess ? (
                            <div className="guess-display">{animalEmojis[guess]}</div>
                          ) : note ? (
                            <div className="note-display">{note}</div>
                          ) : null}
                        </div>
                      </div>
                    )
                  }),
                )}
              </div>
            </div>
          </div>

          <div className="board-footer">
            <div className="mode-buttons">
              <button
                className={`mode-button ${!showNotesMode && !showGuessMode ? "active" : ""}`}
                onClick={() => {
                  setShowNotesMode(false)
                  setShowGuessMode(false)
                }}
              >
                Select
              </button>
              <button
                className={`mode-button ${showNotesMode ? "active" : ""}`}
                onClick={() => {
                  setShowNotesMode(!showNotesMode)
                  setShowGuessMode(false)
                }}
              >
                📝 Notes
              </button>
              <button
                className={`mode-button ${showGuessMode ? "active" : ""}`}
                onClick={() => {
                  setShowGuessMode(!showGuessMode)
                  setShowNotesMode(false)
                }}
              >
                🎯 Guess
              </button>
            </div>

            {showGuessMode && (
              <div className="guess-panel">
                <div className="guess-selector">
                  <h4>Choose Action:</h4>
                  <div className="guess-options">
                    {guessOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`guess-option ${selectedGuessType === option.value ? "active" : ""}`}
                        onClick={() => setSelectedGuessType(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {selections.length > 0 && (
                  <div className="bulk-guess-actions">
                    <p>
                      {selectedGuessType === "clear" ? (
                        <>
                          Clear guesses from {selections.length} selected tile{selections.length > 1 ? "s" : ""}:
                        </>
                      ) : (
                        <>
                          Apply{" "}
                          <strong>
                            {guessOptions.find((o) => o.value === selectedGuessType)?.emoji} {selectedGuessType}
                          </strong>{" "}
                          to {selections.length} selected tile{selections.length > 1 ? "s" : ""}:
                        </>
                      )}
                    </p>
                    <button className="apply-guess-button" onClick={applyGuessToSelected}>
                      {selectedGuessType === "clear" ? "Clear Selected" : `Apply to Selected`} ({selections.join(", ")})
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="selection-counter">
              <span>{selections.length}/3 tiles selected</span>
            </div>

            <div className="action-buttons">
              <button className="submit-button" disabled={selections.length !== 3 || isSubmitting} onClick={submitTurn}>
                {isSubmitting ? (
                  <span>
                    <div className="spinner"></div>
                    Searching...
                  </span>
                ) : (
                  <span>Search Tiles</span>
                )}
              </button>

              <button className="final-submit-button" onClick={checkGuesses} title="Submit final answer">
                Final Submit
              </button>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="demo-controls">
          <h3>Game Info</h3>

          <div className="control-group">
            <h4>Game Statistics</h4>
            <div className="stats-display">
              <div>
                Total Games: <span>{gameStats.totalGames}</span>
              </div>
              <div>
                Wins: <span>{gameStats.totalWins}</span>
              </div>
              <div>
                Win %: <span>{winPercentage}%</span>
              </div>
              <div>
                Avg. Turns (Wins): <span>{averageTurnsToWin}</span>
              </div>
              <div>
                Current Win Streak: <span>{gameStats.currentWinStreak}</span>
              </div>
              <div>
                Longest Win Streak: <span>{gameStats.longestWinStreak}</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <h4>Search History</h4>
            <div className="history-list">
              {gameHistory.map((turn) => (
                <div key={turn.id} className="history-item">
                  <strong>Turn {turn.turnNumber}:</strong>
                  <span className="tiles">{turn.tiles.join(", ")}</span>
                  <span className={`result ${hasHits(turn.result) ? "hit" : "miss"}`}>{formatResult(turn.result)}</span>
                </div>
              ))}
              {gameHistory.length === 0 && <div className="no-history">No searches yet</div>}
            </div>
          </div>

          <div className="control-group">
            <h4>Final Submit Status</h4>
            <div className="submit-status">
              <div className="status-item">
                <span>Animal tiles guessed:</span>
                <span className={allAnimalTilesGuessed ? "complete" : "incomplete"}>
                  {Object.keys(guessedAnimals).filter((coord) => guessedAnimals[coord] !== "empty").length}/
                  {totalAnimalTiles}
                </span>
              </div>
              {!allAnimalTilesGuessed && (
                <div className="status-hint">
                  You must guess all {totalAnimalTiles} animal tiles before final submit
                </div>
              )}
            </div>
          </div>

          <div className="control-group">
            <h4>Animal Shapes & Sizes</h4>
            <div className="animal-shapes">
              <div>🐰 Rabbit: 1 tile (1x1)</div>
              <div>🦌 Deer: 2 tiles (line)</div>
              <div>🦁 Lion: 3 tiles (line)</div>
              <div>🦅 Eagle: 3 tiles (L-shape)</div>
              <div>🦬 Bison: 4 tiles (line)</div>
              <div>🦓 Zebra: 4 tiles (Z-shape)</div>
            </div>
          </div>

          <div className="control-group">
            <h4>Target Count</h4>
            <div className="animal-targets">
              <div>
                🐰 4 Rabbits (4 tiles) -{" "}
                {Object.entries(guessedAnimals).filter(([coord, guess]) => guess === "rabbit").length}
                /4
              </div>
              <div>
                🦌 2 Deers (4 tiles) -{" "}
                {Object.entries(guessedAnimals).filter(([coord, guess]) => guess === "deer").length}
                /4
              </div>
              <div>
                🦁 2 Lions (6 tiles) -{" "}
                {Object.entries(guessedAnimals).filter(([coord, guess]) => guess === "lion").length}
                /6
              </div>
              <div>
                🦅 2 Eagles (6 tiles) -{" "}
                {Object.entries(guessedAnimals).filter(([coord, guess]) => guess === "eagle").length}
                /6
              </div>
              <div>
                🦬 1 Bison (4 tiles) -{" "}
                {Object.entries(guessedAnimals).filter(([coord, guess]) => guess === "bison").length}
                /4
              </div>
              <div>
                🦓 1 Zebra (4 tiles) -{" "}
                {Object.entries(guessedAnimals).filter(([coord, guess]) => guess === "zebra").length}
                /4
              </div>
            </div>
            <div className="total-tiles">Total: {totalAnimalTiles} animal tiles</div>
          </div>

          <div className="control-group">
            <h4>How to Play</h4>
            <ul className="instructions">
              <li>Animals have specific shapes and can be rotated</li>
              <li>No animals are adjacent (including diagonally)</li>
              <li>Search 3 tiles at a time to get hit counts</li>
              <li>Use notes to track your deductions</li>
              <li>Guess all animal tiles, then use Final Submit</li>
              <li>Win by correctly identifying all animal locations</li>
            </ul>
          </div>

          <div className="control-group">
            <h4>Demo Controls</h4>
            <button onClick={resetGame} className="control-button">
              Reset Game
            </button>
            <button onClick={simulateGame} className="control-button">
              Simulate Game Progress
            </button>
            <button onClick={generateNewArrangement} className="control-button">
              Generate New Board
            </button>
            <button onClick={() => setShowDebugBoard(!showDebugBoard)} className="control-button">
              {showDebugBoard ? "Hide" : "Show"} Debug Board
            </button>
            <button onClick={saveGame} className="control-button">
              Save Game
            </button>
            <button onClick={loadGame} className="control-button">
              Load Game
            </button>
          </div>

          {renderDebugBoard()}
        </div>
      </div>

      <style jsx>{`
        .demo-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .demo-header {
          text-align: center;
          color: white;
          margin-bottom: 2rem;
          position: relative;
        }

        .demo-header h1 {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .tutorial-button {
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .tutorial-button:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }

        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .tutorial-modal {
          background: white;
          border-radius: 1rem;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .tutorial-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .tutorial-header h2 {
          font-size: 1.75rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .tutorial-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #6b7280;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .tutorial-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .tutorial-content {
          padding: 2rem;
          line-height: 1.6;
          color: #374151;
        }

        .tutorial-content p {
          margin-bottom: 1rem;
        }

        .tutorial-content h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 1.5rem 0 0.75rem 0;
        }

        .tutorial-content ul, .tutorial-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .tutorial-content li {
          margin-bottom: 0.5rem;
        }

        .tutorial-animals {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
        }

        .animal-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .animal-list div {
          background: white;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }

        .shape-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }

        .shape-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .shape-visual {
          font-family: monospace;
          font-size: 1.2rem;
          line-height: 1.2;
          margin-top: 0.5rem;
          color: #3b82f6;
          font-weight: bold;
        }

        .search-example, .mode-explanation, .notes-example, .guess-steps, .winning-steps {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
        }

        .mode-item {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: white;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }

        .tip-box {
          background: #dbeafe;
          border: 1px solid #3b82f6;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
          color: #1e40af;
        }

        .warning-box {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
          color: #92400e;
        }

        .success-box {
          background: #d1fae5;
          border: 1px solid #10b981;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
          color: #065f46;
        }

        .tutorial-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem 2rem 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .tutorial-progress {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .tutorial-buttons {
          display: flex;
          gap: 1rem;
        }

        .tutorial-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .tutorial-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tutorial-btn-primary {
          background: #3b82f6;
          color: white;
        }

        .tutorial-btn-primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .tutorial-btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .tutorial-btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .demo-content {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .game-board-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
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

        .arrangement-info {
          color: #8b5cf6;
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
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

        .legend-color.tested {
          background-color: #e5e7eb;
          border: 2px solid #9ca3af;
        }

        .legend-color.has-note {
          background-color: #fef3c7;
          border: 2px solid #f59e0b;
        }

        .legend-color.has-guess {
          background-color: #ddd6fe;
          border: 2px solid #8b5cf6;
        }

        .legend-color.selected {
          background-color: #3b82f6;
        }

        .guess-results-box {
          position: relative;
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 0.5rem;
          padding: 1rem;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .close-results {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-results:hover {
          color: #374151;
        }

        .guess-results-box pre {
          margin: 0;
          font-family: inherit;
          white-space: pre-wrap;
          font-size: 0.875rem;
          color: #1f2937;
        }

        .board-with-coords {
          /* Removed flex-grow: 1 */
        }

        .col-labels {
          display: grid;
          grid-template-columns: 40px repeat(9, 1fr);
          gap: 0.25rem;
          margin-bottom: 0.25rem;
          max-width: 540px;
          margin-left: auto;
          margin-right: auto;
        }

        .board-row-container {
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 0.25rem;
          max-width: 540px;
          margin-left: auto;
          margin-right: auto;
        }

        .row-labels {
          display: grid;
          grid-template-rows: repeat(9, 1fr);
          gap: 0.25rem;
        }

        .coord-label {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .game-board {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 0.25rem;
          outline: none;
          /* Removed margin-bottom: 1.5rem; */
        }

        .game-board.completed {
          opacity: 0.6;
          pointer-events: none;
        }

        .board-tile {
          aspect-ratio: 1;
          background-color: #f9fafb;
          border: 2px solid #e5e7eb;
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
        }

        .board-tile:hover {
          background-color: #f3f4f6;
          transform: scale(1.05);
        }

        .board-tile:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .board-tile.tested {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }

        .board-tile.has-note {
          background-color: #fef3c7;
          border-color: #f59e0b;
        }

        .board-tile.has-guess {
          background-color: #ddd6fe;
          border-color: #8b5cf6;
        }

        .board-tile.selected {
          background-color: #dbeafe;
          border-color: #3b82f6;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .board-tile.focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .note-display {
          font-size: 0.6rem;
          line-height: 1.1;
          text-align: center;
          padding: 0.1rem;
          word-break: break-word;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .guess-display {
          font-size: 1.5rem;
        }

        .board-footer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem; /* Adjusted margin-top */
        }

        .mode-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .mode-button {
          padding: 0.5rem 1rem;
          border: 2px solid #e5e7eb;
          gap: 0.5rem;
          justify-content: center;
        }

        .mode-button {
          padding: 0.5rem 1rem;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }

        .mode-button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .mode-button:hover:not(.active) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .guess-panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          position: relative;
          z-index: 10;
        }

        .guess-selector h4 {
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .guess-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .guess-option {
          padding: 0.5rem 0.75rem;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          text-align: center;
        }

        .guess-option.active {
          background: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }

        .guess-option:hover:not(.active) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .bulk-guess-actions {
          border-top: 1px solid #e2e8f0;
          padding-top: 1rem;
          text-align: center;
        }

        .bulk-guess-actions p {
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
          color: #374151;
        }

        .apply-guess-button {
          padding: 0.5rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .apply-guess-button:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .selection-counter {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .submit-button, .final-submit-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-button {
          background-color: #3b82f6;
          color: white;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .final-submit-button {
          background-color: #dc2626;
          color: white;
        }

        .final-submit-button:hover:not(:disabled) {
          background-color: #b91c1c;
          transform: translateY(-1px);
        }

        .submit-button:disabled, .final-submit-button:disabled {
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

        .stats-display {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
        }

        .stats-display div span {
          font-weight: 600;
          color: #1f2937;
        }

        .submit-status {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .status-item .complete {
          color: #059669;
          font-weight: 600;
        }

        .status-item .incomplete {
          color: #dc2626;
          font-weight: 600;
        }

        .status-hint {
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
          text-align: center;
          margin-top: 0.5rem;
        }

        .animal-shapes, .animal-targets {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .animal-shapes div, .animal-targets div {
          padding: 0.5rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }

        .total-tiles {
          margin-top: 0.75rem;
          padding: 0.5rem;
          background-color: #ddd6fe;
          border-radius: 0.375rem;
          border: 1px solid #8b5cf6;
          font-weight: 600;
          color: #5b21b6;
          text-align: center;
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

        .debug-board {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
        }

        .debug-board h4 {
          margin: 0 0 1rem 0;
          color: #374151;
          font-size: 1rem;
        }

        .debug-grid {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 2px;
          margin-bottom: 1rem;
        }

        .debug-tile {
          aspect-ratio: 1;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          padding: 1px;
        }

        .debug-coord {
          font-weight: 600;
          color: #6b7280;
          line-height: 1;
        }

        .debug-animal {
          font-size: 0.8rem;
          line-height: 1;
        }

        .correct-board-display {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
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

          .header-right {
            align-items: center;
          }

          .action-buttons {
            flex-direction: column;
          }

          .guess-options {
            grid-template-columns: 1fr 1fr;
          }

          .guess-results-box {
            max-width: 100%;
          }

          .tutorial-button {
            position: static;
            margin-top: 1rem;
          }

          .tutorial-modal {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .tutorial-content {
            padding: 1.5rem;
          }

          .tutorial-header {
            padding: 1.5rem 1.5rem 1rem 1.5rem;
          }

          .tutorial-footer {
            padding: 1rem 1.5rem 1.5rem 1.5rem;
            flex-direction: column;
            gap: 1rem;
          }

          .tutorial-buttons {
            width: 100%;
            justify-content: space-between;
          }

          .shape-examples {
            grid-template-columns: 1fr;
          }

          .animal-list {
            grid-template-columns: 1fr;
          }
        }

        .shape-grid {
          display: inline-grid;
          gap: 2px;
          margin: 0.5rem;
        }

        .shape-grid.horizontal {
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: 1fr;
        }

        .shape-grid.vertical {
          grid-template-columns: 1fr;
          grid-template-rows: repeat(4, 1fr);
        }

        .shape-grid.l-shape-1,
        .shape-grid.l-shape-2,
        .shape-grid.l-shape-3,
        .shape-grid.l-shape-4 {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .shape-grid.z-shape-1 {
          grid-template-columns: 1fr 1fr 1fr; /* 3 columns for horizontal Z */
          grid-template-rows: 1fr 1fr; /* 2 rows for horizontal Z */
        }

        .shape-grid.z-shape-2 {
          grid-template-columns: 1fr 1fr; /* 2 columns for vertical Z */
          grid-template-rows: 1fr 1fr 1fr; /* 3 rows for vertical Z */
        }

        .z-shapes {
          display: flex;
          gap: 2rem;
          align-items: center;
          justify-content: center;
        }

        .shape-tile {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          font-size: 14px;
          font-weight: bold;
        }

        .shape-tile.filled {
          background-color: #3b82f6;
          color: white;
        }

        .shape-tile.empty {
          background-color: transparent;
        }

        .l-shapes,
        .z-shapes {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          justify-content: center;
        }

        .or-text {
          font-style: italic;
          color: #6b7280;
          margin: 0 0.5rem;
        }

        .shape-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 0.75rem;
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        @media (max-width: 480px) {
          .z-shapes {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
