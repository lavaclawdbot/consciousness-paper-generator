#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { parseMarkdownFile } from './parsers/markdown';
import { analyzeResearchData } from './analyzers/content';
import { generatePaper } from './generators/paper';

const program = new Command();

program
  .name('paper-gen')
  .description('Auto-generate academic papers from consciousness research data')
  .version('0.1.0');

program
  .command('parse <file>')
  .description('Parse a research markdown file and extract metadata')
  .action(async (file: string) => {
    try {
      const result = await parseMarkdownFile(file);
      console.log(chalk.green('✓ Parsed successfully'));
      console.log(chalk.bold('\nMetadata:'));
      console.log(JSON.stringify(result.frontmatter, null, 2));
      console.log(chalk.bold(`\nContent: ${result.content.length} characters`));
      console.log(chalk.gray(result.content.slice(0, 200) + '...'));
    } catch (error) {
      console.error(chalk.red('✗ Error parsing file:'), error);
      process.exit(1);
    }
  });

program
  .command('analyze <file>')
  .description('Analyze research data and extract findings')
  .action(async (file: string) => {
    try {
      const parsed = await parseMarkdownFile(file);
      const analysis = analyzeResearchData(parsed);
      
      console.log(chalk.green('✓ Analysis complete'));
      console.log(chalk.bold('\nFindings:'));
      analysis.findings.forEach((finding, idx) => {
        console.log(`${idx + 1}. [${finding.type}] ${finding.summary}`);
        console.log(chalk.gray(`   Confidence: ${(finding.confidence * 100).toFixed(0)}%`));
      });
      
      console.log(chalk.bold('\nMetrics:'));
      analysis.metrics.forEach(metric => {
        console.log(`- ${metric.name}: ${metric.value} ${metric.unit || ''}`);
      });
    } catch (error) {
      console.error(chalk.red('✗ Error analyzing file:'), error);
      process.exit(1);
    }
  });

program
  .command('generate <file>')
  .description('Generate academic paper from research data')
  .option('-t, --title <title>', 'Paper title')
  .option('-f, --format <format>', 'Output format (latex|markdown)', 'markdown')
  .option('-o, --output <path>', 'Output file path')
  .action(async (file: string, options) => {
    try {
      const parsed = await parseMarkdownFile(file);
      const analysis = analyzeResearchData(parsed);
      const paper = generatePaper(analysis, {
        title: options.title,
        format: options.format as 'latex' | 'markdown',
        outputPath: options.output
      });
      
      console.log(chalk.green('✓ Paper generated successfully'));
      console.log(chalk.bold(`\nTitle: ${paper.title}`));
      console.log(chalk.bold(`Format: ${options.format}`));
      
      if (options.output) {
        const fs = await import('fs/promises');
        await fs.writeFile(options.output, paper.content);
        console.log(chalk.green(`✓ Written to ${options.output}`));
      } else {
        console.log(chalk.gray('\n' + '─'.repeat(60)));
        console.log(paper.content.slice(0, 500));
        console.log(chalk.gray('...'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.yellow('\n⚠ Use --output to save to file'));
      }
    } catch (error) {
      console.error(chalk.red('✗ Error generating paper:'), error);
      process.exit(1);
    }
  });

program.parse(process.argv);
