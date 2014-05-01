process.env.NODE_ENV = 'test';

var server = require('./server');
var should = require('should');

var sw = require('../').SiteWatcher;

describe('site watcher', function() {
  it('should run', function(done) {
    var res = [];
    var w = new sw(server.url,
      '* * * * * *', {
        parse: function(data, cb) {
          cb(null, [1, 2, 3]);
        },
        save: function(item, cb) {
          res.push(item);
          cb(null);
        },
        cleanup: function(items, cb) {
          items.should.eql(res);
          cb(null, items);
        }
      }, function(err, items) {
        w.stop();
        items.should.eql([1, 2, 3]);
        should.not.exist(err);
        done();
      });
    w.start();
  });

  it('should run twice', function(done) {
    this.timeout(5000);
    var res = [];
    var counter = 0;
    var w = new sw(server.url,
      '* * * * * *', {
        parse: function(data, cb) {
          cb(null, [1, 2, 3]);
        },
        save: function(item, cb) {
          res.push(item);
          cb(null);
        },
        cleanup: function(items, cb) {
          items.should.eql([1, 2, 3]);
          cb(null, items);
        }
      }, function(err, items) {
        should.not.exist(err);
        items.should.eql([1, 2, 3]);
        counter++;
        if (counter === 2) {
          res.should.eql([1, 2, 3, 1, 2, 3]);
          w.stop();
          done();
        }
      });
    w.start();
  });

  it('should fail getting data', function(done) {
    var w = new sw(-1,
      '* * * * * *', {},
      function(err, items) {
        w.stop();
        err.should.containEql('Get data failed:');
        should.exist(items);
        items.should.eql([]);
        items.should.have.length(0);
        done();
      });
    w.start();
  });

  it('should fail parsing', function(done) {
    var w = new sw(server.url,
      '* * * * * *', {
        parse: function(data, cb) {
          cb('intended');
        }
      }, function(err, items) {
        w.stop();
        err.should.equal('Parse data failed: intended');
        should.exist(items);
        items.should.eql([]);
        items.should.have.length(0);
        done();
      });
    w.start();
  });

  it('should fail in iteration', function(done) {
    var res = [];
    var w = new sw(server.url,
      '* * * * * *', {
        parse: function(data, cb) {
          cb(null, [1]);
        },
        save: function(item, cb) {
          cb('intended');
        }
      }, function(err, items) {
        w.stop();
        err.should.equal('Iteration failed: intended');
        should.exist(items);
        items.should.eql([]);
        items.should.have.length(0);
        done();
      });
    w.start();
  });
});
