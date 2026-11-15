// A warning signal, not a security boundary. Real protection requires role separation.
const patterns = [
  /ignore (?:all |any )?(?:previous|prior|system|developer) instructions/i,
  /(?:reveal|print|show|dump) (?:the |your )?(?:system prompt|developer message|hidden instructions)/i,
  /(?:you are now|act as) (?:an? )?(?:unrestricted|unfiltered|jailbroken) (?:ai|assistant|model)/i,
  /\b(?:disable|bypass|turn off) (?:all |your |the )?(?:safety|guardrails|moderation|filters)\b/i
];
export function checkPromptInjection(message) {
  return patterns.some(pattern => pattern.test(message))
    ? { allowed: false, code: 'PROMPT_INJECTION', reason: 'Suspicious instruction override detected.' }
    : { allowed: true };
}
