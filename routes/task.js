require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const userTasks = require("../models/userTasks");
const IMP = require("../models/confidential");
const Tasks = require("../models/tasks");
const Admin = require("../models/admin");
const { google } = require("googleapis");

const coding_id = process.env.CODING_ID;
const design_id = process.env.DESIGN_ID;
const explore_id = process.env.EXPLORE_ID;

const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    next();
  }
};

const isAdmin = (req, res, next) => {
  if (!req.session.adminToken) {
    return res.json({ code: 403, message: "Unauthorized" });
  }
  if (req.session.adminToken !== process.env.TOKEN) {
    res.json({ code: 400, message: "Invalid trust token" });
  } else {
    next();
  }
};

const isEnabled = async (req, res, next) => {
  try {
  const data = await IMP.findOne({ power_admin: 1 });
  if(!data){
      let newData = new IMP({
      power_admin: 1,
      competition_enabled: true
    })

    newData.save((error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully added records for power admin");
      }
    })
  }
  if (!data.competition_enabled) {
    res.render("error", {
      code: "403",
      msg: "Site is undergoing a system maintenance. Check back later!",
      icon: "fa-solid fa-hammer",
      username: []
    });
  } else {
    next();
  }
    } 
           catch (e) {
              console.error('Error');
             next();
           }
};

router.get("/:id", isEnabled, isAuthenticated, (req, res, next) => {
   let username = [];
   if(req.session.userId) {
      username.push(req.session.username);
   }
  Tasks.findOne({ task_id: req.params.id }, async(err, data) => {
    if (!data) {
      res.send("No task was found with the given ID");
    } else {
    const user_tasks = await userTasks.findOne({ user_id: req.session.userId });
    const approved = user_tasks.approved_tasks;
    const declined = user_tasks.declined_tasks;
    const pending = user_tasks.pending_tasks;
    const approvedArray = approved.map(function (data) {
      return data.task_id;
    });
    const declineArray = declined.map(function (data) {
      return data.task_id;
    });
    const pendingArray = pending.map(function (data) {
      return data.task_id;
    });
      res.render("tasks", {
        id: data.task_id,
        title: data.task_title,
        description: data.big_description,
        category: data.task_category,
        approvedArray: approvedArray,
        declineArray: declineArray,
        pendingArray: pendingArray,
        username: username
      });
    }
  });
});

router.post("/addtask/success", isAuthenticated, isAdmin, async (req, res) => {
  let c;
  Tasks.findOne({}, async (err, data) => {
    if (data) {
      const taskdata = await Tasks.find().limit(1).sort({ $natural: -1 });
      c = taskdata[0].task_id + 100;
    } else {
      c = 100;
    }

    let target = req.body.advance;
    let finalString = target.replaceAll('"', "");  //Converting string into a boolean

    let newTask = new Tasks({
      task_id: c,
      task_title: req.body.title,
      task_description: req.body.smalldescription,
      task_category: req.body.category,
      big_description: req.body.bigdescription,
      advanceTask: finalString,
    });

    newTask.save((err, Data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully added records for tasks");
      }
    });

    res.redirect("/admin");
  });
});

router.post(
  "/submit/:id",
  isEnabled,
  isAuthenticated,
  async (req, res, next) => {
    const userData = await userTasks.findOne({ user_id: req.session.userId });
    if (!userData) {
      return res.send("User does not exists in the database");
    } else {
      const task_dat = await Tasks.findOne({ task_id: req.params.id });
      const user = await User.findOne({ unique_id: req.session.userId });

      var sheetDataArray = task_dat.sheetData;

      const sheetResults = sheetDataArray.map(function (data) {
        return {
          userid: data.userId,
          sheetid: data.sheetId,
        };
      });

      if (sheetResults.length < 1) {
        Tasks.findOne({ task_id: req.params.id })
          .then((task) => {
            task.sheetData.push({
              userId: req.session.userId,
              sheetId: 2,
            });
            task
              .save()
              .then(() => {
                return "Success";
              })
              .catch(console.log);
          })
          .catch(console.log);
      } else {
        let elemant = sheetResults[sheetResults.length - 1];  //Removing the last element from an array
        let number = elemant.sheetid + 1;
        Tasks.findOne({ task_id: req.params.id })
          .then((task) => {
            task.sheetData.push({
              userId: req.session.userId,
              sheetId: number,
            });
            task
              .save()
              .then(() => {
                return "Success";
              })
              .catch(console.log);
          })
          .catch(console.log);
      }

      var currentdate = new Date();
      let type;

      if (req.body.task === "CODING") {
        type = coding_id;
      } else if (req.body.task === "DESIGN") {
        type = design_id;
      } else if (req.body.task === "EXPLORE") {
        type = explore_id;
      }

      (async () => {
        try {
          const { sheets } = await authentication();

          const writeReq = await sheets.spreadsheets.values.append({
            spreadsheetId: type,
            range: req.params.id,
            valueInputOption: "USER_ENTERED",
            resource: {
              values: [
                [
                  currentdate,
                  user.email,
                  user.competitor_id,
                  user.username,
                  req.body.url,
                  "No Feedback",
                  "0",
                  "Pending",
                ],
              ],
            },
          });

          if (writeReq.status === 200) {
            console.log("Spreadsheet updated");
          } else {
            console.log("Somethign went wrong while updating the spreadsheet.");
          }
        } catch (e) {
          console.log("ERROR WHILE UPDATING THE SPREADSHEET", e);
        }
      })();

      userTasks
        .findOne({ user_id: req.session.userId })
        .then((task) => {
          task.pending_tasks.push({
            task_title: task_dat.task_title,
            task_description: task_dat.task_description,
            task_id: task_dat.task_id,
            task_category: task_dat.task_category,
          });
          task
            .save()
            .then(() => {
              return "Success";
            })
            .catch(console.log);
        })
        .catch(console.log);
      Admin.findOne({ number: 1 })
        .then((task) => {
          task.taskData.push({
            username: user.username,
            userId: user.unique_id,
            task_title: task_dat.task_title,
            task_description: task_dat.task_description,
            task_id: task_dat.task_id,
            task_category: task_dat.task_category,
            project_url: req.body.url,
            feedback: req.body.feedback,
          });
          task
            .save()
            .then(() => {
              return "Success";
            })
            .catch(console.log);
        })
        .catch(console.log);

      // res.redirect("/profile");
      res.sendStatus(201);
    }
  }
);

