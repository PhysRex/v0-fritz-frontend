import { createTestingPinia } from "@pinia/testing"
import { vi } from "vitest"

export const createMockPinia = () => {
  return createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
  })
}

export const mockGame = {
  id: "1",
  board: {
    id: "board-1",
    name: "Forest Adventure",
    description: "A mystical forest board",
    thumbnailUrl: "/images/forest.jpg",
    difficulty: "Medium",
    winRate: 65,
    playCount: 150,
  },
  turnCount: 5,
  createdAt: "2024-01-15T10:00:00Z",
  lastPlayedAt: "2024-01-15T14:30:00Z",
  completedAt: null,
  notes: "Some test notes",
}

export const mockCompletedGame = {
  ...mockGame,
  id: "2",
  completedAt: "2024-01-15T15:00:00Z",
  stats: {
    totalTurns: 8,
    accuracy: 75,
    animals: {
      deer: 2,
      lion: 1,
      elephant: 1,
    },
  },
}

export const mockBoard = {
  id: "board-1",
  name: "Forest Adventure",
  description: "A mystical forest board",
  thumbnailUrl: "/images/forest.jpg",
  difficulty: "Medium",
  winRate: 65,
  playCount: 150,
}

export const mockTurn = {
  id: "1",
  turnNumber: 1,
  tiles: ["A1", "B2", "C3"],
  result: { deer: 1, lion: 0 },
  timestamp: "2024-01-15T14:30:00Z",
}
