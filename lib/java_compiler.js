
var spawn = require("child_process").spawn;

exports.compile = function(file, args, options, callback) {

  if (typeof options == "function" && typeof callback == "undefined") {
    callback = options;
    options = {};
  } else if (typeof options == "undefined") {
    options = {};
  }

  var cwd             = options.cwd || "";
  var env             = options.env || "";
  var capture_output  = options.capture_output || function(data) {};
  var capture_error   = options.capture_error  || function(data) {};
  var debug           = options.debug || false;
  
  if (debug) {
    args.push('-g');
  }
  args.push(file);

  capture_output.call(this, "Executing: javac " + args.join(" "));
  var child = spawn("javac", args, {cwd: cwd, env: env});

  child.stdout.on("data", function(data) { capture_output.call(this, data.toString("utf8")) });
  child.stderr.on("data", function(data) { capture_error.call(this, data.toString("utf8")) });

  child.on("exit", function(code) { 
    if (code !== 0) {
      capture_error('Process exited with code ' + code);
    }
    if (typeof callback == "function") {
      callback.call();
    }
  });
  
  return child;
};
