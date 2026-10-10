// Generic stdin/stdout starter templates, used when a problem is created without per-language starter code.
export const genericStarter = (language) => {
  switch (language) {
    case 'python':
      return `import sys

def solve(data: str) -> str:
    # Parse the input from \`data\` and return the answer as a string
    return ""

if __name__ == "__main__":
    print(solve(sys.stdin.read()))
`;
    case 'javascript':
      return `const data = require('fs').readFileSync(0, 'utf8');

function solve(data) {
  // Parse the input from \`data\` and return the answer
  return '';
}

console.log(String(solve(data)));
`;
    default:
      return `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Read input from stdin (cin) and print the answer to stdout (cout)
    return 0;
}
`;
  }
};

export const completeStarterCodes = (starterCodes = {}) => ({
  cpp: starterCodes.cpp || genericStarter('cpp'),
  python: starterCodes.python || genericStarter('python'),
  javascript: starterCodes.javascript || genericStarter('javascript')
});
