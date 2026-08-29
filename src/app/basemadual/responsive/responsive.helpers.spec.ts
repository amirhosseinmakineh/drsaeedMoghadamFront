import { resolveBaseViewport } from "./responsive.helpers";
describe("resolveBaseViewport", () => {
  it("uses mobile-first breakpoints", () => {
    expect(resolveBaseViewport(320)).toBe("mobile");
    expect(resolveBaseViewport(768)).toBe("tablet");
    expect(resolveBaseViewport(1024)).toBe("desktop");
    expect(resolveBaseViewport(1440)).toBe("large");
  });
});
