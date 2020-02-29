const express = require('express');
const router = express.Router();
const config = require("../config/config")
const { userAuth, adminAuth, checkTokenFirebase } = require("../middlewares/authentication");
const Goal = require("../models/Goal")
const Task = require("../models/Task")
const jwt = require("jsonwebtoken");

router.post("/add_task", userAuth, async (req, res) => {
    console.log(req.body)
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            const userId = decode.userId;
            const goalId = req.body.goalId;
            if (userId && goalId) {
                var goal = await Goal.findById(goalId);
                if (goal) {
                    if (goal.userId == userId) {
                        var task = new Task({
                            userId,
                            goalId,
                            taskTitle: req.body.taskTitle,
                            taskStatus: "working_on",
                            isAllDay: req.body.isAllDay,
                            startTime: req.body.startTime,
                            endTime: req.body.endTime,
                            color: goal.color,
                            note: req.body.note,
                        })
                        task.save().then(value => {
                            res.json({ data: { code: 1, task: value._id, message: "Add tasl success." } })
                        }).catch(error => { res.json({ data: { code: -98, error } }) })
                    } else {
                        res.json({ data: { code: 0, message: "Fail to add task." } })
                    }
                } else {
                    res.json({ data: { code: 0, message: "The task must towards a goal." } })
                }

            } else {
                res.json({ data: { code: 0, message: "Fail to add task." } })
            }
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})

router.post("/edit_task", userAuth, async (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            const taskId = req.body.taskId;
            const userId = decode.userId;
            const taskTitle = req.body.taskTitle;
            if (taskId && userId && taskTitle) {
                var task = await Task.findById(taskId);
                if (task && task.userId == userId) {
                    task.taskTitle = req.body.taskTitle;
                    task.taskStatus = req.body.taskStatus;
                    task.timeBound = req.body.timeBound;
                    task.color = req.body.color;
                    task.note = req.body.note;
                    task.save().then(value => {
                        res.json({ data: { code: 1, message: "update task success.", taskId } })
                    }).catch(error => {
                        res.json({ data: { code: -98, error } })
                    })
                } else {
                    res.json({ data: { code: 0, message: "Can not find task." } })
                }
            } else {
                res.json({ data: { code: 0, message: "Title and task id is required." } })
            }
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})

router.post("/delete_task", userAuth, async (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            const taskId = req.body.taskId;
            const userId = decode.userId;
            var task = await Task.findById(taskId);
            if (task && task.userId == userId) {
                task.remove().then(value => {
                    res.json({ data: { code: 1, message: "Delete task " + value._id + "success." } })
                }).catch(error => {
                    res.json({ data: { code: -98, error } })
                })
            } else {
                res.json({ data: { code: 0, message: "Can not find task." } })
            }
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
});

router.post("/get_all_task", userAuth, async (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            const userId = decode.userId;
            var tasks = await Task.find({ userId: userId });
            res.json({ data: { code: 1, tasks } })
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})

router.post("/get_task_in_day", userAuth, async (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            const userId = decode.userId;
            const today = new Date();

            var day = today.getDate();
            var day2 = today.getDay();
            console.log(today, day, day2)
            var tasks = await Task.find({ $and: [{ userId: userId }, { updatedAt: today }] });
            res.json({ data: { code: 1, tasks } })
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})

router.post("/get_task_by_goalId", async (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            const userId = decode.userId;
            const goalId = req.body.goalId;
            console.log(goalId, userId)
            if (goalId && userId) {
                let goal = await Goal.findById(goalId);
                console.log(goal.userId, userId)
                if (goal && goal.userId == userId) {
                    var tasks = await Task.find({ goalId });
                    res.json({
                        data: { code: 1, tasks }
                    })
                } else {
                    res.json({ data: { code: 0, message: "Can not get tasks" } })
                }
            } else {
                res.json({ data: { code: 0, message: "Can not get tasks" } })
            }

        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})

router.post("/get_task_by_id", async (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            const userId = decode.userId;
            const taskId = req.body.taskId;
            if (taskId && userId) {
                let task = await Task.findById(taskId);
                console.log(task.userId, userId)
                if (task && task.userId == userId) {
                    res.json({
                        data: { code: 1, task }
                    })
                } else {
                    res.json({ data: { code: 0, message: "Can not get task" } })
                }
            } else {
                res.json({ data: { code: 0, message: "Can not get task" } })
            }
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})
module.exports = router;