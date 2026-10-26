 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

 

export function normalizeSecretaryTransaction(
  value,
) {
  return {
    ...value,
    subject: normalizeText(value.subject),
    counterpartyName: normalizeText(value.counterpartyName),
    description: normalizeText(value.description),
  };
}

function normalizeText(value) {
  const normalizedValue = _optionalChain([value, 'optionalAccess', _ => _.trim, 'call', _2 => _2()]);
  return normalizedValue || null;
}
