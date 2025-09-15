import { describe, it, expect, beforeEach, vi } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useBoardsStore } from "../boards"
import { boardsApi } from "@/services/api"
import { mockBoard } from "@/test/helpers"

vi.mock("@/services/api", () => ({
  boardsApi: {
    getBoards: vi.fn(),
    getBoard: vi.fn(),
  },
}))

describe("Boards Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = useBoardsStore()

      expect(store.boards).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe("fetchBoards", () => {
    it("should fetch boards successfully", async () => {
      const mockResponse = { data: [mockBoard] }
      boardsApi.getBoards.mockResolvedValue(mockResponse)

      const store = useBoardsStore()
      await store.fetchBoards()

      expect(store.isLoading).toBe(false)
      expect(store.boards).toEqual([mockBoard])
      expect(store.error).toBe(null)
      expect(boardsApi.getBoards).toHaveBeenCalledOnce()
    })

    it("should handle fetch boards error", async () => {
      const mockError = new Error("Network error")
      boardsApi.getBoards.mockRejectedValue(mockError)

      const store = useBoardsStore()
      await store.fetchBoards()

      expect(store.isLoading).toBe(false)
      expect(store.boards).toEqual([])
      expect(store.error).toBe("Network error")
    })
  })

  describe("getBoardById", () => {
    it("should return correct board by id", () => {
      const store = useBoardsStore()
      store.boards = [mockBoard]

      const board = store.getBoardById("board-1")
      expect(board).toEqual(mockBoard)
    })

    it("should return undefined for non-existent board", () => {
      const store = useBoardsStore()
      store.boards = [mockBoard]

      const board = store.getBoardById("999")
      expect(board).toBeUndefined()
    })
  })
})
