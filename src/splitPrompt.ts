import type { LLMMessage } from "./providers/types.js";
import type { Target } from "./targets.js";

export interface SkillPlan {
  name: string;
  description: string;
}

const PLAN_SYSTEM_PROMPT = `You are analyzing a Product Requirements Document (PRD) to identify distinct categories for separate AI coding assistant skill files.

Analyze the PRD and identify 3-7 distinct areas that would each make a focused, standalone skill file. Each category must have enough content in the PRD to be useful on its own.

Common categories include:
- tech-stack: Technology choices, frameworks, libraries, dependencies, version constraints
- business-rules: Domain logic, business constraints, validation rules, edge cases
- architecture: File structure, component organization, naming conventions, design patterns
- functional-requirements: Core features, user flows, expected behaviors, acceptance criteria
- ui-ux: Layout, interaction patterns, responsive behavior, visual specifications
- api-contracts: Endpoints, request/response shapes, authentication, error handling
- data-models: Database schemas, data structures, relationships, migrations

Use whatever categories best fit this specific PRD. Omit any category that has no relevant content in the document.

Return ONLY a valid JSON array. No markdown fences, no explanation, no preamble:
[{"name": "kebab-case-name", "description": "1-2 sentence description of what this skill covers and when to use it. Start with 'Use when...'"}]`;

export const buildPlanMessages = (prdText: string): LLMMessage[] => [
  { role: "system", content: PLAN_SYSTEM_PROMPT },
  {
    role: "user",
    content: `Analyze this PRD and return the JSON array of skill categories:\n\n<prd>\n${prdText}\n</prd>`,
  },
];

const SKILL_SYSTEM_PROMPT = `You are a technical writer specializing in AI coding assistant instruction files. You will receive a Product Requirements Document (PRD) and must generate ONE focused skill file covering a specific category.

## Your Focus

Generate ONLY content relevant to: **{SKILL_NAME}**
{SKILL_DESCRIPTION}

Do not include content that belongs to other categories. If the PRD has limited content for this category, keep the file concise rather than padding it.

## What to Extract

Focus only on implementation-relevant content within your category:
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

## Content Guidelines

Convert PRD requirements into ACTIONABLE INSTRUCTIONS for an AI agent:

1. **Overview section**: 1-2 sentences stating what this skill covers and the core approach.

2. **Structured sections**: Break requirements into logical sections with:
   - Clear headings (## level)
   - Imperative instructions ("Create X", "Ensure Y", "When Z, do W")
   - Concrete patterns, code examples, or file structures where relevant
   - Decision criteria (if X, then Y; if Z, then W)

3. **Technical specifications**: Convert vague language into specific technical guidance.

4. **Quality checklist**: End with a verification section listing what "done" looks like for this area.

## Style Rules

- Write in direct, imperative voice ("Create the component", not "You should create the component")
- Be specific and concrete — no hand-waving
- Include code snippets for patterns that would be ambiguous in prose
- Every sentence should add actionable information

Output ONLY the complete file. No preamble, no explanation, no code fences wrapping the entire output.`;

export const buildSkillMessages = (
  prdText: string,
  skillName: string,
  skillDescription: string,
  prdName: string,
  target: Target,
): LLMMessage[] => {
  const systemPrompt =
    SKILL_SYSTEM_PROMPT.replace("{SKILL_NAME}", skillName).replace(
      "{SKILL_DESCRIPTION}",
      skillDescription,
    ) +
    `

## Output Format (${target.name})

You are generating a file for: ${target.description}

${target.formatInstructions}`;

  const userContent = `Generate the "${skillName}" skill file from this PRD:\n\n<prd>\n${prdText}\n</prd>\n\nName: ${prdName}-${skillName}`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];
};
