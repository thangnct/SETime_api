const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Role = require("../models/Role");
const config = require("../config/config");
const bcrypt = require("bcrypt");

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

                        if (roleAdmin) {
                            const admin = config.admin;
                            var acc = new User(admin);
                            acc.role = roleAdmin._id;
                            acc.password = await bcrypt.hash(config.admin.password, 10);
                            acc.timePassChange = Date.now() / 1000 | 0;
                            await acc.save();

                        }

                        var roleUser = await Role.findOne({ name: "user" });
                        if (roleUser) {
                            const user = config.user;
                            let acc = new User(user);
                            acc.role = roleUser._id;
                            acc.password = await bcrypt.hash(config.user.password, 10);
                            acc.timePassChange = Date.now() / 1000 | 0;
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