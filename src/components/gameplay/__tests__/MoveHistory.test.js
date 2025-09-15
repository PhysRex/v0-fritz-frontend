import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import MoveHistory from "../MoveHistory.vue"
import { mockTurn } from "@/test/helpers"

vi.mock("lucide-vue-next", () => ({
  ChevronDownIcon: { template: "<div>ChevronDownIcon</div>" },
}))

describe("MoveHistory", () => {
  let wrapper

  const mockTurns = [
    mockTurn,
    {
      id: "2",
      turnNumber: 2,
      tiles: ["D4", "E5", "F6"],
      result: {},
      timestamp: "2024-01-15T14:35:00Z",
    },
    {
      id: "3",
      turnNumber: 3,
      tiles: ["G7", "H8", "I9"],
      result: { lion: 1 },
      timestamp: "2024-01-15T14:40:00Z",
    },
  ]

  const defaultProps = {
    turns: mockTurns,
    isLoading: false,
  }

  beforeEach(() => {
    wrapper = mount(MoveHistory, {
      props: defaultProps,
    })
  })

  describe("rendering", () => {
    it("should render move history header", () => {
      expect(wrapper.text()).toContain("Move History")
    })

    it("should render loading state", async () => {
      await wrapper.setProps({ isLoading: true })

      expect(wrapper.find(".loading-state").exists()).toBe(true)
      expect(wrapper.text()).toContain("Loading history...")
    })

    it("should render empty state when no turns", async () => {
      await wrapper.setProps({ turns: [] })

      expect(wrapper.find(".empty-state").exists()).toBe(true)
      expect(wrapper.text()).toContain("No moves yet")
    })

    it("should render turn items", () => {
      const turnItems = wrapper.findAll(".turn-item")
      expect(turnItems).toHaveLength(3)
    })
  })

  describe("turn display", () => {
    it("should show turn numbers in descending order", () => {
      const turnHeaders = wrapper.findAll(".turn-number")
      expect(turnHeaders[0].text()).toBe("Turn 3")
      expect(turnHeaders[1].text()).toBe("Turn 2")
      expect(turnHeaders[2].text()).toBe("Turn 1")
    })

    it("should show hit indicators for successful turns", () => {
      const hitIndicators = wrapper.findAll(".hit-indicator")
      expect(hitIndicators.length).toBeGreaterThan(0)
      expect(wrapper.text()).toContain("deer: 1")
      expect(wrapper.text()).toContain("lion: 1")
    })

    it("should show miss indicator for unsuccessful turns", () => {
      const missIndicators = wrapper.findAll(".miss-indicator")
      expect(missIndicators.length).toBeGreaterThan(0)
      expect(wrapper.text()).toContain("Miss")
    })
  })

  describe("turn details expansion", () => {
    it("should expand turn details when header clicked", async () => {
      const turnHeader = wrapper.find(".turn-header")
      await turnHeader.trigger("click")

      expect(wrapper.vm.expandedTurns).toContain("3") // Most recent turn
    })

    it("should show selected tiles in expanded view", async () => {
      const turnHeader = wrapper.find(".turn-header")
      await turnHeader.trigger("click")

      expect(wrapper.text()).toContain("Selected tiles:")
      expect(wrapper.text()).toContain("G7")
      expect(wrapper.text()).toContain("H8")
      expect(wrapper.text()).toContain("I9")
    })

    it("should show formatted timestamp in expanded view", async () => {
      const turnHeader = wrapper.find(".turn-header")
      await turnHeader.trigger("click")

      expect(wrapper.text()).toContain("Jan 15")
    })

    it("should collapse turn details when clicked again", async () => {
      const turnHeader = wrapper.find(".turn-header")

      // Expand
      await turnHeader.trigger("click")
      expect(wrapper.vm.expandedTurns).toContain("3")

      // Collapse
      await turnHeader.trigger("click")
      expect(wrapper.vm.expandedTurns).not.toContain("3")
    })
  })

  describe("expansion controls", () => {
    it("should show expand button when there are turns", () => {
      const expandButton = wrapper.find(".expand-button")
      expect(expandButton.exists()).toBe(true)
    })

    it("should expand all turns when expand button clicked", async () => {
      const expandButton = wrapper.find(".expand-button")
      await expandButton.trigger("click")

      expect(wrapper.vm.isExpanded).toBe(true)
      expect(wrapper.text()).toContain("Collapse")
    })

    it('should show "show more" button when more than 5 turns and not expanded', async () => {
      const manyTurns = Array.from({ length: 10 }, (_, i) => ({
        ...mockTurn,
        id: `${i + 1}`,
        turnNumber: i + 1,
      }))

      await wrapper.setProps({ turns: manyTurns })

      expect(wrapper.find(".show-more").exists()).toBe(true)
      expect(wrapper.text()).toContain("Show all 10 moves")
    })

    it("should limit turns to 5 when not expanded", async () => {
      const manyTurns = Array.from({ length: 10 }, (_, i) => ({
        ...mockTurn,
        id: `${i + 1}`,
        turnNumber: i + 1,
      }))

      await wrapper.setProps({ turns: manyTurns })

      const turnItems = wrapper.findAll(".turn-item")
      expect(turnItems).toHaveLength(5)
    })
  })

  describe("date formatting", () => {
    it("should format timestamps correctly", () => {
      // Should contain formatted date
      expect(wrapper.text()).toMatch(/Jan 15.*\d{1,2}:\d{2}/)
    })
  })
})
