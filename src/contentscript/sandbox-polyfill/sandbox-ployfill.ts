Object.defineProperty(document, 'cookie', {
  get: function () {
    return ''
  },
  set: function () {
    return true
  },
})
