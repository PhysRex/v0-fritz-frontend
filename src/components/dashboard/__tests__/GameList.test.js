import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createRouter, createWebHistory } from "vue-router"
import GameList from "../GameList.vue"
import { mockGame, mockCompletedGame } from "@/test/helpers"

// Mock Lucide icons
vi.mock("lucide-vue-next", () => ({
  ChevronUpIcon: { template: "<div>ChevronUpIcon</div>" },
  ChevronDownIcon: { template: "<div>ChevronDownIcon</div>" },
  PlayIcon: { template: "<div>PlayIcon</div>" },
  EyeIcon: { template: "<div>EyeIcon</div>" },
  GameControllerIcon: { template: "<div>GameControllerIcon</div>" },
  TrophyIcon: { template: "<div>TrophyIcon</div>" },
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/game/:gameId", name: "gameplay" }],
})

describe("GameList", () => {
  let wrapper

  const defaultProps = {
    inProgressGames: [mockGame],
    completedGames: [mockCompletedGame],
    isLoading: false,
  }

  beforeEach(() => {
    wrapper = mount(GameList, {
      props: defaultProps,
      global: {
        plugins: [router],
      },
    })
  })

  describe("rendering", () => {
    it("should render loading state", async () => {
      await wrapper.setProps({ isLoading: true })

      expect(wrapper.find(".loading-state").exists()).toBe(true)
      expect(wrapper.text()).toContain("Loading your games...")
    })

    it("should render in progress games", () => {
      const inProgressSection = wrapper.find(".game-section")
      expect(inProgressSection.text()).toContain("In Progress")
      expect(inProgressSection.text()).toContain("Forest Adventure")
    })

    it("should render completed games", () => {
      const sections = wrapper.findAll(".game-section")
      const completedSection = sections[1]
      expect(completedSection.text()).toContain("Completed")
    })

    it("should show empty state when no games", async () => {
      await wrapper.setProps({
        inProgressGames: [],
        completedGames: [],
      })

      const emptySections = wrapper.findAll(".empty-state")
      expect(emptySections).toHaveLength(2)
      expect(wrapper.text()).toContain("No games in progress")
      expect(wrapper.text()).toContain("No completed games yet")
    })
  })

  describe("interactions", () => {
    it("should emit resume-game when resume button clicked", async () => {
      const resumeButton = wrapper.find(".resume-button")
      await resumeButton.trigger("click")

      expect(wrapper.emitted("resume-game")).toBeTruthy()
      expect(wrapper.emitted("resume-game")[0]).toEqual(["1"])
    })

    it("should emit sort-games when sort button clicked", async () => {
      const sortButton = wrapper.find(".sort-button")
      await sortButton.trigger("click")

      expect(wrapper.emitted("sort-games")).toBeTruthy()
    })

    it("should navigate to game when row clicked", async () => {
      const pushSpy = vi.spyOn(router, "push")
      const gameRow = wrapper.find(".game-row")
      await gameRow.trigger("click")

      expect(pushSpy).toHaveBeenCalledWith({
        name: "gameplay",
        params: { gameId: "1" },
      })
    })
  })

  describe("sorting", () => {
    it("should toggle sort direction on same field", async () => {
      const sortButton = wrapper.find(".sort-button")

      // First click - should sort desc
      await sortButton.trigger("click")
      expect(wrapper.emitted("sort-games")[0]).toEqual(["lastPlayed", "desc"])

      // Second click - should sort asc
      await sortButton.trigger("click")
      expect(wrapper.emitted("sort-games")[1]).toEqual(["lastPlayed", "asc"])
    })
  })

  describe("date formatting", () => {
    it("should format dates correctly", () => {
      // The component should display formatted dates
      expect(wrapper.text()).toContain("Jan 15")
    })
  })
})
