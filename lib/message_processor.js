
var variably_sized_data_types;

var jdwp = require("./java_debug_wire_protocol");

var function_hash = [];

// Default
function_hash['0-0'] = function(raw_data, header, command_set, command, socket) {};

 // Reply - Extract the sizes of variably-sized data types in the target VM
function_hash['1-7'] = function(raw_data, header, command_set, command, socket) { 
  variably_sized_data_types = {
    fieldIDSize:         raw_data.parseBytesToInt(11, 14), // first 4 bytes after the header
    methodIDSize:        raw_data.parseBytesToInt(15, 18), // second 4 bytes after the header
    objectIDSize:        raw_data.parseBytesToInt(19, 22), // third 4 bytes after the header
    referenceTypeIDSize: raw_data.parseBytesToInt(23, 26), // fourth 4 bytes after the header
    frameIDSize:         raw_data.parseBytesToInt(27, 30)  // fifth 4 bytes after the header
  };
  
  var command = jdwp.suspend_command();
  parse_header(command);
  socket.write(command.prepareForSocketTransmission());
};

 // Reply - Suspend
function_hash['1-8'] = function(raw_data, header, command_set, command, socket) { 
  if (header.error_code == 0) {
    console.log('Application executing suspended');

    var command = jdwp.resume_command();
    parse_header(command);
    socket.write(command.prepareForSocketTransmission()); // first suspend by the debugger
    socket.write(command.prepareForSocketTransmission()); // second suspend done manually
  }
};

 // Reply - Resume
function_hash['1-9'] = function(raw_data, header, command_set, command, socket) { 
  if (header.error_code == 0) {
    console.log('Application executing resumed');
  }
};

// The functionality is not implemented in this virtual machine.
function_hash['64-99'] = function(data, header, command_set, command, socket) { socket.destroy(); };

// VM Start Event (among others)
function_hash['64-100'] = function(raw_data, header, command_set, command, socket) { 
  var data_length = header.data.length
  if (data_length >= 4) {
    var request_id = header.data.parseBytesToInt(0, 3);
    var thread     = header.data.parseBytesToInt(4, 12);
  }
  
  if (request_id == 33554432) { // VMStart --- this is a guess, but so far this has been consistent
    var request_variably_sized_data_types = jdwp.request_size_of_variably_sized_data_types();
    parse_header(request_variably_sized_data_types);
    socket.write(request_variably_sized_data_types.prepareForSocketTransmission());
  }
};


exports.process = function(data, socket) {
  data = data.toString().toBinary();
  
  var header = parse_header(data);

  var command_set = header.command_set;
  var command = header.command;

  if (jdwp.is_message_a_reply(header.id)) {
    jdwp.retrieve_values_from_previous_message(function(last_command_set, last_command) {
      command_set = last_command_set;
      command     = last_command;
    });
  }
  
  if (typeof function_hash[command_set + '-' + command] == "undefined") {
    console.log('Unable to process: ' + command_set + '-' + command);
    return;
  }
  function_hash[command_set + '-' + command].call(this, data, header, command_set, command, socket);
}

var parse_header = function(raw_data) {  
  var length      = raw_data.parseBytesToInt(0, 3);
  var id          = raw_data.parseBytesToInt(4, 7);
  var flags       = raw_data.parseBytesToInt(8, 8);
  var error_code  = raw_data.parseBytesToInt(9, 10);  // error_code overlaps the command_set and command
  var command_set = raw_data.parseBytesToInt(9, 9);   // so it is either the error_code or the command_set and command
  var command     = raw_data.parseBytesToInt(10, 10); // (will be refactored as I believe I don't get the error code)
  var data        = [];
  if (length > 11) {
    for (var i = 11; i < length; i++) {
      data.push(raw_data[i])
    }
  }

  console.log('Length:      ' + length);
  console.log('Id:          ' + id);
  console.log('Flags:       ' + flags);
  console.log('Error code:  ' + error_code);
  console.log('Command set: ' + command_set);
  console.log('Command:     ' + command);
  console.log('Data:        ' + data);
  console.log();
  
  return {
    length:      length,
    id:          id,
    flags:       flags,
    error_code:  error_code,
    command_set: command_set,
    command:     command,
    data:        data
  };
};


