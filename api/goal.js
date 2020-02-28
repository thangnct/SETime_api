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


router.post("/add_goal", userAuth, async (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, config.SECRET, async (err, decode) => {
            if (err) {
                res.json({ data: { code: -98, err } })
            }
            // const tasks = req.body.tasks;
            const tasks = [
                {
                    taskTitle: "task1",
                    taskStatus: "working_on",
                    timeBound: "",
                    note: "",
                },
                {
                    taskTitle: "task2",
                    taskStatus: "working_on",
                    timeBound: "",
                    note: "",
                }
            ];


            const userId = decode.userId;
            var goal = new Goal({
                userId: userId,
                goalTitle: req.body.goalTitle,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                color: req.body.color || "blue",
                describe: req.body.describe,
                reward: req.body.reward,
                goalStatus: "working_on",
            });
            goal.save().then(goal => {
                res.json({ data: { code: 1, goal } })
            }).catch(err => {
                res.json({ data: { code: -98, err } })
            })
        })
    } catch (error) { res.json({ data: { code: -99, error } }) }
})
module.exports = router;