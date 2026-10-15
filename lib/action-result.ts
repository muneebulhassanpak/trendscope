/** Uniform return type for server actions. Never throw across the boundary. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export type ActionFailure = Extract<ActionResult, { ok: false }>

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message }
}

export function fail(
  error: string,
  fieldErrors?: Record<string, string[]>
): ActionFailure {
  return { ok: false, error, fieldErrors }
}
