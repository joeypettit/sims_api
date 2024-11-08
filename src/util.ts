export function simulateNetworkLatency(delay = 2000) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

export function removeKeysWhereUndefined(obj: Object) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
}
