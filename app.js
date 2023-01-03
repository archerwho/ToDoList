`use strict`;

const express = require(`express`);
const bodyParser = require(`body-parser`);
const mongoose = require(`mongoose`);
const _ = require(`lodash`);
require("dotenv").config();

const app = express();
app.set(`view engine`, `ejs`);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`public`));
mongoose.set("strictQuery", false);

mongoose.connect(`${process.env.DATABASE_URL}`, (error) => {
  if (error) {
    console.log(`error1: ${error}`);
  } else {
    console.log(`Connected to DB`);
  }
});
const itmeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Item cannot be blank`],
  },
});
const Item = new mongoose.model(`Item`, itmeSchema);

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Item cannot be blank`],
  },
  items: [itmeSchema],
});
const List = new mongoose.model(`List`, listSchema);

const todo1 = new Item({ name: `Welcome to your toDoList` });
const todo2 = new Item({ name: `Hit the + button to add a new item` });
const todo3 = new Item({ name: `👈🏽 Hit this to delete the item` });

app.get(`/`, (req, res) => {
  Item.find({}, (error, items) => {
    if (error) {
      console.log(`error2: ${error}`);
    }
    if (items.length === 0) {
      Item.insertMany([todo1, todo2, todo3], (error) => {
        if (error) {
          console.log(`error3: ${error}`);
        }
      });
      res.redirect(`/`);
    } else {
      res.render(`list`, { listTitle: `Today`, items: items });
    }
  });
});

app.post(`/`, (req, res) => {
  const item = new Item({
    name: req.body.listItem,
  });
  if (req.body.list === `Today`) {
    item.save();
    res.redirect(`/`);
  } else {
    List.findOne({ name: req.body.list }, (error, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${req.body.list}`);
    });
  }
});

app.post(`/delete`, (req, res) => {
  if (req.body.listName === `Today`) {
    Item.deleteOne({ _id: req.body.checkbox }, (error) => {
      if (error) {
        console.log(`error4: ${error}`);
      }
    });
    res.redirect(`/`);
  } else {
    List.findOneAndUpdate(
      { name: req.body.listName },
      { $pull: { items: { _id: req.body.checkbox } } },
      (error, foundList) => {
        if (!error) {
          res.redirect(`/${req.body.listName}`);
        }
      }
    );
  }
});

app.get(`/:customListName`, (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, (error, foundList) => {
    if (!error) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: [todo1, todo2, todo3],
        });
        list.save();
        res.redirect(`/${customListName}`);
      } else {
        res.render(`list`, {
          listTitle: foundList.name,
          items: foundList.items,
        });
      }
    }
  });
});

app.get(`/about`, (req, res) => {
  res.render(`about`);
});

app.listen(3000, () => console.log(`Server is live at localhost:3000`));
