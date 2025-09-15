import { describe, it, expect, beforeEach, vi } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useGamesStore } from "../games"
import { gamesApi } from "@/services/api"
import { mockGame, mockCompletedGame } from "@/test/helpers"

// Mock the API
vi.mock("@/services/api", () => ({
  gamesApi: {
    getGames: vi.fn(),
    createGame: vi.fn(),
    getGame: vi.fn(),
    submitTurn: vi.fn(),
    saveNotes: vi.fn(),
    getGameHistory: vi.fn(),
  },
}))

describe("Games Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = useGamesStore()

      expect(store.games).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe("computed properties", () => {
    it("should filter in progress games correctly", () => {
      const store = useGamesStore()
      store.games = [mockGame, mockCompletedGame]

      expect(store.inProgressGames).toHaveLength(1)
      expect(store.inProgressGames[0].id).toBe("1")
    })

    it("should filter completed games correctly", () => {
      const store = useGamesStore()
      store.games = [mockGame, mockCompletedGame]

      expect(store.completedGames).toHaveLength(1)
      expect(store.completedGames[0].id).toBe("2")
    })
  })

  describe("fetchGames", () => {
    it("should fetch games successfully", async () => {
      const mockResponse = { data: [mockGame, mockCompletedGame] }
      gamesApi.getGames.mockResolvedValue(mockResponse)

      const store = useGamesStore()
      await store.fetchGames()

      expect(store.isLoading).toBe(false)
      expect(store.games).toEqual([mockGame, mockCompletedGame])
      expect(store.error).toBe(null)
      expect(gamesApi.getGames).toHaveBeenCalledOnce()
    })

    it("should handle fetch games error", async () => {
      const mockError = new Error("Network error")
      gamesApi.getGames.mockRejectedValue(mockError)

      const store = useGamesStore()
      await store.fetchGames()

      expect(store.isLoading).toBe(false)
      expect(store.games).toEqual([])
      expect(store.error).toBe("Network error")
    })
  })

  describe("createNewGame", () => {
    it("should create a new game successfully", async () => {
      const newGame = { ...mockGame, id: "3" }
      const mockResponse = { data: newGame }
      gamesApi.createGame.mockResolvedValue(mockResponse)

      const store = useGamesStore()
      const gameId = await store.createNewGame("board-1")

      expect(gameId).toBe("3")
      expect(store.games).toContain(newGame)
      expect(gamesApi.createGame).toHaveBeenCalledWith({ boardId: "board-1" })
    })

    it("should handle create game error", async () => {
      const mockError = new Error("Creation failed")
      gamesApi.createGame.mockRejectedValue(mockError)

      const store = useGamesStore()

      await expect(store.createNewGame("board-1")).rejects.toThrow("Creation failed")
      expect(store.error).toBe("Creation failed")
    })
  })

  describe("getGameById", () => {
    it("should return correct game by id", () => {
      const store = useGamesStore()
      store.games = [mockGame, mockCompletedGame]

      const game = store.getGameById("1")
      expect(game).toEqual(mockGame)
    })

    it("should return undefined for non-existent game", () => {
      const store = useGamesStore()
      store.games = [mockGame]

      const game = store.getGameById("999")
      expect(game).toBeUndefined()
    })
  })

  describe("sortGames", () => {
    it("should sort games by lastPlayed descending", () => {
      const store = useGamesStore()
      const game1 = { ...mockGame, id: "1", lastPlayedAt: "2024-01-15T10:00:00Z" }
      const game2 = { ...mockGame, id: "2", lastPlayedAt: "2024-01-15T14:00:00Z" }
      store.games = [game1, game2]

      store.sortGames("lastPlayed", "desc")

      expect(store.games[0].id).toBe("2")
      expect(store.games[1].id).toBe("1")
    })

    it("should sort games by createdAt ascending", () => {
      const store = useGamesStore()
      const game1 = { ...mockGame, id: "1", createdAt: "2024-01-15T14:00:00Z" }
      const game2 = { ...mockGame, id: "2", createdAt: "2024-01-15T10:00:00Z" }
      store.games = [game1, game2]

      store.sortGames("createdAt", "asc")

      expect(store.games[0].id).toBe("2")
      expect(store.games[1].id).toBe("1")
    })
  })

  describe("updateGameAfterTurn", () => {
    it("should update game after turn", () => {
      const store = useGamesStore()
      store.games = [mockGame]

      store.updateGameAfterTurn("1", { turnCount: 6 })

      expect(store.games[0].turnCount).toBe(6)
      expect(store.games[0].lastPlayedAt).toBeDefined()
    })
  })

  describe("completeGame", () => {
    it("should mark game as completed", () => {
      const store = useGamesStore()
      store.games = [mockGame]
      const stats = { totalTurns: 8, accuracy: 75 }

      store.completeGame("1", stats)

      expect(store.games[0].completedAt).toBeDefined()
      expect(store.games[0].stats).toEqual(stats)
    })
  })
})
