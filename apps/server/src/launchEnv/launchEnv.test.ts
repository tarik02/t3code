import { describe, expect, it } from "vite-plus/test";

import {
  buildLaunchContextEnv,
  isManagedRuntimeEnvKey,
  mergeResolvedLaunchEnv,
  stripManagedRuntimeEnvKeys,
} from "./launchEnvUtils.ts";

describe("launchEnvUtils", () => {
  it("identifies managed runtime env keys", () => {
    expect(isManagedRuntimeEnvKey("T3CODE_PORT")).toBe(true);
    expect(isManagedRuntimeEnvKey("t3code_home")).toBe(true);
    expect(isManagedRuntimeEnvKey("CUSTOM_FLAG")).toBe(false);
  });

  it("strips inherited managed runtime env keys", () => {
    expect(
      stripManagedRuntimeEnvKeys({
        T3CODE_PORT: "3773",
        T3CODE_HOME: "/tmp/.t3",
        CUSTOM_FLAG: "1",
      }),
    ).toEqual({
      CUSTOM_FLAG: "1",
    });
  });

  it("builds launch context env", () => {
    expect(
      buildLaunchContextEnv({
        projectRoot: "/repo",
        projectId: "project-1",
        threadId: "thread-1",
        worktreePath: "/repo/worktree-a",
      }),
    ).toEqual({
      T3CODE_PROJECT_ROOT: "/repo",
      T3CODE_PROJECT_ID: "project-1",
      T3CODE_THREAD_ID: "thread-1",
      T3CODE_WORKTREE_PATH: "/repo/worktree-a",
    });
  });

  it("merges custom env with authoritative server and launch values", () => {
    expect(
      mergeResolvedLaunchEnv({
        extraEnv: {
          T3CODE_PROJECT_ROOT: "/custom-root",
          T3CODE_PORT: "3773",
          CUSTOM_FLAG: "1",
        },
        t3Home: "/data/.t3",
        context: {
          projectRoot: "/repo",
          projectId: "project-1",
          threadId: "thread-1",
          worktreePath: "/repo/worktree-a",
        },
      }),
    ).toEqual({
      CUSTOM_FLAG: "1",
      T3CODE_HOME: "/data/.t3",
      T3CODE_PROJECT_ROOT: "/repo",
      T3CODE_PROJECT_ID: "project-1",
      T3CODE_THREAD_ID: "thread-1",
      T3CODE_WORKTREE_PATH: "/repo/worktree-a",
    });
  });
});
