import { readFile } from 'fs/promises';
import matter from 'gray-matter';

export interface ParsedMarkdown {
  frontmatter: Record<string, any>;
  content: string;
  filePath: string;
  rawContent: string;
}

/**
 * Parse a markdown file with frontmatter extraction
 */
export async function parseMarkdownFile(filePath: string): Promise<ParsedMarkdown> {
  try {
    const rawContent = await readFile(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(rawContent);
    
    return {
      frontmatter,
      content: content.trim(),
      filePath,
      rawContent
    };
  } catch (error) {
    throw new Error(`Failed to parse ${filePath}: ${error}`);
  }
}

/**
 * Extract all markdown files from a directory (recursive)
 */
export async function findMarkdownFiles(dirPath: string): Promise<string[]> {
  const { readdir, stat } = await import('fs/promises');
  const { join } = await import('path');
  
  const files: string[] = [];
  
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  await walk(dirPath);
  return files;
}
