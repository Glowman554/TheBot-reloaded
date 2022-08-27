export function assert(res: boolean) {
    if (!res) {
        throw new Error("Assertion failed");
    }
}