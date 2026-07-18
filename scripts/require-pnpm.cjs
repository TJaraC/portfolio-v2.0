const userAgent = process.env.npm_config_user_agent ?? '';
const executable = process.env.npm_execpath ?? '';

if (!userAgent.startsWith('pnpm/') && !executable.toLowerCase().includes('pnpm')) {
  console.error('This project requires pnpm. Run "pnpm install" instead.');
  process.exit(1);
}
