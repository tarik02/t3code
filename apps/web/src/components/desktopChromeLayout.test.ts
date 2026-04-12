import { describe, expect, it } from "vitest";

import {
  DESKTOP_CHROME_TITLEBAR_HEIGHT_PX,
  resolveDesktopChromeRootStyle,
  resolveDesktopChromeSafeAreaStyle,
  resolveDesktopChromeSafeInlineSize,
} from "./desktopChromeLayout";

describe("desktop chrome layout helpers", () => {
  it("computes a safe inline inset from the number of controls", () => {
    expect(resolveDesktopChromeSafeInlineSize(0)).toBe("1rem");
    expect(resolveDesktopChromeSafeInlineSize(2)).toBe("4.5rem");
  });

  it("maps both control banks into root CSS variables", () => {
    expect(
      resolveDesktopChromeSafeAreaStyle({
        leftControlCount: 1,
        rightControlCount: 3,
      }),
    ).toEqual({
      "--desktop-chrome-safe-inline-start": "2.75rem",
      "--desktop-chrome-safe-inline-end": "6.25rem",
    });
  });

  it("uses the previous hardcoded macos inset", () => {
    expect(
      resolveDesktopChromeRootStyle({
        platform: "macos",
        linuxTitleBarMode: "native",
        windowControlsLayout: null,
      }),
    ).toEqual({
      "--desktop-chrome-safe-inline-start": "90px",
      "--desktop-chrome-safe-inline-end": "0",
      "--desktop-chrome-titlebar-height": `${DESKTOP_CHROME_TITLEBAR_HEIGHT_PX}px`,
    });
  });

  it("uses control-count based insets for linux custom titlebars", () => {
    expect(
      resolveDesktopChromeRootStyle({
        platform: "linux",
        linuxTitleBarMode: "custom",
        windowControlsLayout: {
          left: ["minimize"],
          right: ["maximize", "close"],
        },
      }),
    ).toEqual({
      "--desktop-chrome-safe-inline-start": "2.75rem",
      "--desktop-chrome-safe-inline-end": "4.5rem",
      "--desktop-chrome-titlebar-height": `${DESKTOP_CHROME_TITLEBAR_HEIGHT_PX}px`,
    });
  });

  it("uses safe area env vars for WCO platforms", () => {
    expect(
      resolveDesktopChromeRootStyle({
        platform: "windows",
        linuxTitleBarMode: "native",
        windowControlsLayout: null,
      }),
    ).toEqual({
      "--desktop-chrome-safe-inline-start": "env(safe-area-inset-left)",
      "--desktop-chrome-safe-inline-end": "env(safe-area-inset-right)",
      "--desktop-chrome-titlebar-height": `${DESKTOP_CHROME_TITLEBAR_HEIGHT_PX}px`,
    });
  });

  it("zeros all desktop chrome variables when no custom or WCO chrome is active", () => {
    expect(
      resolveDesktopChromeRootStyle({
        platform: "linux",
        linuxTitleBarMode: "native",
        windowControlsLayout: null,
      }),
    ).toEqual({
      "--desktop-chrome-safe-inline-start": "0",
      "--desktop-chrome-safe-inline-end": "0",
      "--desktop-chrome-titlebar-height": "0",
    });
  });
});
