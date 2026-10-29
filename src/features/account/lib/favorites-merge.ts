/**
 * Three-way merge of saved places: what the account has (`server`), what this
 * phone has (`local`) and what both agreed on at the last sync (`base`).
 * A save or removal made on either side wins over "unchanged", so removing a
 * place on one phone doesn't bring it back from another.
 */
export function mergeFavorites(server: string[], local: string[], base: string[]) {
  const S = new Set(server);
  const L = new Set(local);
  const B = new Set(base);
  const addedHere = local.filter((id) => !B.has(id));
  const removedHere = base.filter((id) => !L.has(id));
  const removedHereSet = new Set(removedHere);
  const merged = [...server.filter((id) => !removedHereSet.has(id))];
  for (const id of addedHere) if (!merged.includes(id)) merged.push(id);
  // Keep the phone's order first, then anything new from the account.
  const ordered = [
    ...local.filter((id) => merged.includes(id)),
    ...merged.filter((id) => !L.has(id)),
  ];
  return {
    merged: ordered,
    toAdd: addedHere.filter((id) => !S.has(id)),
    toRemove: removedHere.filter((id) => S.has(id)),
  };
}
