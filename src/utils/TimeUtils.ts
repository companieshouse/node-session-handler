export function getSecondsSinceEpoch(): number {
    return Math.round(new Date().getTime() / 1000);
}
