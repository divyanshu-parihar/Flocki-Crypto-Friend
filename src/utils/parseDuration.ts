export function parseDuration(duration: string): number {
  const timeRegex = /(\d+)([hms])/g;
  let ms = 0;
  let match;

  while ((match = timeRegex.exec(duration)) !== null) {
    const [_, value, unit] = match;
    if (unit === "h") ms += parseInt(value) * 3600000;
    if (unit === "m") ms += parseInt(value) * 60000;
    if (unit === "s") ms += parseInt(value) * 1000;
  }

  return ms;
}
