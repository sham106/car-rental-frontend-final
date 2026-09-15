/** Escape dynamic values inserted into standalone HTML documents (React escapes its own JSX). */
export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return strings.reduce((result, part, index) => result + part + (
    index < values.length ? String(values[index] ?? '').replace(/[&<>"']/g, char => entities[char]) : ''
  ), '');
}
