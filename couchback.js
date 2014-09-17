function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone'], function(Backbone) {
            return (root.CouchBack = factory(root, Backbone));
        });
    } else if (typeof exports !== 'undefined') {
        var Backbone = require('backbone');
        module.exports = factory(root, Backbone);
    } else {
        root.CouchBack = factory(root, root.Backbone);
    }
}(this, function(root, Backbone) {
    'use strict';

    Backbone.Couch = {
        Model: Backbone.Model.extend({
            idAttribute: "_id",

            parse: function(resp, options) {
                return resp.doc;
            },

            url: function() {
                return "//" + this.collection.couch_host + "/" + this.collection.couch_name + "/" + this.id;
            },

            sync: function(method, model, options) {
                options = options || {};

                if (method === "delete") {
                    options.url = this.url() + "?rev=" + this.get("_rev");
                }

                var that = this;
                var oldSuccess = options.success;
                options.success = function(resp) {
                    if (resp.rev) {
                        that.set("_rev", resp.rev);
                    }
                    oldSuccess && oldSuccess.apply(this, arguments);
                }

                Backbone.sync.call(this, method, model, options);
            }
        }),

        Collection: Backbone.Collection.extend({
            url: function() {
                var url = "//" + this.couch_host + "/" + this.couch_name;
                if (this.couch_view && this.couch_design) {
                    url += "/_design/" + this.couch_design + "/_view/" + this.couch_view + "?include_docs=true";
                }
                return url;
            },

            parse: function(resp, options) {
                return resp.rows;
            }
        })
    };

    return Backbone.Couch;

});
