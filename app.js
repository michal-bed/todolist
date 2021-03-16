//jshint esversion:6
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose")
const { Schema } = mongoose;
// const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash")
const PORT = process.env.PORT || 3000;

const { JSDOM } = require( "jsdom" );
// const { window } = new JSDOM( "" );
JSDOM.fromFile(__dirname + "/views/list.ejs")
    .then(
        function(dom)
        {
            // global.window = dom.window;
            // global.document =  dom.window.document;
            // global.window = dom.window;
            global.$ = require( "jquery" )( dom.window );
            console.log("File was successfuly loaded.");
        }
    ).catch(console.log);

// const $ = require( "jquery" )( window );

const app = express();

app.set('view engine', 'ejs');

// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const localDBAddress = "mongodb://localhost:27017/todolistDB";
//  
const atlasDBAddress = `mongodb+srv://michalb:${process.env.ATLAS_DB_PASSWORD}@cluster0.nemyk.mongodb.net/todolistDB?retryWrites=true&w=majority`;

mongoose.connect(atlasDBAddress, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })
                .then(() => console.log("Connected with the database server"))
                .catch((err) => console.log("Failed to connect with the database server:", err));

const itemSchema = new Schema(
    {
        name: String,
        initialized: String
    }
);

const listSchema = new Schema(
    {
        listTitle: String,
        items: [itemSchema],
    }
);

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const listWelcome = new Item(
    {
        name: "Welcome to your todolist!"
    }
);

const hitPlus = new Item(
    {
        name: "Hit the + button to add a new item/"
    }
);

const clickHere = new Item(
    {
        name: "<-- Hit these to delete items."
    }
);

const defaultItems = [listWelcome, hitPlus, clickHere];
let day;


let initialized = false;
app.get("/", function(req, res) {

    Item.find({}, 
        async function (err, items)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                await Item.findOne({initialized: "initializationOfToDoListAlreadyCompleted"}, 
                   (err, item) =>
                   {
                        if(err)
                        {
                            console.log(err);
                        }
                        else if (item && item.initialized === "initializationOfToDoListAlreadyCompleted")
                        { 
                            initialized = true;
                            console.log("The list was already initialized");
                        }
                        else
                        {
                            initialized = false;
                            console.log("The list is about to be initalized");

                            // console.log("items.length:", items.length);
                            // console.log("!initialized:", !initialized);
                            // if(items.length === 0 && !initialized)
                            // {
                            //     Item.insertMany([buyFood, cookFood, eatFood], 
                            //         function(err)
                            //         {
                            //             if(err)
                            //             {
                            //                 console.log("There occured an error inserting items to the collection");
                            //             }
                            //             else
                            //             {
                            //                 console.log("Items were successfully inserted to the collection");
                            //             }
                            //         }
                            //     );

                            //     new Item({initialized: "initializationOfToDoListAlreadyCompleted"}).save().then(() => console.log("The list was initialized"));
                                
                            //     res.redirect('/');
                            // }
                            // else
                            // {
                            //     for(const item of items)
                            //     {
                            //         console.log(item);
                            //     }

                            //     const day = date.getDate();

                            //     res.render("list", {listTitle: day, newListItems: items});
                            // }
                        }

                   }
                )
                .then(() => 
                {
                    console.log("items.length:", items.length);
                    console.log("!initialized:", !initialized);
                    if(items.length === 0 && !initialized)
                    {
                        Item.insertMany(defaultItems, 
                            function(err)
                            {
                                if(err)
                                {
                                    console.log("There occured an error inserting items to the collection");
                                }
                                else
                                {
                                    console.log("Items were successfully inserted to the collection");
                                }
                            }
                        );

                        new Item({initialized: "initializationOfToDoListAlreadyCompleted"}).save().then(
                            () => 
                            {
                                console.log("The list was initialized");
                                res.redirect('/');
                            }
                        ).catch(console.dir);
                        
                    }
                    else
                    {
                        for(const item of items)
                        {
                            console.log(item);
                        }

                        day = date.getDate();

                        res.render("list", {listTitle: day, newListItems: items});
                    }
                })
                .catch(console.dir);
                
                // console.log("items.length:", items.length);
                // console.log("!initialized:", !initialized);
                // if(items.length === 0 && !initialized)
                // {
                //     Item.insertMany([buyFood, cookFood, eatFood], 
                //         function(err)
                //         {
                //             if(err)
                //             {
                //                 console.log("There occured an error inserting items to the collection");
                //             }
                //             else
                //             {
                //                 console.log("Items were successfully inserted to the collection");
                //             }
                //         }
                //     );

                //     new Item({initialized: "initializationOfToDoListAlreadyCompleted"}).save().then(() => console.log("The list was initialized"));
                    
                //     res.redirect('/');
                // }
                // else
                // {
                //     for(const item of items)
                //     {
                //         console.log(item);
                //     }

                //     const day = date.getDate();

                //     res.render("list", {listTitle: day, newListItems: items});
                // }
            }
        }
    );

    

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const title = req.body.list;
  console.log("POST title:", title);

  if (title === day)
  {
    if(item)
    {
        new Item({name: item}).save().then(() => console.log("New item was added"));
    }
    
    res.redirect("/");
  }
  else
  {
      List.findOne({ listTitle: title },
        function(err, list)
        {
            if (err)
            {
                console.log(err);
            }
            if (!err && list && item)
            {
                list.items.push({ name: item });
                list.save().then(
                    () =>
                    {
                        console.log("New item was inserted: '" + item + "' to '" + title + "' list.");
                        res.redirect("/" + list.listTitle);
                    }
                ).catch(console.dir);

            }
            else if (!err && list)
            {
                console.log("No item was inserted as it was empty"); 
                res.redirect("/" + list.listTitle);
            }
            else 
            {
                console.log("There was an eror or no list doesn't exists.");
                res.redirect("/");
            }
        }
     
      );
  }
  
