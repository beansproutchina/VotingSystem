import fastify from "fastify";
import * as fs from "fs";

const app = fastify();
const port = 3125;
const events = {};


const start = async () => {

    let dirs = fs.readdirSync("./events", { withFileTypes: true })
    for (let dir of dirs) {
        if (dir.isDirectory()) {
            events[dir.name] = {
                candidates: {},
                voters: {},
                minselect: 0,
                maxselect: 1,
            }
            let files = fs.readdirSync(`./events/${dir.name}`, { withFileTypes: true })
            let jump = false;
            for (let file of files) {
                if (jump) {
                    break;
                }
                if (file.isFile()) {
                    switch (file.name) {
                        case "data.json": {
                            let data = fs.readFileSync(`./events/${dir.name}/${file.name}`)
                            let j = JSON.parse(data);
                            events[dir.name].minselect = j.minselect;
                            events[dir.name].maxselect = j.maxselect;
                        }
                            break;
                        case "candidates.txt": {
                            let data = fs.readFileSync(`./events/${dir.name}/${file.name}`)
                            for (let p of data.toString().split("\n")) {
                                events[dir.name].candidates[p.replace("\r", "")] = 0;
                            };
                        }
                            break;
                        case "voters.txt": {
                            let data = fs.readFileSync(`./events/${dir.name}/${file.name}`)
                            for (let p of data.toString().split("\n")) {
                                events[dir.name].voters[p.replace("\r", "")] = 0;
                            };
                        }
                            break;
                        case "result.json": {
                            let data = fs.readFileSync(`./events/${dir.name}/${file.name}`)
                            let j = JSON.parse(data);
                            events[dir.name] = j;
                            jump = true;
                            break;
                        }
                    }
                }
            }

            app.post(`/api/${dir.name}`, async (req, res) => {
                let body = req.body;
                if (events[dir.name].voters[body.voter] == 0) {
                    for (let i = 0; i < body.votes.length; i++) {
                        events[dir.name].candidates[body.votes[i]]++;
                    }
                    events[dir.name].voters[body.voter] = 1;
                    res.send({ message: "OK", result: 200 });
                    fs.writeFile(`./events/${dir.name}/result.json`, JSON.stringify(events[dir.name]));
                } else {
                    res.send({ message: "Already Voted", result: 400 });
                }
            })
            app.get(`/api/${dir.name}`, async (req, res) => {
                res.send(events[dir.name]);
            })
        }
    }
    try {
        await app.listen({ port });
        console.log(`Server listening on http://localhost:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
start();

