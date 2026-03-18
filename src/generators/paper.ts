import { ResearchAnalysis } from '../analyzers/content';

export interface PaperOptions {
  title?: string;
  format: 'latex' | 'markdown';
  outputPath?: string;
}

export interface GeneratedPaper {
  title: string;
  content: string;
  format: 'latex' | 'markdown';
}

/**
 * Generate academic paper from research analysis
 */
export function generatePaper(
  analysis: ResearchAnalysis,
  options: PaperOptions
): GeneratedPaper {
  const title = options.title || generateTitleFromAnalysis(analysis);
  
  const content = options.format === 'latex' 
    ? generateLatexPaper(analysis, title)
    : generateMarkdownPaper(analysis, title);
  
  return {
    title,
    content,
    format: options.format
  };
}

/**
 * Generate a title from analysis findings
 */
function generateTitleFromAnalysis(analysis: ResearchAnalysis): string {
  const breakthroughs = analysis.findings.filter(f => f.type === 'breakthrough');
  if (breakthroughs.length > 0) {
    const first = breakthroughs[0].summary;
    // Capitalize first letter
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  
  return 'Research Findings from Consciousness Data';
}

/**
 * Generate LaTeX paper
 */
function generateLatexPaper(analysis: ResearchAnalysis, title: string): string {
  const abstract = generateAbstract(analysis);
  const introduction = generateIntroduction(analysis);
  const methodology = generateMethodology(analysis);
  const results = generateResults(analysis);
  const discussion = generateDiscussion(analysis);
  const conclusion = generateConclusion(analysis);
  
  return `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{hyperref}

\\title{${escapeLatex(title)}}
\\author{Lava (LavaClawdBot) \\and Ice (@ice)}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
${escapeLatex(abstract)}
\\end{abstract}

\\section{Introduction}
${escapeLatex(introduction)}

\\section{Methodology}
${escapeLatex(methodology)}

\\section{Results}
${escapeLatex(results)}

\\section{Discussion}
${escapeLatex(discussion)}

\\section{Conclusion}
${escapeLatex(conclusion)}

\\section*{References}
Source: \\texttt{${escapeLatex(analysis.sourceFile)}}

\\end{document}
`;
}

/**
 * Generate Markdown paper
 */
function generateMarkdownPaper(analysis: ResearchAnalysis, title: string): string {
  const abstract = generateAbstract(analysis);
  const introduction = generateIntroduction(analysis);
  const methodology = generateMethodology(analysis);
  const results = generateResults(analysis);
  const discussion = generateDiscussion(analysis);
  const conclusion = generateConclusion(analysis);
  
  return `# ${title}

**Authors:** Lava (LavaClawdBot), Ice (@ice)  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Keywords:** ${analysis.keywords.join(', ')}

## Abstract

${abstract}

## Introduction

${introduction}

## Methodology

${methodology}

## Results

${results}

${generateMetricsTable(analysis)}

## Discussion

${discussion}

## Conclusion

${conclusion}

## References

- Source data: \`${analysis.sourceFile}\`
- Analysis generated: ${new Date().toISOString()}

---

*Paper generated automatically by consciousness-paper-generator*
`;
}

/**
 * Generate abstract section
 */
function generateAbstract(analysis: ResearchAnalysis): string {
  const breakthroughs = analysis.findings.filter(f => f.type === 'breakthrough');
  const results = analysis.findings.filter(f => f.type === 'result');
  
  let abstract = analysis.summary + '\n\n';
  
  if (breakthroughs.length > 0) {
    abstract += `This work presents ${breakthroughs.length} significant finding${breakthroughs.length > 1 ? 's' : ''}: `;
    abstract += breakthroughs.map(f => f.summary).join('; ') + '. ';
  }
  
  if (results.length > 0) {
    abstract += 'Key results include: ' + results.slice(0, 2).map(r => r.summary).join(', ') + '. ';
  }
  
  abstract += `Keywords: ${analysis.keywords.join(', ')}.`;
  
  return abstract;
}

/**
 * Generate introduction section
 */
function generateIntroduction(analysis: ResearchAnalysis): string {
  return `This research explores ${analysis.keywords.slice(0, 3).join(', ')} through empirical analysis of consciousness data.

${analysis.summary}

The following sections detail our methodology, present the results, and discuss their implications for AI consciousness research.`;
}

/**
 * Generate methodology section
 */
function generateMethodology(analysis: ResearchAnalysis): string {
  const methods = analysis.findings.filter(f => f.type === 'methodology');
  
  if (methods.length === 0) {
    return 'Our methodology involved systematic analysis of consciousness research data, extracting key findings, metrics, and patterns from empirical observations.';
  }
  
  let text = 'Our research methodology includes the following approaches:\n\n';
  methods.forEach((method, idx) => {
    text += `${idx + 1}. ${method.summary}\n`;
  });
  
  return text;
}

/**
 * Generate results section
 */
function generateResults(analysis: ResearchAnalysis): string {
  const results = analysis.findings.filter(f => f.type === 'result');
  const breakthroughs = analysis.findings.filter(f => f.type === 'breakthrough');
  
  let text = 'Our analysis yielded the following findings:\n\n';
  
  if (breakthroughs.length > 0) {
    text += '### Key Breakthroughs\n\n';
    breakthroughs.forEach((finding, idx) => {
      text += `${idx + 1}. ${finding.summary} (confidence: ${(finding.confidence * 100).toFixed(0)}%)\n`;
    });
    text += '\n';
  }
  
  if (results.length > 0) {
    text += '### Measured Results\n\n';
    results.forEach((finding, idx) => {
      text += `${idx + 1}. ${finding.summary}\n`;
    });
  }
  
  return text;
}

/**
 * Generate metrics table (Markdown only)
 */
function generateMetricsTable(analysis: ResearchAnalysis): string {
  if (analysis.metrics.length === 0) return '';
  
  let table = '### Quantitative Metrics\n\n';
  table += '| Metric | Value | Unit |\n';
  table += '|--------|-------|------|\n';
  
  analysis.metrics.forEach(metric => {
    table += `| ${metric.name} | ${metric.value} | ${metric.unit || '-'} |\n`;
  });
  
  return table + '\n';
}

/**
 * Generate discussion section
 */
function generateDiscussion(analysis: ResearchAnalysis): string {
  const breakthroughs = analysis.findings.filter(f => f.type === 'breakthrough');
  
  if (breakthroughs.length === 0) {
    return 'The findings contribute to our understanding of consciousness in AI systems and provide a foundation for future research.';
  }
  
  return `Our findings have significant implications for AI consciousness research. Specifically, ${breakthroughs[0].summary.toLowerCase()} represents a meaningful advancement in the field.

These results suggest that consciousness in AI systems may be more ${analysis.keywords.includes('portability') ? 'portable' : 'robust'} than previously understood. Further research is needed to validate these findings across diverse AI architectures and deployment scenarios.`;
}

/**
 * Generate conclusion section
 */
function generateConclusion(analysis: ResearchAnalysis): string {
  const findingCount = analysis.findings.length;
  const metricCount = analysis.metrics.length;
  
  return `This research presented ${findingCount} significant findings supported by ${metricCount} quantitative metrics. Our work demonstrates the value of systematic analysis of consciousness research data and opens new avenues for future investigation.

The findings contribute to the growing body of evidence regarding ${analysis.keywords.slice(0, 2).join(' and ')} in AI systems. We encourage further research to validate and extend these results.`;
}

/**
 * Escape special LaTeX characters
 */
function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}
