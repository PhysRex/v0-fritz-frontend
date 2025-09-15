import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import NewGameModal from "../NewGameModal.vue"
import { mockBoard } from "@/test/helpers"

vi.mock("lucide-vue-next", () => ({
  XIcon: { template: "<div>XIcon</div>" },
  TrophyIcon: { template: "<div>TrophyIcon</div>" },
}))

describe("NewGameModal", () => {
  let wrapper

  const defaultProps = {
    boards: [
      mockBoard,
      {
        id: "board-2",
        name: "Desert Quest",
        thumbnailUrl: "/images/desert.jpg",
        difficulty: "Hard",
        winRate: 45,
      },
    ],
    selectedBoardId: "board-1",
  }

  beforeEach(() => {
    wrapper = mount(NewGameModal, {
      props: defaultProps,
    })
  })

  describe("rendering", () => {
    it("should render modal with title", () => {
      expect(wrapper.text()).toContain("Start New Game")
      expect(wrapper.text()).toContain("Select a board to start your new game")
    })

    it("should render board options", () => {
      const boardOptions = wrapper.findAll(".board-option")
      expect(boardOptions).toHaveLength(2)
      expect(wrapper.text()).toContain("Forest Adventure")
      expect(wrapper.text()).toContain("Desert Quest")
    })

    it("should highlight selected board", () => {
      const selectedBoard = wrapper.find(".board-option.selected")
      expect(selectedBoard.exists()).toBe(true)
    })

    it("should show difficulty badges", () => {
      expect(wrapper.text()).toContain("Medium")
      expect(wrapper.text()).toContain("Hard")
    })
  })

  describe("board selection", () => {
    it("should select board when clicked", async () => {
      const boardOption = wrapper.findAll(".board-option")[1]
      await boardOption.trigger("click")

      // Should update local selection
      const selectedBoards = wrapper.findAll(".board-option.selected")
      expect(selectedBoards).toHaveLength(1)
    })

    it("should enable start button when board selected", () => {
      const startButton = wrapper.find(".start-button")
      expect(startButton.attributes("disabled")).toBeUndefined()
    })

    it("should disable start button when no board selected", async () => {
      await wrapper.setProps({ selectedBoardId: null })

      const startButton = wrapper.find(".start-button")
      expect(startButton.attributes("disabled")).toBeDefined()
    })
  })

  describe("modal actions", () => {
    it("should emit close when close button clicked", async () => {
      const closeButton = wrapper.find(".close-button")
      await closeButton.trigger("click")

      expect(wrapper.emitted("close")).toBeTruthy()
    })

    it("should emit close when cancel button clicked", async () => {
      const cancelButton = wrapper.find(".cancel-button")
      await cancelButton.trigger("click")

      expect(wrapper.emitted("close")).toBeTruthy()
    })

    it("should emit start-game when start button clicked", async () => {
      const startButton = wrapper.find(".start-button")
      await startButton.trigger("click")

      expect(wrapper.emitted("start-game")).toBeTruthy()
      expect(wrapper.emitted("start-game")[0]).toEqual(["board-1"])
    })

    it("should emit close when backdrop clicked", async () => {
      const backdrop = wrapper.find(".modal-backdrop")
      await backdrop.trigger("click")

      expect(wrapper.emitted("close")).toBeTruthy()
    })

    it("should not emit close when modal content clicked", async () => {
      const modalContent = wrapper.find(".modal-content")
      await modalContent.trigger("click")

      expect(wrapper.emitted("close")).toBeFalsy()
    })
  })

  describe("difficulty styling", () => {
    it("should apply correct difficulty classes", () => {
      expect(wrapper.find(".difficulty-medium").exists()).toBe(true)
      expect(wrapper.find(".difficulty-hard").exists()).toBe(true)
    })
  })
})
