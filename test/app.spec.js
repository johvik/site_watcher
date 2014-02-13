process.env.NODE_ENV = 'test';

var should = require('should');

var sw = require('../').SiteWatcher;

describe('site watcher', function() {
  it('should run', function(done) {
    var res = [];
    var w = new sw('http://www.google.com',
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
          cb(null);
        }
      }, function(err) {
        w.stop();
        should.not.exist(err);
        done();
      });
    w.start();
  });

  it('should run twice', function(done) {
    this.timeout(5000);
    var res = [];
    var counter = 0;
    var w = new sw('http://www.google.com',
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
          cb(null);
        }
      }, function(err) {
        should.not.exist(err);
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
      function(err) {
        w.stop();
        err.should.containEql('Get data failed:');
        done();
      });
    w.start();
  });

  it('should fail parsing', function(done) {
    var w = new sw('http://www.google.com',
      '* * * * * *', {
        parse: function(data, cb) {
          cb('intended');
        }
      }, function(err) {
        w.stop();
        err.should.equal('Parse data failed: intended');
        done();
      });
    w.start();
  });

  it('should fail in iteration', function(done) {
    var res = [];
    var w = new sw('http://www.google.com',
      '* * * * * *', {
        parse: function(data, cb) {
          cb(null, [1]);
        },
        save: function(item, cb) {
          cb('intended');
        }
      }, function(err) {
        w.stop();
        err.should.equal('Iteration failed: intended');
        done();
      });
    w.start();
  });
});