//   if (req.body.list === "Work") {
//     // workItems.push(item);
//     res.redirect("/work");
//   } 
//   else if (item)
//   {
//     // items.push(item);
//     new Item({name: item}).save().then(() => console.log("New item was added"));
//     res.redirect("/");
//   }
  
});

app.post("/delete", 
    function(req, res)
    {
        const checkedItemId = req.body.checkbox;
        const confirmed = req.body.confirmed;
        const listTitle = req.body.listTitle;
        console.log("_id:", checkedItemId);
        console.log("confirmed:", confirmed);
        console.log("---------------------");
        if (listTitle === day)
        {
            Item.findById(checkedItemId,
                function(err, item)
                {
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        // const checkedItem = item;
                        // if (item && 
                        //     window.confirm(
                        //     //$(document)[0].defaultView.confirm(
                        //     `Are you sure you want to delete the checked item which says: "${item.name}"?`)) 
                        if (item && confirmed === "true")
                        {
                            console.log("listTitle", listTitle);
                            // Delete it!
                            Item.findByIdAndRemove(checkedItemId,
                                function(err, item)
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        console.log('One item was deleted from the database: ' + item.name);
                                        res.redirect("/");
                                    }
                                }
                            );
                        } 
                        else 
                        {
                        // Do not remove the item!
                            console.log('Removing the item was not confirmed.');
                            res.redirect("/");
                        }
                    }
                }
            );

        // res.redirect("/");
        }
        else
        {
            List.findOneAndUpdate({ listTitle: listTitle }, 
                                { $pull: { items: { _id: checkedItemId }}},
                function(err, list)
                {
                    if (err)
                    {
                        console.log(err);
                    }
                    else if (list && confirmed)
                    {
                        res.redirect("/" + listTitle);
                    }
                }
                                
            );
        }
    }
);

// function confirmDelete()
// {
//     if (window.confirm(`Are you sure you want to delete the checked item which says: "${item.name}"?`)) 
//     {
//         confirmed = "true";
//     }
//     else
//     {
//         confirmed = "false";
//     }

// }

// app.get("/work", function(req, res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:listTitle", 
    (req, res) =>
    {
        const newListItems = [];
        const newListTitle = _.capitalize(req.params.listTitle);
        console.log(newListTitle);
        // res.render("list", { listTitle: req.params.listTitle, newListItems: newListItems });

        List.findOne({ listTitle: newListTitle }, 
            function(err, list)
            {
                if (!err)
                {
                    if (list)
                    {
                        console.log("exists");
                        res.render("list", { listTitle: list.listTitle, newListItems: list.items })
                    }
                    else
                    {
                        console.log("doesn't exist");
                        const newList = new List(
                            {
                                listTitle: newListTitle,
                                items: defaultItems,
                            }
                        );
                
                        newList.save().then(() => res.redirect("/" + newListTitle)).catch(console.dir);
                    }
                }
            }
        );
        
        

    }
);

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log("Server started on port 3000 or Heroku");
});
