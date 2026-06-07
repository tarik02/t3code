import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { ServerConfig } from "../../config.ts";
import { LaunchEnv, makeResolveLaunchEnv, type LaunchEnvShape } from "../Services/LaunchEnv.ts";

export const makeLaunchEnv = Effect.fn("makeLaunchEnv")(function* () {
  const serverConfig = yield* ServerConfig;

  return {
    resolve: makeResolveLaunchEnv(serverConfig.baseDir),
  } satisfies LaunchEnvShape;
});

export const LaunchEnvLive = Layer.effect(LaunchEnv, makeLaunchEnv());
