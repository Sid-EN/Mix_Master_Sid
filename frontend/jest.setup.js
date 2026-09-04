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
