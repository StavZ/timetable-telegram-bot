Object.defineProperty(Array.prototype, 'chunk', {
  value: function (chunkSize) {
    var array = this;
    return [].concat.apply(
      [],
      array.map(function (elem, i) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    );
  },
});
Object.defineProperty(Array.prototype, 'removeItem', {
  value: function (item) {
    var array = this;
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
    return array;
  },
});
