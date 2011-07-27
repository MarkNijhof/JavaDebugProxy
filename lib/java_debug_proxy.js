
var net = require("net");
var sys = require("sys");
var processor = require('./message_processor');


exports.create_proxy = function() {

  var that = this;
  var socket;
  this.debug_port = 10001;
  
  var listen = function(port, callback) {
    
    var timeout = setTimeout(function() {
      clearInterval(interval);
    }, 5000);

    var interval = setInterval(function(){
      socket = net.createConnection(port, '127.0.0.1');
      
      socket.on('error', function(err){
        if (err.errno != 61) {
          console.log('Error: ' + err.errno + ' - ' + err);
          clearInterval(interval);
          clearTimeout(timeout);
          socket.destroy();
        }
      });
      
      socket.on('data', function(data) {
        if (data.toString() == 'JDWP-Handshake@dZ') {
          processor.process(data.splice(0, 14), socket);
        } else if (data.toString() != 'JDWP-Handshake') {
          processor.process(data, socket);
        }
      });
      
      socket.on('connect', function() {
        console.log('Connected');
        clearInterval(interval);
        clearTimeout(timeout);
        
        socket.write('JDWP-Handshake');
        socket.flush();
      });
            
    }, 200);
    
  };
  
  return (function(){ 
    return {
      listen: listen
    };
  })();
};


