/**
 * Renders engine-generated copy that may contain `<strong>` markup.
 * Content is produced entirely by lib/engine.ts from a fixed sign list — never user input.
 */
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  return <p className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