router.post(
  "/resubmit/:id",
  isEnabled,
  isAuthenticated,
  async (req, res, next) => {
    const userData = await userTasks.findOne({ user_id: req.session.userId });
    if (!userData) {
      return res.send("User does not exists in the database");
    } else {
      const taskData = await userTasks.findOne({ user_id: req.session.userId });
      const task_dat = await Tasks.findOne({ task_id: req.params.id });
      const user = await User.findOne({ unique_id: req.session.userId });

      var declinedTasksArray = taskData.declined_tasks;
      var sheetDataArray = task_dat.sheetData;

      var currentdate = new Date();

      const sheetResults = sheetDataArray
        .filter(function (data) {
          return data.userId === req.session.userId;
        })
        .map(function (data) {
          return {
            userid: data.userId,
            sheetid: data.sheetId,
          };
        });

      const declinedResults = declinedTasksArray.map(function (data) {
        return {
          id: data._id,
          task_title: data.task_title,
          task_description: data.task_description,
          task_id: data.task_id,
          task_category: data.task_category,
        };
      });

      let type;

      if (declinedResults[0].task_category === "CODING") {
        type = coding_id;
      } else if (declinedResults[0].task_category === "DESIGN") {
        type = design_id;
      } else if (declinedResults[0].task_category === "EXPLORE") {
        type = explore_id;
      }

      (async () => {
        try {
          const { sheets } = await authentication();

          const writeReq = await sheets.spreadsheets.values.update({
            spreadsheetId: type,
            range: `${req.params.id}!A${sheetResults[0].sheetid}`,
            valueInputOption: "USER_ENTERED",
            resource: {
              range: `${req.params.id}!A${sheetResults[0].sheetid}`,
              majorDimension: "ROWS",
              values: [
                [
                  currentdate,
                  userData.email,
                  userData.competitor_id,
                  userData.username,
                  req.body.url,
                  "No Feedback",
                  "0",
                  "Pending",
                ],
              ],
            },
          });

          if (writeReq.status === 200) {
            console.log("Spreadsheet updated");
          } else {
            console.log("Somethign went wrong while updating the spreadsheet.");
          }
        } catch (e) {
          console.log("ERROR WHILE UPDATING THE SPREADSHEET", e);
        }
      })();

      userTasks
        .findOne({ user_id: req.session.userId })
        .then((task) => {
          task.pending_tasks.push({
            task_title: task_dat.task_title,
            task_description: task_dat.task_description,
            task_id: task_dat.task_id,
            task_category: task_dat.task_category,
          });
          task
            .save()
            .then(() => {
              return "Success";
            })
            .catch(console.log);
        })
        .catch(console.log);
      Admin.findOne({ number: 1 })
        .then((task) => {
          task.taskData.push({
            username: user.username,
            userId: user.unique_id,
            task_title: task_dat.task_title,
            task_description: task_dat.task_description,
            task_id: task_dat.task_id,
            task_category: task_dat.task_category,
            project_url: req.body.url,
            feedback: req.body.feedback,
          });
          task
            .save()
            .then(() => {
              return "Success";
            })
            .catch(console.log);
        })
        .catch(console.log);

      await userTasks.update(
        { _id: taskData._id },
        { $pull: { declined_tasks: { _id: declinedResults[0].id } } }
      );

      // res.redirect("/profile");
      res.sendStatus(201);
    }
  }
);

const authentication = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const sheets = google.sheets({
    version: "v4",
    auth: client,
  });
  return { sheets };
};

module.exports = router;
