/* eslint-disable prefer-spread */
/* eslint-disable no-extend-native */
String.prototype.toProperCase = function () {
  return this.toLowerCase().replace(/^(.)|\s(.)/g, function ($1) {
    return $1.toUpperCase();
  });
};

String.prototype.replaceSpaces = function () {
  return this.replace(/  +/g, ' ');
};
