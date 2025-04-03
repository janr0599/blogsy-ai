export function sanitizeTitle(title: string): string {
    return title.replace(/^#\s*/, ""); // Remove leading '#' and any whitespace
}
