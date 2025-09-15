import { describe, it, expect, beforeEach, vi } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useAuthStore } from "../auth"
import { authApi } from "@/services/api"

vi.mock("@/services/api", () => ({
  authApi: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

describe("Auth Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = useAuthStore()

      expect(store.user).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe("checkAuth", () => {
    it("should return false when no token exists", async () => {
      localStorage.getItem.mockReturnValue(null)

      const store = useAuthStore()
      const result = await store.checkAuth()

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBe(null)
    })

    it("should authenticate user with valid token", async () => {
      const mockUser = { id: "1", name: "John Doe", email: "john@example.com" }
      localStorage.getItem.mockReturnValue("valid-token")
      authApi.getCurrentUser.mockResolvedValue({ data: mockUser })

      const store = useAuthStore()
      const result = await store.checkAuth()

      expect(result).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(store.user).toEqual(mockUser)
    })

    it("should logout user with invalid token", async () => {
      localStorage.getItem.mockReturnValue("invalid-token")
      authApi.getCurrentUser.mockRejectedValue(new Error("Unauthorized"))

      const store = useAuthStore()
      const result = await store.checkAuth()

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBe(null)
      expect(localStorage.removeItem).toHaveBeenCalledWith("auth_token")
    })
  })

  describe("login", () => {
    it("should login user successfully", async () => {
      const credentials = { email: "john@example.com", password: "password" }
      const mockResponse = {
        data: {
          token: "auth-token",
          user: { id: "1", name: "John Doe", email: "john@example.com" },
        },
      }
      authApi.login.mockResolvedValue(mockResponse)

      const store = useAuthStore()
      const result = await store.login(credentials)

      expect(result).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(store.user).toEqual(mockResponse.data.user)
      expect(localStorage.setItem).toHaveBeenCalledWith("auth_token", "auth-token")
      expect(store.error).toBe(null)
    })

    it("should handle login error", async () => {
      const credentials = { email: "john@example.com", password: "wrong-password" }
      const mockError = {
        response: { data: { message: "Invalid credentials" } },
      }
      authApi.login.mockRejectedValue(mockError)

      const store = useAuthStore()
      const result = await store.login(credentials)

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBe(null)
      expect(store.error).toBe("Invalid credentials")
    })
  })

  describe("logout", () => {
    it("should logout user", () => {
      const store = useAuthStore()
      // Set initial authenticated state
      store.user = { id: "1", name: "John Doe" }
      store.isAuthenticated = true

      store.logout()

      expect(store.user).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.removeItem).toHaveBeenCalledWith("auth_token")
    })
  })
})
