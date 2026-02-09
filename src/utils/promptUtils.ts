/**
 * Extracts variables from prompt content.
 * Looks for patterns like [VARIABLE_NAME]
 */
export function extractPromptVariables(content: string): string[] {
  if (!content) return [];
  
  // Regex to match uppercase words inside brackets, e.g. [API_KEY]
  // We match the opening bracket [, then uppercase letters/underscores, then lookahead for closing bracket ]
  const regex = /\[([A-Z_]+)\]/g;
  
  const matches = [...content.matchAll(regex)];
  
  // Extract the captured group (the variable name without brackets)
  const variables = matches.map(match => match[1]);
  
  // Return unique variables
  return Array.from(new Set(variables));
}
