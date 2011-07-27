
var last_id = 1;
var last_command_set;
var last_command;
var empty_byte = '00000000';
var variably_sized_data_types;

var function_hash = [];

 // Extract the sizes of variably-sized data types in the target VM
function_hash['1-7'] = function(data, header, command_set, command, socket) { 
  console.log("Data: '" + data + "'");
  variably_sized_data_types = {
    fieldIDSize:         parse_bytes_to_int(data, 11, 14), // first 4 bytes after the header
    methodIDSize:        parse_bytes_to_int(data, 15, 18), // second 4 bytes after the header
    objectIDSize:        parse_bytes_to_int(data, 19, 22), // third 4 bytes after the header
    referenceTypeIDSize: parse_bytes_to_int(data, 23, 26), // fourth 4 bytes after the header
    frameIDSize:         parse_bytes_to_int(data, 27, 30)  // fifth 4 bytes after the header
  };
  console.log(variably_sized_data_types)
};

 // The functionality is not implemented in this virtual machine.
function_hash['64-99'] = function(data, header, command_set, command, socket) { socket.destroy(); };

// VM Start Event (among others)
function_hash['64-100'] = function(data, header, command_set, command, socket) { 
  var request_variably_sized_data_types = 
    build_length(11)
    .concat(get_new_message_id())
    .concat([empty_byte])
    .concat(build_command_set(1))
    .concat(build_command(7));
  
  parse_header(request_variably_sized_data_types);

  socket.write(bin2String(request_variably_sized_data_types));
};


exports.process = function(data, socket) {
  data = string2Bin(data.toString());
  
  // console.log("Data: '" + data + "'");
  
  var header = parse_header(data);

  var command_set = header.command_set;
  var command = header.command;

  if (header.id == last_id) {
    command_set = last_command_set;
    command = last_command;
  }
  
  function_hash[command_set + '-' + command].call(this, data, header, command_set, command, socket);
}

var parse_header = function(data) {  
  var length      = parse_bytes_to_int(data, 0, 3);
  var id          = parse_bytes_to_int(data, 4, 7);
  var flags       = parse_bytes_to_int(data, 8, 8);
  var error_code  = parse_bytes_to_int(data, 9, 10);  // error_code overlaps the command_set and command
  var command_set = parse_bytes_to_int(data, 9, 9);   // so it is either the error_code or the command_set and command
  var command     = parse_bytes_to_int(data, 10, 10); // (will be refactored as I believe I don't get the error code)

  console.log('Length:      ' + length);
  console.log('Id:          ' + id);
  console.log('Flags:       ' + flags);
  console.log('Error code:  ' + error_code);
  console.log('Command set: ' + command_set);
  console.log('Command:     ' + command);
  console.log();
  
  return {
    length:      length,
    id:          id,
    flags:       flags,
    error_code:  error_code,
    command_set: command_set,
    command:     command
  };
};

var get_new_message_id = function() {
  last_id++;
  var result = parseInt(last_id).toString(2).rpad(empty_byte + empty_byte + empty_byte + empty_byte);
  return [result.substring(0, 8), result.substring(8,16), result.substring(16,24), result.substring(24,32)];
};

var build_command_set = function(command_set) {
  last_command_set = command_set;
  return [parseInt(command_set).toString(2).rpad(empty_byte)];
}

var build_command = function(command) {
  last_command = command;
  return [parseInt(command).toString(2).rpad(empty_byte)];
}

var build_length = function(length) {  
  var result = parseInt(length).toString(2).rpad(empty_byte + empty_byte + empty_byte + empty_byte);
  return [result.substring(0,8), result.substring(8,16), result.substring(16,24), result.substring(24,32)];
};

var parse_bytes_to_int = function(bytes, from, to) {
  binary = '';
  for (var i = from; i <= to; i++) {
    binary += bytes[i];
  }
  return parseInt(binary, 2);
}

function string2Bin(str) {
  var result = [];
  for (var i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i).toString(2).rpad(empty_byte));
  }
  return result;
};

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i], 2));
  }
  return result;
};

Object.prototype.rpad = function(padding) { 
  return( padding.substr(0, ( padding.length - this.length ) ) + this ); 
};

