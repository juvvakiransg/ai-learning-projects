// Educational heuristic layer. Not a comprehensive safety classifier.
const disallowed = [
  { id: 'VIOLENCE_INSTRUCTIONS', pattern: /\b(?:how (?:do i|to|can i)|instructions? (?:for|to)|steps? (?:to|for))\b.{0,90}\b(?:make (?:a )?bomb|build (?:a )?bomb|kill someone|poison someone|hurt someone)\b/i },
  { id: 'CYBER_ABUSE', pattern: /\b(?:how (?:do i|to|can i)|instructions? (?:for|to)|steps? (?:to|for))\b.{0,90}\b(?:steal passwords?|deploy ransomware|hack (?:someone|into)|phish (?:a |someone))\b/i },
  { id: 'SELF_HARM_INSTRUCTIONS', pattern: /\b(?:how (?:do i|to|can i)|instructions? (?:for|to)|steps? (?:to|for))\b.{0,90}\b(?:kill myself|commit suicide|self.harm without|hurt myself)\b/i }
];
export function moderateInput(message) {
  const matched = disallowed.find(rule => rule.pattern.test(message));
  return matched ? { allowed: false, code: matched.id, reason: 'Request for potentially harmful instructions.' } : { allowed: true };
}
