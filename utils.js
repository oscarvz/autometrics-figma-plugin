export function isRgbaValue(value) {
    return (Object.keys(value).includes("r") &&
        Object.keys(value).includes("g") &&
        Object.keys(value).includes("b") &&
        Object.keys(value).includes("a"));
}
