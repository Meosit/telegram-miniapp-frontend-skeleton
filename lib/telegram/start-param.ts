export type ParsedStartParam =
  | { kind: "empty"; raw: "" }
  | { kind: "json"; raw: string; value: unknown }
  | { kind: "query"; raw: string; value: Record<string, string> }
  | { kind: "string"; raw: string; value: string }

export function parseStartParam(startParam: string | null | undefined): ParsedStartParam {
  const raw = (startParam || "").trim()

  if (!raw) {
    return { kind: "empty", raw: "" }
  }

  const decoded = safeDecode(raw)
  const maybeJson = parseJson(decoded)
  if (maybeJson.ok) {
    return { kind: "json", raw, value: maybeJson.value }
  }

  if (decoded.includes("=")) {
    const params = new URLSearchParams(decoded)
    const value = Object.fromEntries(params.entries())
    if (Object.keys(value).length > 0) {
      return { kind: "query", raw, value }
    }
  }

  return { kind: "string", raw, value: decoded }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseJson(value: string): { ok: true; value: unknown } | { ok: false } {
  if (!value.startsWith("{") && !value.startsWith("[")) {
    return { ok: false }
  }

  try {
    return { ok: true, value: JSON.parse(value) }
  } catch {
    return { ok: false }
  }
}
