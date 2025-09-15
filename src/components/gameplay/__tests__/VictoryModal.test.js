import { describe, it, expect, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import VictoryModal from "../VictoryModal.vue"
import { mockCompletedGame } from "@/test/helpers"

describe("VictoryModal", () => {
  let wrapper

  const defaultProps = {
    game: mockCompletedGame,
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

  beforeEach(() => {
    wrapper = mount(VictoryModal, {
      props: defaultProps,
    })
  })

  describe("rendering", () => {
    it("should render victory header", () => {
      expect(wrapper.text()).toContain("Victory!")
      expect(wrapper.text()).toContain("🎉")
    })

    it("should render congratulations message", () => {
      expect(wrapper.text()).toContain("Congratulations!")
      expect(wrapper.text()).toContain("You've found all the animals")
    })

    it("should render stats cards", () => {
      expect(wrapper.text()).toContain("8")
      expect(wrapper.text()).toContain("Total Turns")
      expect(wrapper.text()).toContain("75%")
      expect(wrapper.text()).toContain("Accuracy")
    })

    it("should render completion time", () => {
      expect(wrapper.text()).toContain("Completed")
      expect(wrapper.text()).toContain("Jan 15")
    })
  })

  describe("animals found section", () => {
    it("should render animals found header", () => {
      expect(wrapper.text()).toContain("Animals Found")
    })

    it("should render animal cards with emojis", () => {
      const animalCards = wrapper.findAll(".animal-card")
      expect(animalCards).toHaveLength(3)

      expect(wrapper.text()).toContain("🦌") // deer
      expect(wrapper.text()).toContain("🦁") // lion
      expect(wrapper.text()).toContain("🐘") // elephant
    })

    it("should render animal names", () => {
      expect(wrapper.text()).toContain("deer")
      expect(wrapper.text()).toContain("lion")
      expect(wrapper.text()).toContain("elephant")
    })
  })

  describe("modal actions", () => {
    it("should emit close when close button clicked", async () => {
      const closeButton = wrapper.find(".close-button")
      await closeButton.trigger("click")

      expect(wrapper.emitted("close")).toBeTruthy()
    })

    it("should emit play-again when play again button clicked", async () => {
      const playAgainButton = wrapper.find(".play-again-button")
      await playAgainButton.trigger("click")

      expect(wrapper.emitted("play-again")).toBeTruthy()
    })
  })

  describe("animal emoji mapping", () => {
    it("should return correct emojis for known animals", () => {
      expect(wrapper.vm.getAnimalEmoji("deer")).toBe("🦌")
      expect(wrapper.vm.getAnimalEmoji("lion")).toBe("🦁")
      expect(wrapper.vm.getAnimalEmoji("elephant")).toBe("🐘")
    })

    it("should return default emoji for unknown animals", () => {
      expect(wrapper.vm.getAnimalEmoji("unknown")).toBe("🐾")
    })

    it("should handle case insensitive animal names", () => {
      expect(wrapper.vm.getAnimalEmoji("DEER")).toBe("🦌")
      expect(wrapper.vm.getAnimalEmoji("Lion")).toBe("🦁")
    })
  })

  describe("date formatting", () => {
    it("should format completion date correctly", () => {
      const formattedDate = wrapper.vm.formatTime(mockCompletedGame.completedAt)
      expect(formattedDate).toMatch(/Jan 15.*\d{1,2}:\d{2}/)
    })
  })
})
