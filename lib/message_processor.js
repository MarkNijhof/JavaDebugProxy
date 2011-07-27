
var last_id = 1;
var last_command_set;
var last_command;
var empty_byte = '00000000';
var variably_sized_data_types;

var function_hash = [];

 // Extract the sizes of variably-sized data types in the target VM
function_hash['1-7'] = function(data, header, command_set, command, socket) { 
  variably_sized_data_types = {
    fieldIDSize:         parseInt([data[11], data[12], data[13], data[14]].join(''), 2),
    methodIDSize:        parseInt([data[15], data[16], data[17], data[18]].join(''), 2),
    objectIDSize:        parseInt([data[19], data[20], data[21], data[22]].join(''), 2),
    referenceTypeIDSize: parseInt([data[23], data[24], data[25], data[26]].join(''), 2),
    frameIDSize:         parseInt([data[27], data[28], data[29], data[30]].join(''), 2)
  };
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
  var length      = parseInt([data[0], data[1], data[2], data[3]].join(''), 2);
  var id          = parseInt([data[4], data[5], data[6], data[7]].join(''), 2);
  var flags       = parseInt([data[8]].join(''), 2);
  var error_code  = parseInt([data[9], data[10]].join(''), 2);
  var command_set = parseInt([data[9]].join(''), 2);
  var command     = parseInt([data[10]].join(''), 2);

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

