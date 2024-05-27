/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path: string) {
    return /^(https?:|http?:|mailto:|tel:)/.test(path)
}