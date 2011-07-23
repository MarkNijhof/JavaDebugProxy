
var compiler = require('../lib/java_compiler');
var executor = require('../lib/java_executor');
var proxy    = require('../lib/java_debug_proxy').create_proxy();

var debug = true;

compiler.compile('HelloWorld.java', [], { 
  cwd: './', 
  debug: debug,
  capture_output: function(data) { console.log(data); },
  capture_error: function(data) { console.log(data); } 
});


executor.find_port(function(port) {
  executor.execute("HelloWorld", [], { 
    cwd: './', 
    debug: debug,
    debug_port: port,
    capture_output: function(data) { console.log(data); },
    capture_error:  function(data) { console.log(data); } 
  });

  console.log("started on post: " + port);

  proxy.listen(port);
});

