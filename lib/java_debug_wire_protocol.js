
require('./extentions');

var last_id    = 1;
var last_command;
var last_command_set;
var empty_byte = '00000000';

exports.get_if_of_last_send_message = function() {
  return last_id;
};

exports.is_message_a_reply = function(header_id) {
  return parseInt(header_id) == parseInt(last_id);
};

exports.retrieve_values_from_previous_message = function(fn) {
  fn.call(this, last_command_set, last_command);
};

exports.handshake_message = function() {
  return "JDWP-Handshake".toBinary();
};

exports.classes_by_signature_command = function(class_signature) {
  var data = class_signature.toBinary();
  
  return message_length(11 + data.length)
    .concat(message_id())
    .concat([empty_byte])
    .concat(message_command_set(1))
    .concat(message_command(2))
    .concat(data);
};

exports.get_all_classes_command = function() {
  return message_length(11)
    .concat(message_id())
    .concat([empty_byte])
    .concat(message_command_set(1))
    .concat(message_command(3));
};

exports.request_size_of_variably_sized_data_types = function() {
  return message_length(11)
    .concat(message_id())
    .concat([empty_byte])
    .concat(message_command_set(1))
    .concat(message_command(7));
};

exports.suspend_command = function() {
  return message_length(11)
    .concat(message_id())
    .concat([empty_byte])
    .concat(message_command_set(1))
    .concat(message_command(8));
};

exports.resume_command = function() {
  return message_length(11)
    .concat(message_id())
    .concat([empty_byte])
    .concat(message_command_set(1))
    .concat(message_command(9));
};

exports.exit_command = function() {
  return message_length(11)
    .concat(message_id())
    .concat([empty_byte])
    .concat(message_command_set(1))
    .concat(message_command(10));
};

exports.hold_events_command = function() {
  return message_length(11)
    .concat(message_id())
    .concat([empty_byte])
    .concat(message_command_set(1))
    .concat(message_command(15));
};

exports.resume_events_command = function() {
  return message_length(11)
    .concat(message_id())
    .concat([empty_byte])
    .concat(message_command_set(1))
    .concat(message_command(16));
};



var message_id = function() {
  last_id++;
  var result = parseInt(last_id).toString(2).rpad(empty_byte + empty_byte + empty_byte + empty_byte);
  return [result.substring(0, 8), result.substring(8,16), result.substring(16,24), result.substring(24,32)];
};

var message_command_set = function(command_set) {
  last_command_set = command_set;
  return [parseInt(command_set).toString(2).rpad(empty_byte)];
}

var message_command = function(command) {
  last_command = command;
  return [parseInt(command).toString(2).rpad(empty_byte)];
}

var message_length = function(length) {  
  var result = parseInt(length).toString(2).rpad(empty_byte + empty_byte + empty_byte + empty_byte);
  return [result.substring(0,8), result.substring(8,16), result.substring(16,24), result.substring(24,32)];
};
