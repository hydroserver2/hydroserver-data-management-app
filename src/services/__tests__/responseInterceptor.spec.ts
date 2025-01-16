import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { responseInterceptor } from '@/services/responseInterceptor'

const originalConsoleError = console.error

beforeEach(() => {
  // Override console.error with a mock function so console doesn't get cluttered
  console.error = vi.fn()
})

afterEach(() => {
  // Restore the original console.error after each test
  console.error = originalConsoleError
})

describe('parseResponseBody', () => {
  describe('responseInterceptor', () => {
    it('processes a 200 status code response correctly', async () => {
      const mockJsonResponse = { success: true, data: 'Some data' }
      const mockResponse = new Response(JSON.stringify(mockJsonResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })

      const options = {}

      const result = await responseInterceptor(mockResponse, options)

      expect(result).toEqual(mockJsonResponse)
    })
  })
})
