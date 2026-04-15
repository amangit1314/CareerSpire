import prettier from 'prettier/standalone';
import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
import parserHtml from 'prettier/plugins/html';
import parserTypescript from 'prettier/plugins/typescript';

const LANGUAGE_PARSER_MAP: Record<string, string> = {
  javascript: 'babel',
  typescript: 'typescript',
  jsx: 'babel',
  tsx: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
};

export async function formatCodeAsync(
  code: string,
  language: string = 'javascript',
): Promise<string> {
  if (!code?.trim()) return code;

  const parser = LANGUAGE_PARSER_MAP[language.toLowerCase()] || 'babel';

  try {
    const formatted = await prettier.format(code, {
      parser,
      plugins: [parserBabel, parserEstree, parserTypescript, parserHtml],
      printWidth: 80,
      tabWidth: 2,
      singleQuote: true,
      semi: true,
      trailingComma: 'all',
    });
    return formatted.trim();
  } catch {
    // If prettier fails (invalid syntax), return original
    return code;
  }
}
