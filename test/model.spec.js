var mongoose = require('mongoose');
var mockgoose = require('Mockgoose');
mockgoose(mongoose);
var subject = require('../model');

describe('model', function() {

  beforeEach(function() {
    mockgoose.reset();
  });

  describe('findOrCreatePlayer', function() {
    describe('when there is no player with the given email', function() {
      it('creates a player', function(done) {
        subject.findOrCreatePlayer("RockMAN", "rockman@example.com", function(newPlayer) {
          expect(newPlayer.name).toBe("RockMAN");
          expect(newPlayer.email).toBe("rockman@example.com");
          done();
        });
      });

      it('creates the player with no score', function(done) {
        var newPlayer = subject.findOrCreatePlayer("RockMAN", "rockman@example.com", function(newPlayer) {
          expect(newPlayer.score).toBe(0);
          expect(newPlayer.wins).toBe(0);
          expect(newPlayer.losses).toBe(0);
          done();
        });
      });
    });
  });
});
