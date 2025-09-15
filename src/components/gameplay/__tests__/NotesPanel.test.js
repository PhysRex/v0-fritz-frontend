import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import NotesPanel from "../NotesPanel.vue"

describe("NotesPanel", () => {
  let wrapper

  const defaultProps = {
    notes: "Initial notes",
    isGameCompleted: false,
  }

  beforeEach(() => {
    wrapper = mount(NotesPanel, {
      props: defaultProps,
    })
  })

  describe("rendering", () => {
    it("should render notes panel header", () => {
      expect(wrapper.text()).toContain("Notes")
    })

    it("should render textarea with initial notes", () => {
      const textarea = wrapper.find(".notes-textarea")
      expect(textarea.element.value).toBe("Initial notes")
    })

    it("should show saved indicator by default", () => {
      expect(wrapper.text()).toContain("Saved")
    })
  })

  describe("notes editing", () => {
    it("should update local notes when typing", async () => {
      const textarea = wrapper.find(".notes-textarea")
      await textarea.setValue("Updated notes")

      expect(wrapper.vm.localNotes).toBe("Updated notes")
    })

    it("should emit update-notes when input changes", async () => {
      const textarea = wrapper.find(".notes-textarea")
      await textarea.setValue("New notes")
      await textarea.trigger("input")

      expect(wrapper.emitted("update-notes")).toBeTruthy()
      expect(wrapper.emitted("update-notes")[0]).toEqual(["New notes"])
    })

    it("should show saving indicator when typing", async () => {
      const textarea = wrapper.find(".notes-textarea")
      await textarea.setValue("New notes")
      await textarea.trigger("input")

      expect(wrapper.text()).toContain("Saving...")
    })

    it("should disable textarea when game completed", async () => {
      await wrapper.setProps({ isGameCompleted: true })

      const textarea = wrapper.find(".notes-textarea")
      expect(textarea.attributes("disabled")).toBeDefined()
    })
  })

  describe("auto-save indicator", () => {
    it("should show saving state temporarily", async () => {
      vi.useFakeTimers()

      const textarea = wrapper.find(".notes-textarea")
      await textarea.trigger("input")

      expect(wrapper.find(".auto-save-indicator.saving").exists()).toBe(true)

      // Fast forward time
      vi.advanceTimersByTime(1000)
      await wrapper.vm.$nextTick()

      expect(wrapper.find(".auto-save-indicator.saving").exists()).toBe(false)

      vi.useRealTimers()
    })
  })

  describe("props synchronization", () => {
    it("should sync local notes with props changes", async () => {
      await wrapper.setProps({ notes: "Updated from props" })

      expect(wrapper.vm.localNotes).toBe("Updated from props")

      const textarea = wrapper.find(".notes-textarea")
      expect(textarea.element.value).toBe("Updated from props")
    })
  })
})
