var events = require('ampersand-events');
var bind = require('lodash/bind');
var forEach = require('lodash/forEach');

var deferbounce = function (fn) {
    var triggered = false;
    return function () {
        var self = this;
        if (!triggered) {
            triggered = true;
            setTimeout(function() {
                fn.call(self);
                triggered = false;
            }, 0)
        }
    }
};

var safeForceUpdate = function () {
    if (this._isMounted) {
        this.forceUpdate();
    }
};

module.exports = events.createEmitter({

    watch: function (modelOrCollection, opts) {
        var events;

        if (modelOrCollection !== null && typeof modelOrCollection === 'object'){
          if (modelOrCollection.isCollection) {
              events = 'add remove reset sort';
          } else if (modelOrCollection.isState) {
              events = 'change';
          }
        }

        if (!events){
          return;
        }

        this.listenTo(modelOrCollection, events, deferbounce(bind(safeForceUpdate, this)));

        if (opts.reRender) safeForceUpdate.call(this);
    },

    componentDidMount: function () {
        this._isMounted = true;
        var watched = this.getObservedItems && this.getObservedItems();
        if (watched) {
            forEach(watched, this.watch, this);
        }
        if (this.autoWatch !== false) {
            forEach(this.props, this.watch, this);
        }
    },

    componentWillUnmount: function () {
        this._isMounted = false;
        this.stopListening();
    }
});
