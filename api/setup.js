const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Role = require("../models/Role");
const config = require("../config/config");

router.post("/", async (req, res) => {
    try {
        if (req.body.passSetup == config.passSetup) {
            var checkSetup = await Role.find({ name: "admin" });
            if (checkSetup.length > 0) {
                res.json({
                    message: "Complete setup."
                })
            } else {
                var roles = [
                    { name: "user" },
                    { name: "admin" },
                ];

                Role.insertMany(roles, async (err, docs) => {
                    if (err) {
                        console.log("Error :((")
                    } else {
                        var roleAdmin = await Role.findOne({ name: "admin" });
                        console.log("đâsd", roleAdmin);
                        if (roleAdmin) {
                            const admin = config.admin;
                            var acc = new User(admin);
                            acc.role = roleAdmin._id;
                            console.log("role admin: ", acc)
                            let result = await acc.save();
                            if (result) {
                                console.log("result: ", result);
                            }
                        }

                        var roleUser = await Role.findOne({ name: "user" });
                        if (roleUser) {
                            const user = config.user;
                            let acc = new User(user);
                            acc.role = roleUser._id;
                            await acc.save();
                        }
                        res.json({
                            data: {
                                status: true,
                                message: "Setup completed."
                            }
                        })
                    }
                });
            }
        } else {
            res.json({
                data: {
                    status: false,
                    message: "No way, wolf :))"
                }
            })
        }
    } catch (err) {
        res.json({
            data: {
                status: false,
                err: err
            }
        })
    }

})

module.exports = router;