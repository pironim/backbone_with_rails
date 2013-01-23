(function ($) {
    var contacts = [
            { name: "Contact 1", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
            { name: "Contact 2", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
            { name: "Contact 3", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
            { name: "Contact 4", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
            { name: "Contact 5", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
            { name: "Contact 6", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
            { name: "Contact 7", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
            { name: "Contact 8", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" }
        ];

  var Contact = Backbone.Model.extend({
    defaults: {
      photo: "/assets/placeholder.png",
      name: "",
      address: "",
      tel: "",
      email: "",
      type: ""
    }
  });

  var Directory = Backbone.Collection.extend({
    model: Contact
  });

  var ContactView = Backbone.View.extend({
    tagName: "article",
    className: "contact-container",
    template: JST['templates/contacts/show'],
    editTemplate: JST['templates/contacts/edit'],

    events: {
        "click button.delete": "deleteContact",
        "click button.edit": "editContact",
        "change select.type": "addType",
        "click button.save": "saveEdits",
        "click button.cancel": "cancelEdit"
    },
    saveEdits: function (e) {
       e.preventDefault();
        var formData = {},
            prev = this.model.previousAttributes();
        $(e.target).closest("form").find(":input").add(".photo").each(function () {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });
        if (formData.photo === "") {
                delete formData.photo;
            }
        this.model.set(formData);
        this.render();
        if (prev.photo === "/img/placeholder.png") {
                delete prev.photo;
            }
        _.each(contacts, function (contact) {
                if (_.isEqual(contact, prev)) {
                            contacts.splice(_.indexOf(contacts, contact), 1, formData);
                        }
            });
    },
    cancelEdit: function () {
        this.render();
    },
    addType: function(){
      if (this.select.val() === "addType") {
          this.select.remove();
          $("<input />", {
                  "class": "type"
              }).insertAfter(this.$el.find(".name")).focus();
      }
    },
    render: function () {
      var tmpl = this.template;
      this.$el.html(tmpl(this.model.toJSON()));
      return this;
    },
    deleteContact: function () {
       var removedType = this.model.get("type").toLowerCase();
        this.model.destroy();
        this.remove();
        if (_.indexOf(directory.getTypes(), removedType) === -1) {
                directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
            }
    },
    editContact: function () {
        this.$el.html(this.editTemplate(this.model.toJSON()));
        var newOpt = $("<option/>", {
                html: "<em>Add new...</em>",
                value: "addType"
            });
        this.select = directory.createSelect().addClass("type")
            .val(this.$el.find("#type").val()).append(newOpt)
            .insertAfter(this.$el.find(".name"));
        this.$el.find("input[type='hidden']").remove();
    }
  });

  var DirectoryView = Backbone.View.extend({
    el: $("#contacts"),
    initialize: function () {
      this.collection = new Directory(contacts);
      this.render();
      this.$el.find("#filter").append(this.createSelect());
      this.on("change:filterType", this.filterByType, this);
      this.collection.on("reset", this.render, this);
      this.collection.on("add", this.renderContact, this);
      this.collection.on("remove", this.removeContact, this);
    },

    events: {
        "change #filter select": "setFilter",
        "click #add": "addContact",
        "click #showForm": "showForm"
    },

    showForm: function () {
        this.$el.find("#addContact").slideToggle();
    },

    setFilter: function (e) {
        this.filterType = e.currentTarget.value;
        this.trigger("change:filterType");
    },
    setFilter: function (e) {
      this.filterType = e.currentTarget.value;
      this.trigger("change:filterType");
    },
    filterByType: function () {
        if (this.filterType === "all") {
                this.collection.reset(contacts);
                contactsRouter.navigate("filter/all");
            } else {
                    this.collection.reset(contacts, { silent: true });
                    var filterType = this.filterType,
                        filtered = _.filter(this.collection.models, function (item) {
                                        return item.get("type") === filterType;
                                });
                    this.collection.reset(filtered);
                    contactsRouter.navigate("filter/" + filterType);
                }
    },
    addContact: function (e) {
        e.preventDefault();
        var newModel = {};
        $("#addContact").children("input").each(function (i, el) {
                if ($(el).val() !== "") {
                            newModel[el.id] = $(el).val();
                      }
            });
        formData = newModel;
        contacts.push(new Contact(newModel));
        if (_.indexOf(this.getTypes(), formData.type) === -1) {
                 this.collection.add(new Contact(formData));
                this.$el.find("#filter").find("select").remove().end().append(this.createSelect());
            } else {
                    this.collection.add(new Contact(formData));
                }
    },
    removeContact: function (removedModel) {
        var removed = removedModel.attributes;
        if (removed.photo === "/assets/placeholder.png") {
                delete removed.photo;
            }
        _.each(contacts, function (contact) {
                if (_.isEqual(contact, removed)) {
                            contacts.splice(_.indexOf(contacts, contact), 1);
                        }
            });
    },
    render: function () {
      this.$el.find('article').remove();
      var that = this;
      _.each(this.collection.models, function (item) {
                  that.renderContact(item);
              }, this);
    },
    renderContact: function (item) {
      var contactView = new ContactView({
                  model: item
              });
      this.$el.append(contactView.render().el);
    },
    getTypes: function () {
      return _.uniq(this.collection.pluck("type"), false, function (type) {
              return type.toLowerCase();
          });
    },
    createSelect: function () {
        var select = $("<select/>", {
                        html: "<option>All</option>"
                    });
        _.each(this.getTypes(), function (item) {
                var option = $("<option/>", {
                            value: item.toLowerCase(),
                            text: item.toLowerCase()
                        }).appendTo(select);
            });
        return select;
    }
  });

  var directory = new DirectoryView();

  var ContactsRouter = Backbone.Router.extend({
      routes: {
              "filter/:type": "urlFilter"
          },
      urlFilter: function (type) {
              console.log('11111');
              directory.filterType = type;
              directory.trigger("change:filterType");
          }
  });

  var contactsRouter = new ContactsRouter();
  Backbone.history.start();

})(jQuery);
