export function simulateNetworkLatency(delay = 2000) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}
