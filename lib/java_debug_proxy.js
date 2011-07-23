
var net = require("net");
var sys = require("sys");


exports.create_proxy = function() {

  var that = this;
  var socket;
  this.debug_port = 10001;
  
  var listen = function(port, callback) {
    
    var timeout = setTimeout(function() {
      clearInterval(interval);
    }, 5000);

    var interval = setInterval(function(){
      socket = new net.Socket();
      
      socket.on('error', function(err){
        if (err.errno != 61) {
          console.log(err);
          clearInterval(interval);
          clearTimeout(timeout);
          socket.destroy();
        }
      });
      
      socket.connect(port, '127.0.0.1', function(client) {
        console.log('connected');
        clearInterval(interval);
        clearTimeout(timeout);
      });      
    }, 200);
    
  };


  
  return (function(){ 
    return {
      listen: listen
    };
  })();
};


