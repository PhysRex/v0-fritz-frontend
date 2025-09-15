import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import BoardExplorer from "../BoardExplorer.vue"
import { mockBoard } from "@/test/helpers"

vi.mock("lucide-vue-next", () => ({
  SearchIcon: { template: "<div>SearchIcon</div>" },
  TrophyIcon: { template: "<div>TrophyIcon</div>" },
  UsersIcon: { template: "<div>UsersIcon</div>" },
}))

describe("BoardExplorer", () => {
  let wrapper

  const defaultProps = {
    boards: [
      mockBoard,
      {
        id: "board-2",
        name: "Desert Quest",
        thumbnailUrl: "/images/desert.jpg",
        winRate: 45,
        playCount: 89,
      },
    ],
    selectedBoardId: "board-1",
    isLoading: false,
  }

  beforeEach(() => {
    wrapper = mount(BoardExplorer, {
      props: defaultProps,
    })
  })

  describe("rendering", () => {
    it("should render board explorer header", () => {
      expect(wrapper.text()).toContain("Board Explorer")
      expect(wrapper.find(".search-input").exists()).toBe(true)
    })

    it("should render loading state", async () => {
      await wrapper.setProps({ isLoading: true })

      expect(wrapper.find(".loading-state").exists()).toBe(true)
      expect(wrapper.text()).toContain("Loading boards...")
    })

    it("should render boards list", () => {
      const boardCards = wrapper.findAll(".board-card")
      expect(boardCards).toHaveLength(2)
      expect(wrapper.text()).toContain("Forest Adventure")
      expect(wrapper.text()).toContain("Desert Quest")
    })

    it("should highlight selected board", () => {
      const selectedBoard = wrapper.find(".board-card.selected")
      expect(selectedBoard.exists()).toBe(true)
    })

    it("should show empty state when no boards", async () => {
      await wrapper.setProps({ boards: [] })

      expect(wrapper.find(".empty-state").exists()).toBe(true)
      expect(wrapper.text()).toContain("No boards found")
    })
  })

  describe("search functionality", () => {
    it("should filter boards by search query", async () => {
      const searchInput = wrapper.find(".search-input")
      await searchInput.setValue("Forest")

      const boardCards = wrapper.findAll(".board-card")
      expect(boardCards).toHaveLength(1)
      expect(wrapper.text()).toContain("Forest Adventure")
      expect(wrapper.text()).not.toContain("Desert Quest")
    })

    it("should show all boards when search is cleared", async () => {
      const searchInput = wrapper.find(".search-input")
      await searchInput.setValue("Forest")
      await searchInput.setValue("")

      const boardCards = wrapper.findAll(".board-card")
      expect(boardCards).toHaveLength(2)
    })

    it("should be case insensitive", async () => {
      const searchInput = wrapper.find(".search-input")
      await searchInput.setValue("forest")

      const boardCards = wrapper.findAll(".board-card")
      expect(boardCards).toHaveLength(1)
    })
  })

  describe("board selection", () => {
    it("should emit select-board when board clicked", async () => {
      const boardCard = wrapper.findAll(".board-card")[1] // Desert Quest
      await boardCard.trigger("click")

      expect(wrapper.emitted("select-board")).toBeTruthy()
      expect(wrapper.emitted("select-board")[0]).toEqual(["board-2"])
    })
  })

  describe("board stats display", () => {
    it("should display win rate and play count", () => {
      expect(wrapper.text()).toContain("65% win rate")
      expect(wrapper.text()).toContain("150 plays")
    })
  })
})
