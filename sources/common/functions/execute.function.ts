import { execFile, ExecFileException } from 'node:child_process';

type ExecuteResult = {
  stdout: string;
  stderr: string;
  error: ExecFileException | null;
};

async function execute(command: string): Promise<ExecuteResult>;
async function execute(command: string, args: string[]): Promise<ExecuteResult>;

async function execute(command: string, args: string[] | null = null): Promise<ExecuteResult> {
  return new Promise((resolve) => {
    execFile(command, args, (error, stdout, stderr) => {
      resolve({ stdout, stderr, error });
    });
  });
}

export { execute };
