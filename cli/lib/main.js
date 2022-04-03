import mysql from 'mysql'
import fs from 'fs'
import {default as db_cnf} from '../lib/db.js';

class AccessControlCli {
    connection;
    constructor() {
        console.log(db_cnf)
        if (db_cnf.host != "*") {
            this.connect()
        }
    }

    async print(info) {
        console.log('<-------------------------------------------------------------------------------------------------------->');
        console.log('(*_*) Access control (*_*)');
        await info();
        console.log('<-------------------------------------------------------------------------------------------------------->');
    }

    async readFile(path) {
        return await (new Promise((resolve,reject) => {
            fs.readFile(path, (err, buffer) => {
                if (err)
                    reject(err)
                resolve(buffer.toString());
            })
        }))
    }

    async writeDbConfig(credentials) {
        return await (new Promise((resolve, reject) => {
            fs.writeFile('../lib/db.js', `export default ${JSON.stringify(credentials)}`, err => {
                if (err)
                    reject(err);
                resolve();
            })
        }))
    }

    connect() {
        this.connection = mysql.createConnection({
            ...db_cnf,
            multipleStatements: true
        });

        this.connection.connect();
    }

    async query(query, data = []) {
        return await (new Promise((resolve, reject) => {
            this.connection.query(query, data, async (err, res) => {
                if (err)
                    reject(err);
                if (typeof res === "undefined")
                    resolve(null)
                resolve(res)
            });
        }));
    }

    async migrate() {
        await this.connect();
        await this.query(await this.readFile('../lib/migrations/rule_entity.sql').then(data => data).catch(err => console.error(err))).then(res => {
            console.log('rule_entity.sql... Done!');
        })
        await this.query(await this.readFile('../lib/migrations/user_rule.sql').then(data => data).catch(err => console.error(err))).then(res => {
            console.log('user_rule.sql... Done!');
        })
        await this.query(await this.readFile('../lib/migrations/auth_assignment.sql').then(data => data).catch(err => console.error(err))).then(res => {
            console.log('auth_assignment.sql... Done!');
        })
        await this.query(await this.readFile('../lib/migrations/auth_assignment_min.sql').then(data => data).catch(err => console.error(err))).then(res => {
            console.log('auth_assignment_min.sql... Done!');
        })
    }

    async add(name, description) {
        return await this.query('insert into `rule_entity` (`name`, `description`) values (?, ?)', [ name, description ]).then(res => {
            return res;
        }).catch(err => {
            console.log(err);
        })
    }

    async getRules(rule_id = null, minimized = false) {
        if (minimized)
            return await this.query('select `rule`.`id`, `rule`.`name`, `rule`.`description` from `auth_assignment_min` as `assignment` left join `rule_entity` as `rule` on `rule`.`id` = `assignment`.`child` where `assignment`.`parent` = ?', [ rule_id ])
        if (rule_id)
            return await this.query('select `rule`.`id`, `rule`.`name`, `rule`.`description` from `auth_assignment` as `assignment` left join `rule_entity` as `rule` on `rule`.`id` = `assignment`.`child` where `assignment`.`parent` = ?', [ rule_id ]);
        return await this.query('select * from `rule_entity`');
    }

    async getChildren(res, assignment) {
        let data = await this.query("SELECT * FROM `auth_assignment` WHERE `parent` = ?", [ assignment.child ]);
        for (let i = 0; i < data.length; i++)
        {
            let el = data[i];
            let _ = {
                parent: assignment.parent,
                child: el.child
            }
            const children = await this.query("SELECT * FROM `auth_assignment` WHERE `parent` = ?", [ el.child ]);
            if (children.length == 0)
            {
                let key = String(assignment.parent) + String(el.child);

                Object.assign(res, {[key]: _ });
            }
            else
            {
                res = await this.getChildren(res, _);
            }
        }
        return res;
    }

    async minimize() {
        const assignments = await this.query('select * from `auth_assignment`');
        let children = {};
        for (let el of assignments) {
            const before = Object.keys(children).length;
            children = await this.getChildren(children, el);
            const after = Object.keys(children).length;
            if (before == after) {
                let key = String(el.parent) + String(el.child);
                let _ = {
                    parent: el.parent,
                    child: el.child
                }
                Object.assign(children, {[key]: _ });
            }
        }
        let query = 'delete from `auth_assignment_min` where `id` != -1;';
        let data = [];
        for (let key of Object.keys(children)) {
            query += "insert into `auth_assignment_min` (`parent`, `child`) values (?, ?);";
            data.push(children[key].parent, children[key].child);
        }
        await this.query(query, data);
    }

    async assign(parent, children) {
        for (let child of children) {
            if (parent == child) {
                console.error('Error! parent and child must not be equal!');
                return;
            }

            const checkDouble  = await this.query('select * from `auth_assignment` where (`parent` = ? and `child` = ?) or (`parent` = ? and `child` = ?)', [ parent, child, child, parent ]);
            if (checkDouble.length) {
                console.error("Error! " + JSON.stringify(checkDouble[0]) + " already exists");
                return;
            }
        }
        for (let child of children) {
            await this.query('insert into `auth_assignment` (`parent`, `child`) values (?, ?)', [ parseInt(parent), parseInt(child) ])
                .catch(err => {
                    if (err.errno == 1452) {
                        if (err.sqlMessage.includes('child')) {
                            console.error("Error! Access control can`t find child with id = " + child);
                        }
                        else {
                            console.error("Error! Access control can`t find parent with id = " + parent);
                        }
                    }
                });
        }
        await this.minimize();
    }

    async removeRule(ids) {
        let query = '';
        let data = [];
        for (let id of ids) {
            query += 'delete from `rule_entity` where `id` = ?;';
            data.push(id);
        }
        await this.query(query, data);
        await this.minimize();
    }

    async removeAssign(parent, children) {
        let query = '';
        let data = [];
        for (let child of children) {
            query += 'delete from `auth_assignment` where `parent` = ? and `child` = ?';
            data.push(parseInt(parent));
            data.push(parseInt(child));
        }
        await this.query(query, data);
        await this.minimize();
    }
}

export default AccessControlCli;
