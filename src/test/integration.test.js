import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createRouter, createWebHistory } from "vue-router"
import { createTestingPinia } from "@pinia/testing"
import DashboardView from "@/views/DashboardView.vue"
import { useGamesStore } from "@/stores/games"
import { useBoardsStore } from "@/stores/boards"
import { mockGame, mockBoard } from "@/test/helpers"

// Mock API
vi.mock("@/services/api", () => ({
  gamesApi: {
    getGames: vi.fn().mockResolvedValue({ data: [mockGame] }),
    createGame: vi.fn().mockResolvedValue({ data: { ...mockGame, id: "new-game" } }),
  },
  boardsApi: {
    getBoards: vi.fn().mockResolvedValue({ data: [mockBoard] }),
  },
}))

// Mock components to avoid complex rendering
vi.mock("@/components/dashboard/BoardExplorer.vue", () => ({
  default: { template: "<div>BoardExplorer</div>" },
}))
vi.mock("@/components/dashboard/GameList.vue", () => ({
  default: { template: "<div>GameList</div>" },
}))
vi.mock("@/components/dashboard/SocialFeed.vue", () => ({
  default: { template: "<div>SocialFeed</div>" },
}))
vi.mock("@/components/dashboard/NewGameModal.vue", () => ({
  default: { template: "<div>NewGameModal</div>" },
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/dashboard", name: "dashboard", component: DashboardView },
    { path: "/game/:gameId", name: "gameplay", component: { template: "<div>GamePlay</div>" } },
  ],
})

describe("Dashboard Integration", () => {
  let wrapper
  let pinia

  beforeEach(async () => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    })

    await router.push("/dashboard")
    await router.isReady()

    wrapper = mount(DashboardView, {
      global: {
        plugins: [router, pinia],
      },
    })
  })

  describe("store integration", () => {
    it("should fetch games and boards on mount", async () => {
      const gamesStore = useGamesStore()
      const boardsStore = useBoardsStore()

      // Wait for async operations
      await wrapper.vm.$nextTick()

      expect(gamesStore.fetchGames).toHaveBeenCalled()
      expect(boardsStore.fetchBoards).toHaveBeenCalled()
    })

    it("should handle new game creation flow", async () => {
      const gamesStore = useGamesStore()
      const routerPushSpy = vi.spyOn(router, "push")

      // Simulate creating a new game
      await wrapper.vm.handleStartNewGame("board-1")

      expect(gamesStore.createNewGame).toHaveBeenCalledWith("board-1")
      expect(routerPushSpy).toHaveBeenCalledWith({
        name: "gameplay",
        params: { gameId: "new-game" },
      })
    })

    it("should handle resume game navigation", async () => {
      const routerPushSpy = vi.spyOn(router, "push")

      await wrapper.vm.handleResumeGame("existing-game-id")

      expect(routerPushSpy).toHaveBeenCalledWith({
        name: "gameplay",
        params: { gameId: "existing-game-id" },
      })
    })
  })

  describe("error handling", () => {
    it("should handle game creation errors gracefully", async () => {
      const gamesStore = useGamesStore()
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      gamesStore.createNewGame.mockRejectedValue(new Error("Creation failed"))

      await wrapper.vm.handleStartNewGame("board-1")

      expect(consoleSpy).toHaveBeenCalledWith("Failed to create new game:", expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})
