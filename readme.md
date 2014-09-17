# Couchback

Couchback is a [Backbone.js](http://backbonejs.org/) extension to support interacting with [CouchDB](http://couchdb.apache.org/) more easily.

# Usage

## Collections

Collections should be based around CouchDB views. If the URL for your CouchDB view is `http://localhost:5984/my-database/_design/my-design/_view/my-view` then you can create a collection like this:

```
var MyCollection = Backbone.Couch.Collection({
    couch_host: "//localhost:5984",
    couch_name: "my-database",
    couch_design: "my-design",
    couch_view: "my-view",

    model: MyModel
});
```

Models are even easier:

```
var MyModel = Backbone.Couch.Model({
    // normal backbone model type stuff goes here ...
});
```

You can only add Couch Models to Couch Collections, but apart from that all the regular Backbone sync methods should work.

# CouchDB Notes

If you want to use CouchDB for a public web app then you will need to enable CORS, you can do this by addding the following to your `local.ini` config (located at `/etc/couchdb/local.ini` on Ubuntu.)

```
[httpd]
enable_cors = true 

[cors]
origins = *
```

Or you can add the same settings through the CouchDB web interface.

You may also want to read about [security](http://guide.couchdb.org/draft/security.html) in CouchDB.

# License

This code is copyright [Joe Bain](http://joeba.in) and is offered under an MIT license.
