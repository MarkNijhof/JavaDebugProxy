
if (typeof String.toBinary == 'undefined') {
  String.prototype.toBinary = function() {
    var empty_byte = '00000000';
    var result     = [];
    for (var i = 0; i < this.length; i++) {
      result.push(this.charCodeAt(i).toString(2).rpad(empty_byte));
    }
    return result;
  };
}

if (typeof Array.binaryToString == 'undefined') {
  Array.prototype.binaryToString = function() {
    var result = "";
    for (var i = 0; i < this.length; i++) {
      result += String.fromCharCode(parseInt(this[i], 2));
    }
    return result;
  };
}

if (typeof Array.parseBytesToInt == 'undefined') {
  Array.prototype.parseBytesToInt = function(from, to) {
    binary = '';
    for (var i = from; i <= to; i++) {
      binary += this[i];
    }
    return parseInt(binary, 2);
  };
}

if (typeof Array.prepareForSocketTransmission == 'undefined') {
  Array.prototype.prepareForSocketTransmission = function() {
    return this.binaryToString();
  };
}


if (typeof Object.rpad == 'undefined') {
  Object.prototype.rpad = function(padding) { 
    return( padding.substr(0, ( padding.length - this.length ) ) + this ); 
  };
}