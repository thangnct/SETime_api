const express = require('express');
const router = express.Router();
const config = require("../config/config")
const { userAuth, adminAuth, checkTokenFirebase } = require("../middlewares/authentication");
const Goal = require("../models/Goal")
const Task = require("../models/Task")
const jwt = require("jsonwebtoken");

router.post("/get_all_goal", adminAuth, async (req, res, next) => {
    try {
        var goals = await Goal.find().skip(req.body.startSkip).limit(req.body.limit);
        if (goals) {
            res.json({
                data: {
                    code: 1,
                    goals
                }
            })
        }
    } catch (error) { res.json({ data: { code: -99, error } }) }
})


router.post("/get_goal_by_id", userAuth, async (req, res, next) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            var goal = await Goal.findById(req.body.goalId);
            if (goal && goal.userId == decode.userId) {
                res.json({ data: { code: 1, goal } })
            } else {
                res.json({
                    data: {
                        code: 0,
                        message: "Access denied."
                    }
                })
            }
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})

router.post("/add_task", userAuth, async (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            
            const userId = decode.userId;
            var task = new Task({
                userId: userId,
                goalId: req.body.goalId,
                taskTitle: req.body.taskTitle,
                taskStatus: req.body.taskStatus, //working_on - completed
                timeBound: req.body.timeBound,
                note: req.body.note,
            })
            task.save().then(value => {
                res.json({ data: { code: 1, task: value._id } })
            }).catch(error => { res.json({ data: { code: -98, error } }) })
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})

router.post("/add_goal", userAuth, async (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }

            const userId = decode.userId;
            var goal = new Goal({
                userId: userId,
                goalTitle: req.body.goalTitle,
                exprirationDate: req.body.exprirationDate,
                color: req.body.color,
                describe: req.body.describe,
                reward: req.body.reward,
                goalStatus: req.body.goalStatus, //working_on - completed - out_of_date - pendig.
                // tasks: req.body.tasks
            });
            await goal.save().then(goal => {
                res.json({ data: { code: 1, goal } })
            }).catch(err => {
                res.json({ data: { code: -98, err } })
            })
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})
module.exports = router;