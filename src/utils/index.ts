export function returnSeverity(severityCode: string): string {
  switch (severityCode) {
    case "0":
      return "informational"
    case "1":
      return "low"
    case "2":
      return "medium"
    case "3":
      return "high"
    default:
      return "N/A"
  }
}
