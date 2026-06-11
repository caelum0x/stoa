/// Dynamically import an optional dependency by name.
///
/// Because the module name is a runtime value (not a string literal), TypeScript types the
/// result as `any` and performs no compile-time resolution — so the package type-checks even
/// when these optional integrations (x402, express) are not installed. At runtime the real
/// package must be present; a missing one yields a clear, actionable error.
export async function loadOptional<T = unknown>(name: string): Promise<T> {
  try {
    return (await import(name)) as T;
  } catch {
    throw new Error(
      `Optional dependency "${name}" is required for this skill but is not installed. ` +
        `Install it with: pnpm add ${name}`,
    );
  }
}
