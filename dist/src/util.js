"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateNetworkLatency = simulateNetworkLatency;
exports.removeKeysWhereUndefined = removeKeysWhereUndefined;
function simulateNetworkLatency(delay = 2000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}
function removeKeysWhereUndefined(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined));
}
