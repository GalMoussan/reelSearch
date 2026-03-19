import { execFile } from "child_process"

export type ExecBufferResult = {
  stdout: Buffer
  stderr: string
}

export function execBuffer(
  command: string,
  args: string[],
  timeoutMs = 30_000,
): Promise<ExecBufferResult> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { timeout: timeoutMs, encoding: "buffer", maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `${command} failed: ${error.message}\nstderr: ${stderr?.toString() ?? ""}`,
            ),
          )
          return
        }
        resolve({
          stdout: stdout as Buffer,
          stderr: stderr?.toString() ?? "",
        })
      },
    )
  })
}

export function execText(
  command: string,
  args: string[],
  timeoutMs = 120_000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { timeout: timeoutMs },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `${command} failed: ${error.message}\nstderr: ${stderr}`,
            ),
          )
          return
        }
        resolve(stdout.trim())
      },
    )
  })
}
