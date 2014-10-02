(function(root, factory) {
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
                return "//" + this.couch_host + "/" + this.couch_name + "/" + this.id;
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

        GroupModel: Backbone.Model.extend({
            idAttribute: "key",
            parse: function(resp, options) {
                var attrs = resp;
                for (var a in attrs.value) {
                    if (attrs.value.hasOwnProperty(a)) {
                        attrs[a] = attrs.value[a];
                    }
                }
                delete attrs.value;
                return attrs;
            },
        }),

        Collection: Backbone.Collection.extend({
            couch_include_docs: true,
            couch_options: {},
            couch_group: false,
            couch_list: undefined,

            url: function() {
                // put together the url path
                var url = "//" + this.couch_host + "/" + this.couch_name;



                if (this.couch_design && this.fetchOptions && this.fetchOptions.key && this.fetchOptions.value) {
                    url += "/_design/" + this.couch_design
                    url += "/_view/by-" + this.fetchOptions.key;
                }
                else if (this.couch_design) {
                    url += "/_design/" + this.couch_design
                    if (this.couch_list && this.couch_view) {
                        url += "/_list/" + this.couch_list + "/" + this.couch_view;
                    } else if (this.couch_view) {
                        url += "/_view/" + this.couch_view;
                    }
                }

                // put together the url options
                var url_opts = {};
                if (this.couch_group_level) {
                    url_opts.group_level = this.couch_group_level;
                } else if (this.couch_group) {
                    url_opts.group = true;
                } else if (this.couch_include_docs) {
                    url_opts.include_docs = true;
                }
                if (this.fetchOptions && this.fetchOptions.key && this.fetchOptions.value) {
                    url_opts.key = "\"" + this.fetchOptions.value + "\"";
                }
                if (this.couch_options) {
                    for (var o in this.couch_options) {
                        if (this.couch_options.hasOwnProperty(o)) {
                            url_opts[o] = this.couch_options[o];
                        }
                    }
                }

                // build the query string
                var queryString = "";
                for (var o in url_opts) {
                    if (url_opts.hasOwnProperty(o)) {
                        queryString += encodeURIComponent(o) + "=" + encodeURIComponent(url_opts[o]) + "&";
                    }
                }
                if (queryString.length > 0) {
                    queryString = queryString.substr(0, queryString.length-1);
                    url += "?"+queryString;
                }

                if (this.fetchOptions) {
                    delete this.fetchOptions;
                }

                return url;
            },

            parse: function(resp, options) {
                return resp.rows;
            },

            fetch: function(options) {
                this.fetchOptions = options;
                return Backbone.Collection.prototype.fetch.apply(this, arguments);
            },

            _prepareModel: function(attrs, options) {
                var model = Backbone.Collection.prototype._prepareModel.apply(this, arguments);
                if (model) {
                    model.couch_host = this.couch_host;
                    model.couch_name = this.couch_name;
                }
                return model;
            }
        })
    };

    return Backbone.Couch;

}));
