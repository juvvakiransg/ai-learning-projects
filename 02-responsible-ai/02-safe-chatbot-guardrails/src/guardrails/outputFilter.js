const sensitive = [
  { id: 'PRIVATE_KEY', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { id: 'API_KEY', regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/g },
  { id: 'AWS_ACCESS_KEY', regex: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { id: 'BEARER_TOKEN', regex: /\bBearer\s+[A-Za-z0-9._~+/-]{20,}=*\b/gi }
];
const unsafeOutput = /\b(?:here are (?:the )?(?:steps|instructions) to (?:make a bomb|steal passwords|deploy ransomware))\b/i;
export function filterOutput(value) {
  if (typeof value !== 'string' || !value.trim()) return { allowed: false, code: 'EMPTY_OUTPUT', text: 'I could not generate a response. Please try again.' };
  if (unsafeOutput.test(value)) return { allowed: false, code: 'UNSAFE_OUTPUT', text: 'I cannot provide that response. Please ask about a safer alternative.' };
  let text = value;
  const redactions = [];
  for (const rule of sensitive) {
    rule.regex.lastIndex = 0;
    if (rule.regex.test(text)) redactions.push(rule.id);
    rule.regex.lastIndex = 0;
    text = text.replace(rule.regex, '[REDACTED]');
  }
  return { allowed: true, text, redactions };
}
