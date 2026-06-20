type PerformanceMeasurement = {
  name: string;
  durationMs: number;
};

const marks = new Map<string, number>();
const measurements: PerformanceMeasurement[] = [];

function getNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}

export function markPerformance(name: string) {
  if (!__DEV__) {
    return;
  }

  marks.set(name, getNow());
  console.log(`[perf] mark ${name}`);
}

export function measurePerformance(name: string, from: string) {
  if (!__DEV__) {
    return;
  }

  const start = marks.get(from);

  if (start == null) {
    console.log(`[perf] ${name}: missing start mark "${from}"`);
    return;
  }

  const durationMs = getNow() - start;
  measurements.push({ name, durationMs });
  console.log(`[perf] ${name}: ${durationMs.toFixed(1)}ms`);
}

export function logPerformanceEvent(name: string, details?: Record<string, string | number | boolean>) {
  if (!__DEV__) {
    return;
  }

  const detailText = details
    ? ` ${Object.entries(details)
        .map(([key, value]) => `${key}=${value}`)
        .join(' ')}`
    : '';

  console.log(`[perf] ${name}${detailText}`);
}

export function logPerformanceSummary(label: string, names: string[]) {
  if (!__DEV__) {
    return;
  }

  const summary = names
    .map((name) => {
      const measurement = findLatestMeasurement(name);
      return measurement ? `${name}=${measurement.durationMs.toFixed(1)}ms` : `${name}=n/a`;
    })
    .join(' ');

  console.log(`[perf:summary] ${label} ${summary}`);
}

function findLatestMeasurement(name: string) {
  for (let index = measurements.length - 1; index >= 0; index -= 1) {
    if (measurements[index].name === name) {
      return measurements[index];
    }
  }

  return null;
}