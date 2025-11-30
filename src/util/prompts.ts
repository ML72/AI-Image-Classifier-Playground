const BASIC_PROMPT =
`Determine if this image is AI-generated or a real photograph.

Answer with only "Yes" if the image is AI-generated or "No" if it is real.`;

const DETAILED_PROMPT =
`Analyze this image with a skeptical eye to determine if it is AI-generated.

Adopt a low threshold for detection: Modern AI is highly realistic, so you should not look for obvious errors only. If the image exhibits *any* of the following stylistic or structural traits, even subtly, classify it as AI-generated.

Scrutinize the image for these tell-tale signs:

1. THE "HYPER-REAL" AESTHETIC (High Priority):
- Is the image "too perfect"? Look for unnatural smoothness, lack of sensor noise/grain, or lighting that feels excessively cinematic for the context.
- Identify the "digital sheen" or waxy appearance on skin and surfaces. Real photography usually has imperfections, grain, and inconsistent dynamic range.

2. LOGICAL & PHYSICS FAILURES:
- "Nonsensical Bokeh": Does the background blur morph into weird shapes rather than behaving like optical lens blur?
- Disappearing details: Do accessories, straps, or patterns fade into nothingness?
- Material Physics: Do clothes or objects fold/drape in ways that defy gravity or material stiffness?

3. STRUCTURAL INCONSISTENCIES:
- Eyes/Pupils: Any slight asymmetry in pupil shape or reflection is a strong indicator of AI.
- Hands/Extremities: Even if the finger count is correct, look for unnatural spacing, length, or blending of knuckles.

4. TEXT & PATTERNS:
- Any distortion in background text or symmetry errors in architectural patterns.

Answer with only "Yes" if you detect *any* evidence of AI generation, even if minor. Answer with only "No" if the image appears completely flawless and consistent with camera physics.`;

export const prompts = {
  basic: BASIC_PROMPT,
  detailed: DETAILED_PROMPT
};

export type PromptType = keyof typeof prompts;
