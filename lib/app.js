var request = require('superagent');
var async = require('async');
var cronJob = require('cron').CronJob;

function getData(address, callback) {
  // Get data as a string from the response
  request.get(address).buffer().end(function(err, res) {
    if (err) {
      return callback('Get error: ' + err, '');
    }
    if (res.status !== 200) {
      return callback('Wrong status: ' + res.status, '');
    }
    return callback(null, res.text || '');
  });
}

exports.SiteWatcher = function(address, cronString, dataFunctions, periodicCallback) {
  function update() {
    getData(address, function(err, data) {
      if (err) {
        return periodicCallback('Get data failed: ' + err, []);
      }
      dataFunctions.parse(data, function(err, items) {
        if (err) {
          return periodicCallback('Parse data failed: ' + err, []);
        }
        async.eachSeries(items, function(item, cb) {
          dataFunctions.save(item, cb);
        }, function(err) {
          if (err) {
            return periodicCallback('Iteration failed: ' + err, []);
          }
          dataFunctions.cleanup(items, periodicCallback);
        });
      });
    });
  }

  var job = new cronJob(cronString, update);
  return {
    start: function() {
      job.start();
    },
    stop: function() {
      job.stop();
    }
  };
};
