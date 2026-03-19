import { describe, it, expect } from "vitest"
import { parseYtdlpDate } from "../../src/workers/check-tools"

describe("parseYtdlpDate", () => {
  it("parses standard YYYY.MM.DD format", () => {
    const date = parseYtdlpDate("2025.01.15")
    expect(date).toBeInstanceOf(Date)
    expect(date!.getFullYear()).toBe(2025)
    expect(date!.getMonth()).toBe(0) // January
    expect(date!.getDate()).toBe(15)
  })

  it("parses patch format YYYY.MM.DD.N", () => {
    const date = parseYtdlpDate("2025.03.01.2")
    expect(date).toBeInstanceOf(Date)
    expect(date!.getFullYear()).toBe(2025)
    expect(date!.getMonth()).toBe(2) // March
    expect(date!.getDate()).toBe(1)
  })

  it("returns null for invalid input", () => {
    expect(parseYtdlpDate("not-a-version")).toBeNull()
    expect(parseYtdlpDate("")).toBeNull()
    expect(parseYtdlpDate("1.2.3")).toBeNull()
  })
})
