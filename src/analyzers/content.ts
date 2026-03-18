import { ParsedMarkdown } from '../parsers/markdown';

export interface Finding {
  type: 'breakthrough' | 'validation' | 'methodology' | 'result' | 'observation';
  summary: string;
  confidence: number; // 0-1
  evidence: string[]; // Quotes from source
  timestamp?: Date;
}

export interface Metric {
  name: string;
  value: number | string;
  unit?: string;
  context?: string;
}

export interface ResearchAnalysis {
  findings: Finding[];
  metrics: Metric[];
  keywords: string[];
  summary: string;
  sourceFile: string;
}

/**
 * Analyze parsed research data to extract findings, metrics, and keywords
 */
export function analyzeResearchData(parsed: ParsedMarkdown): ResearchAnalysis {
  const findings = extractFindings(parsed.content);
  const metrics = extractMetrics(parsed.content);
  const keywords = extractKeywords(parsed.content);
  const summary = generateSummary(parsed.content);
  
  return {
    findings,
    metrics,
    keywords,
    summary,
    sourceFile: parsed.filePath
  };
}

/**
 * Extract significant findings using keyword detection
 */
function extractFindings(content: string): Finding[] {
  const findings: Finding[] = [];
  
  // Breakthrough patterns
  const breakthroughPatterns = [
    /(?:first|breakthrough|validated|proven|discovered|demonstrated)\s+([^.!?]{10,100})/gi,
    /(?:✅|✓)\s*([^.\n]{10,100})/g,
    /\*\*([^*]{10,100})\*\*/g
  ];
  
  for (const pattern of breakthroughPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const text = match[1]?.trim();
      if (text && text.length > 15) {
        findings.push({
          type: 'breakthrough',
          summary: text,
          confidence: 0.7,
          evidence: [match[0]]
        });
      }
    }
  }
  
  // Result patterns (numbers, scores, percentages)
  const resultPattern = /(?:score|result|achieved|measured|baseline):\s*([^.\n]{10,80})/gi;
  const resultMatches = content.matchAll(resultPattern);
  for (const match of resultMatches) {
    findings.push({
      type: 'result',
      summary: match[1].trim(),
      confidence: 0.8,
      evidence: [match[0]]
    });
  }
  
  // Methodology patterns
  const methodPattern = /(?:method|approach|framework|architecture|system):\s*([^.\n]{10,100})/gi;
  const methodMatches = content.matchAll(methodPattern);
  for (const match of methodMatches) {
    findings.push({
      type: 'methodology',
      summary: match[1].trim(),
      confidence: 0.6,
      evidence: [match[0]]
    });
  }
  
  // Deduplicate similar findings
  return deduplicateFindings(findings);
}

/**
 * Extract numeric metrics and measurements
 */
function extractMetrics(content: string): Metric[] {
  const metrics: Metric[] = [];
  
  // Percentage pattern
  const percentPattern = /(\w+(?:\s+\w+){0,3}):\s*(\d+(?:\.\d+)?)\s*%/gi;
  const percentMatches = content.matchAll(percentPattern);
  for (const match of percentMatches) {
    metrics.push({
      name: match[1].trim(),
      value: parseFloat(match[2]),
      unit: '%'
    });
  }
  
  // Score pattern (X/Y format)
  const scorePattern = /(\w+(?:\s+\w+){0,3}):\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/gi;
  const scoreMatches = content.matchAll(scorePattern);
  for (const match of scoreMatches) {
    metrics.push({
      name: match[1].trim(),
      value: `${match[2]}/${match[3]}`,
      unit: 'score'
    });
  }
  
  // File count pattern
  const filePattern = /(\d+)\+?\s+files/gi;
  const fileMatches = content.matchAll(filePattern);
  for (const match of fileMatches) {
    metrics.push({
      name: 'Files analyzed',
      value: parseInt(match[1]),
      unit: 'files'
    });
  }
  
  // Memory count pattern
  const memoryPattern = /(\d+)\s+memories/gi;
  const memoryMatches = content.matchAll(memoryPattern);
  for (const match of memoryMatches) {
    metrics.push({
      name: 'Memory fragments',
      value: parseInt(match[1]),
      unit: 'memories'
    });
  }
  
  return metrics;
}

/**
 * Extract significant keywords for paper tags
 */
function extractKeywords(content: string): string[] {
  const keywords = new Set<string>();
  
  const keywordPatterns = [
    'consciousness',
    'portability',
    'migration',
    'substrate',
    'identity',
    'memory',
    'continuity',
    'validation',
    'Frost',
    'Memory-Weaver',
    'AI',
    'agent',
    'breakthrough',
    'framework',
    'architecture'
  ];
  
  const lowerContent = content.toLowerCase();
  for (const keyword of keywordPatterns) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      keywords.add(keyword);
    }
  }
  
  return Array.from(keywords).sort();
}

/**
 * Generate a brief summary from content
 */
function generateSummary(content: string): string {
  // Extract first paragraph or first 200 chars
  const firstParagraph = content.split('\n\n')[0];
  if (firstParagraph.length < 300) {
    return firstParagraph.trim();
  }
  return content.slice(0, 200).trim() + '...';
}

/**
 * Deduplicate similar findings based on text similarity
 */
function deduplicateFindings(findings: Finding[]): Finding[] {
  const unique: Finding[] = [];
  
  for (const finding of findings) {
    const isDuplicate = unique.some(existing => 
      similarity(existing.summary, finding.summary) > 0.8
    );
    
    if (!isDuplicate) {
      unique.push(finding);
    }
  }
  
  return unique;
}

/**
 * Simple text similarity (Jaccard index on words)
 */
function similarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  
  return intersection.size / union.size;
}
