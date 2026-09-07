require('@testing-library/jest-dom')

// jsdom 尚未實作 Blob/File 的 text()，但該 API 在所有現代瀏覽器皆可用。
// 於此補上，以免為了配合測試環境而改動正式程式碼。
if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
  Blob.prototype.text = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsText(this)
    })
  }
}

// jsdom 沒有版面配置，因此未實作 scrollIntoView；該 API 在所有瀏覽器皆可用。
// 於此補上空實作，以免為了配合測試環境而在正式程式碼加上防呆。
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {}
}

// jsdom 未提供 TextEncoder／TextDecoder，但兩者是瀏覽器的標準 API。
// 直接沿用 Node 的實作，以免為了配合測試環境而改動正式程式碼。
const { TextEncoder, TextDecoder } = require('node:util')
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder
