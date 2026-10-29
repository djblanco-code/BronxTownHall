import { describe, expect, it } from "vitest";
import { mergeFavorites } from "./favorites-merge";

describe("mergeFavorites", () => {
  it("first sign-in uploads the phone's saves and pulls the account's", () => {
    const r = mergeFavorites(["a"], ["b"], []);
    expect(r.merged.sort()).toEqual(["a", "b"]);
    expect(r.toAdd).toEqual(["b"]);
    expect(r.toRemove).toEqual([]);
  });

  it("a removal on this phone is removed from the account", () => {
    const r = mergeFavorites(["a", "b"], ["a"], ["a", "b"]);
    expect(r.merged).toEqual(["a"]);
    expect(r.toRemove).toEqual(["b"]);
  });

  it("a removal on another device is not brought back by this phone", () => {
    const r = mergeFavorites(["a"], ["a", "b"], ["a", "b"]);
    expect(r.merged).toEqual(["a"]);
    expect(r.toAdd).toEqual([]);
  });

  it("nothing to do when both sides match", () => {
    const r = mergeFavorites(["a", "b"], ["b", "a"], ["a", "b"]);
    expect(r.merged).toEqual(["b", "a"]);
    expect(r.toAdd).toEqual([]);
    expect(r.toRemove).toEqual([]);
  });
});
