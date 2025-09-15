import { describe, it, expect, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import GameBoard from "../GameBoard.vue"
import { mockBoard, mockTurn } from "@/test/helpers"

describe("GameBoard", () => {
  let wrapper

  const defaultProps = {
    board: mockBoard,
    selections: ["A1", "B2"],
    history: [mockTurn],
    isSubmitting: false,
    isGameCompleted: false,
  }

  beforeEach(() => {
    wrapper = mount(GameBoard, {
      props: defaultProps,
    })
  })

  describe("rendering", () => {
    it("should render board header with board name", () => {
      expect(wrapper.text()).toContain("Forest Adventure")
    })

    it("should render 9x9 grid", () => {
      const tiles = wrapper.findAll(".board-tile")
      expect(tiles).toHaveLength(81) // 9x9 = 81 tiles
    })

    it("should render legend", () => {
      expect(wrapper.text()).toContain("Hit")
      expect(wrapper.text()).toContain("Miss")
      expect(wrapper.text()).toContain("Selected")
    })

    it("should show selection counter", () => {
      expect(wrapper.text()).toContain("2/3 tiles selected")
    })

    it("should render submit button", () => {
      const submitButton = wrapper.find(".submit-button")
      expect(submitButton.exists()).toBe(true)
    })
  })

  describe("tile coordinates", () => {
    it("should display correct tile coordinates", () => {
      const firstTile = wrapper.find('[data-row="1"][data-col="1"]')
      expect(firstTile.text()).toBe("A1")

      const lastTile = wrapper.find('[data-row="9"][data-col="9"]')
      expect(lastTile.text()).toBe("I9")
    })
  })

  describe("tile selection", () => {
    it("should highlight selected tiles", () => {
      const selectedTiles = wrapper.findAll(".board-tile.selected")
      expect(selectedTiles).toHaveLength(2)
    })

    it("should emit select-tile when tile clicked", async () => {
      const tile = wrapper.find('[data-row="3"][data-col="3"]')
      await tile.trigger("click")

      expect(wrapper.emitted("select-tile")).toBeTruthy()
      expect(wrapper.emitted("select-tile")[0]).toEqual(["C3"])
    })

    it("should not allow selection when game completed", async () => {
      await wrapper.setProps({ isGameCompleted: true })

      const tile = wrapper.find('[data-row="3"][data-col="3"]')
      await tile.trigger("click")

      expect(wrapper.emitted("select-tile")).toBeFalsy()
    })
  })

  describe("keyboard navigation", () => {
    it("should handle arrow key navigation", async () => {
      const board = wrapper.find(".game-board")

      await board.trigger("keydown", { key: "ArrowRight" })
      // Should prevent default and update focused tile
      expect(wrapper.vm.focusedTile).toEqual({ row: 1, col: 2 })
    })

    it("should handle enter key for selection", async () => {
      const tile = wrapper.find('[data-row="1"][data-col="1"]')
      await tile.trigger("keydown", { key: "Enter" })

      expect(wrapper.emitted("select-tile")).toBeTruthy()
    })
  })

  describe("submit button state", () => {
    it("should disable submit when less than 3 selections", () => {
      const submitButton = wrapper.find(".submit-button")
      expect(submitButton.attributes("disabled")).toBeDefined()
    })

    it("should enable submit when exactly 3 selections", async () => {
      await wrapper.setProps({ selections: ["A1", "B2", "C3"] })

      const submitButton = wrapper.find(".submit-button")
      expect(submitButton.attributes("disabled")).toBeUndefined()
    })

    it("should disable submit when submitting", async () => {
      await wrapper.setProps({
        selections: ["A1", "B2", "C3"],
        isSubmitting: true,
      })

      const submitButton = wrapper.find(".submit-button")
      expect(submitButton.attributes("disabled")).toBeDefined()
      expect(wrapper.text()).toContain("Submitting...")
    })

    it("should emit submit-turn when clicked", async () => {
      await wrapper.setProps({ selections: ["A1", "B2", "C3"] })

      const submitButton = wrapper.find(".submit-button")
      await submitButton.trigger("click")

      expect(wrapper.emitted("submit-turn")).toBeTruthy()
    })
  })

  describe("tile history states", () => {
    it("should show hit tiles from history", () => {
      // Mock turn has A1 as a hit (deer: 1)
      const hitTiles = wrapper.findAll(".board-tile.hit")
      expect(hitTiles.length).toBeGreaterThan(0)
    })

    it("should show miss tiles from history", () => {
      const missHistory = [
        {
          ...mockTurn,
          tiles: ["D4", "E5", "F6"],
          result: {}, // No hits
        },
      ]

      wrapper.setProps({ history: missHistory })

      const missTiles = wrapper.findAll(".board-tile.miss")
      expect(missTiles.length).toBeGreaterThan(0)
    })
  })
})
