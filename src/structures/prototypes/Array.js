/* eslint-disable prefer-spread */
/* eslint-disable no-extend-native */
Object.defineProperty(Array.prototype, 'chunk', {
  value: function (chunkSize) {
    // eslint-disable-next-line no-var
    var array = this;
    return [].concat.apply([],
      array.map(function (elem, i) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    );
  }
});
