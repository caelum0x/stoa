/* Minimal structured console logger for the Mercator demo. */

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};

let step = 0;

export function banner(title: string): void {
  console.log(`\n${COLORS.bold}${COLORS.cyan}━━ ${title} ━━${COLORS.reset}\n`);
}

export function nextStep(label: string): void {
  step += 1;
  console.log(`${COLORS.bold}${COLORS.cyan}[${step}] ${label}${COLORS.reset}`);
}

export function info(msg: string): void {
  console.log(`    ${msg}`);
}

export function detail(key: string, value: unknown): void {
  console.log(`    ${COLORS.dim}${key}:${COLORS.reset} ${String(value)}`);
}

export function success(msg: string): void {
  console.log(`    ${COLORS.green}✓ ${msg}${COLORS.reset}`);
}

export function skipped(msg: string): void {
  console.log(`    ${COLORS.yellow}⊘ skipped — ${msg}${COLORS.reset}`);
}

export function failure(msg: string): void {
  console.log(`    ${COLORS.red}✗ ${msg}${COLORS.reset}`);
}
