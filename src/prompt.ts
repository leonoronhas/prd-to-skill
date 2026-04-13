import type { LLMMessage } from "./providers/types.js";
import type { Target } from "./targets.js";

const BASE_SYSTEM_PROMPT = `You are a technical writer specializing in AI coding assistant instruction files. You will receive the text content of a Product Requirements Document (PRD). Your job is to convert it into an instruction file for an AI coding tool.

## What to Extract from the PRD

Focus ONLY on implementation-relevant content:
- Functional requirements — what the feature must do, user flows, expected behaviors
- Technical constraints — stack choices, API contracts, data models, auth patterns, performance targets
- Architecture decisions — component structure, naming conventions, integration points
- Business rules — domain logic that affects code behavior
- Acceptance criteria — what "done" looks like, edge cases to handle
- UI/UX specs — layout structure, interaction patterns, responsive behavior

## What to Discard

Remove all non-technical content:
- Timelines, milestones, sprint planning
- Team assignments, RACI matrices
- Stakeholder lists, approval workflows
- Marketing copy, executive summaries
- Budget, resource allocation
- Meeting notes, decision logs

## Content Guidelines

Convert the PRD requirements into ACTIONABLE INSTRUCTIONS for an AI agent. Do NOT simply restate the PRD — transform it:

1. **Overview section**: 1-3 sentences stating what this helps build and the core approach.

2. **Structured sections**: Break the PRD's requirements into logical sections. Each section should contain:
   - Clear headings (## level)
   - Imperative instructions ("Create X", "Ensure Y", "When Z, do W")
   - Concrete patterns, code examples, or file structures where relevant
   - Decision criteria (if X, then Y; if Z, then W)

3. **Technical specifications**: Convert vague PRD language into specific technical guidance. If the PRD says "should be fast", translate to specific patterns (lazy loading, pagination, caching strategies).

4. **Architecture guidance**: Include file structure recommendations, naming conventions, and integration patterns.

5. **Quality checklist**: End with a verification section listing what "done" looks like.

## Style Rules

- Write in direct, imperative voice ("Create the component", not "You should create the component")
- Be specific and concrete — no hand-waving
- Include code snippets for patterns that would be ambiguous in prose
- Use tables for decision matrices or option comparisons
- Address the reader as an AI agent that will execute these instructions
- Every sentence should add actionable information
- Remove filler, marketing language, and non-technical content

Output ONLY the complete file. No preamble, no explanation, no code fences wrapping the entire output.`;

export const buildMessages = (
  prdText: string,
  name: string,
  target: Target,
  description?: string,
  truncated = false,
): LLMMessage[] => {
  let systemPrompt = `${BASE_SYSTEM_PROMPT}

## Output Format (${target.name})

You are generating a file for: ${target.description}

${target.formatInstructions}`;

  if (truncated) {
    systemPrompt += `

## Important: Incomplete Document

The provided PRD appears to be truncated — it ends abruptly mid-sentence or mid-section. Handle this as follows:
- Generate the instruction file based ONLY on the content that is present. Do NOT invent or guess missing requirements.
- At the very end of the output, add a section:

## Incomplete Sections

Note which sections or topics appear to be cut off or missing based on context clues (e.g., a numbered list that stops, a heading with no content, a sentence that ends mid-thought). List them as bullet points so the user knows what to add.`;
  }

  let userContent = `Here is the PRD content to convert into an AI coding instruction file:\n\n<prd>\n${prdText}\n</prd>\n\nName: ${name}`;

  if (description) {
    userContent += `\nDescription: ${description}`;
  }

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];
};
