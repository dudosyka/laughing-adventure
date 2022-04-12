import mysql from 'mysql'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config();

let db_cnf = {
    host: process.env['ACCESS_CONTROL_HOST'],
    database: process.env['ACCESS_CONTROL_DATABASE'],
    user: process.env['ACCESS_CONTROL_USER'],
    password: process.env['ACCESS_CONTROL_PASSWORD'],
}

class AccessControl {
    connection;
    tables = {
        auth_assignment: 'auth_assignment',
        auth_assignment_min: 'auth_assignment_min',
        rule_entity: 'rule_entity',
        user_rule: 'user_rule',
    }
    constructor(tables = null, db = null) {
        if (tables) {
            this.tables = {
                ...tables
            }
        }
        if (db) {
            db_cnf = {
                ...db
            }
        }

        if (db_cnf.host != "*") {
            this.connect();
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
        process.env['ACCESS_CONTROL_HOST'] = credentials.host;
        process.env['ACCESS_CONTROL_DATABASE'] = credentials.database;
        process.env['ACCESS_CONTROL_USER'] = credentials.user;
        process.env['ACCESS_CONTROL_PASSWORD'] = credentials.password;
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
        let sql = `CREATE TABLE IF NOT EXISTS \`rule_entity\` (
                      \`id\` INT NOT NULL AUTO_INCREMENT,
                      \`name\` VARCHAR(100) NULL,
                      \`description\` VARCHAR(1000) NULL,
                      PRIMARY KEY (\`id\`),
                      UNIQUE INDEX \`id_UNIQUE\` (\`id\` ASC) VISIBLE)
                    ENGINE = InnoDB
        `;
        await this.query(sql).then(res => {
            console.log('rule_entity.sql... Done!');
        });
        sql = `CREATE TABLE IF NOT EXISTS \`user_rule\` (
                  \`id\` INT NOT NULL AUTO_INCREMENT,
                  \`user_id\` INT NOT NULL,
                  \`rule_entity_id\` INT NOT NULL,
                  PRIMARY KEY (\`id\`),
                  UNIQUE INDEX \`id_UNIQUE\` (\`id\` ASC) VISIBLE,
                  INDEX \`fk_user_rule_rule_entity1_idx\` (\`rule_entity_id\` ASC) VISIBLE,
                  CONSTRAINT \`fk_user_rule_rule_entity1\`
                    FOREIGN KEY (\`rule_entity_id\`)
                    REFERENCES \`rule_entity\` (\`id\`)
                    ON DELETE NO ACTION
                    ON UPDATE NO ACTION)
                ENGINE = InnoDB
        `;
        await this.query(sql).then(res => {
            console.log('user_rule.sql... Done!');
        });
        sql = `CREATE TABLE IF NOT EXISTS \`auth_assignment\` (
              \`id\` INT NOT NULL AUTO_INCREMENT,
              \`parent\` INT NOT NULL,
              \`child\` INT NOT NULL,
              PRIMARY KEY (\`id\`),
              UNIQUE INDEX \`id_UNIQUE\` (\`id\` ASC) VISIBLE,
              INDEX \`fk_auth_assignment_rule_entity1_idx\` (\`parent\` ASC) VISIBLE,
              INDEX \`fk_auth_assignment_rule_entity2_idx\` (\`child\` ASC) VISIBLE,
              CONSTRAINT \`fk_auth_assignment_rule_entity1\`
                FOREIGN KEY (\`parent\`)
                REFERENCES \`rule_entity\` (\`id\`)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
              CONSTRAINT \`fk_auth_assignment_rule_entity2\`
                FOREIGN KEY (\`child\`)
                REFERENCES \`rule_entity\` (\`id\`)
                ON DELETE NO ACTION
                ON UPDATE NO ACTION);
            ALTER TABLE \`auth_assignment\`
            ADD UNIQUE \`unique_pair\` (\`parent\`, \`child\`);
        `;
        await this.query(sql).then(res => {
            console.log('auth_assignment.sql... Done!');
        });
        sql = `CREATE TABLE IF NOT EXISTS \`auth_assignment_min\` (
                  \`id\` INT NOT NULL AUTO_INCREMENT,
                  \`parent\` INT NOT NULL,
                  \`child\` INT NOT NULL,
                  PRIMARY KEY (\`id\`),
                  UNIQUE INDEX \`id_UNIQUE\` (\`id\` ASC) VISIBLE,
                  INDEX \`fk_auth_assignment_min_rule_entity1_idx\` (\`parent\` ASC) VISIBLE,
                  INDEX \`fk_auth_assignment_min_rule_entity2_idx\` (\`child\` ASC) VISIBLE,
                  CONSTRAINT \`fk_auth_assignment_min_rule_entity1\`
                    FOREIGN KEY (\`parent\`)
                    REFERENCES \`rule_entity\` (\`id\`)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,
                  CONSTRAINT \`fk_auth_assignment_min_rule_entity2\`
                    FOREIGN KEY (\`child\`)
                    REFERENCES \`rule_entity\` (\`id\`)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE)
                ENGINE = InnoDB
        `;
        await this.query(sql).then(res => {
            console.log('auth_assignment_min.sql... Done!');
        });
    }

    async add(name, description) {
        return await this.query('insert into `rule_entity` (`name`, `description`) values (?, ?)', [ name, description ]).then(res => {
            return res;
        }).catch(err => {
            console.log(err);
        })
    }

    async getRules(rule_id = null, minimized = false, user = null) {
        if (user)
            return await this.query('select `rule`.`id`, `rule`.`name`, `rule`.`description` from `'+this.tables.user_rule+'` left join `'+this.tables.rule_entity+'` as `rule` on `rule`.`id` = `user_rule`.`rule_entity_id` where `user_rule`.`user_id` = ?', [ parseInt(user) ]);
        if (minimized)
            return await this.query('select `rule`.`id`, `rule`.`name`, `rule`.`description` from `'+this.tables.auth_assignment_min+'` as `assignment` left join `'+this.tables.rule_entity+'` as `rule` on `rule`.`id` = `assignment`.`child` where `assignment`.`parent` = ?', [ rule_id ])
        if (rule_id)
            return await this.query('select `rule`.`id`, `rule`.`name`, `rule`.`description` from `'+this.tables.auth_assignment+'` as `assignment` left join `'+this.tables.rule_entity+'` as `rule` on `rule`.`id` = `assignment`.`child` where `assignment`.`parent` = ?', [ rule_id ]);
        return await this.query('select * from `'+this.tables.rule_entity+'`');
    }

    async getChildren(res, assignment) {
        let data = await this.query("SELECT * FROM `"+this.tables.auth_assignment+"` WHERE `parent` = ?", [ assignment.child ]);
        for (let i = 0; i < data.length; i++)
        {
            let el = data[i];
            let _ = {
                parent: assignment.parent,
                child: el.child
            }
            const children = await this.query("SELECT * FROM `"+this.tables.auth_assignment+"` WHERE `parent` = ?", [ el.child ]);
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
        const assignments = await this.query('select * from `'+this.tables.auth_assignment+'`');
        let children = {};
        for (let el of assignments) {
            children = await this.getChildren(children, el);
            let key = String(el.parent) + String(el.child);
            let _ = {
                parent: el.parent,
                child: el.child
            }
            Object.assign(children, {[key]: _ });
        }
        let query = 'delete from `'+this.tables.auth_assignment_min+'` where `id` != -1;';
        let data = [];
        for (let key of Object.keys(children)) {
            query += "insert into `"+this.tables.auth_assignment_min+"` (`parent`, `child`) values (?, ?);";
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

            const checkDouble  = await this.query('select * from `'+this.tables.auth_assignment+'` where (`parent` = ? and `child` = ?) or (`parent` = ? and `child` = ?)', [ parent, child, child, parent ]);
            if (checkDouble.length) {
                console.error("Error! " + JSON.stringify(checkDouble[0]) + " already exists");
                return;
            }
        }
        for (let child of children) {
            await this.query('insert into `'+this.tables.auth_assignment+'` (`parent`, `child`) values (?, ?)', [ parseInt(parent), parseInt(child) ])
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
            query += 'delete from `'+this.tables.rule_entity+'` where `id` = ?;';
            data.push(id);
        }
        await this.query(query, data);
        await this.minimize();
    }

    async removeAssign(parent, children) {
        let query = '';
        let data = [];
        for (let child of children) {
            query += 'delete from `'+this.tables.auth_assignment+'` where `parent` = ? and `child` = ?';
            data.push(parseInt(parent));
            data.push(parseInt(child));
        }
        await this.query(query, data);
        await this.minimize();
    }

    async assignToUser(user_id, children, remove = false) {
        let query = '';
        let data = [];
        for (let child of children) {
            if (remove)
                query += 'delete from `'+this.tables.user_rule+'` where `user_id` = ? and `rule_entity_id` = ?;';
            else
                query += 'insert into `'+this.tables.user_rule+'` (`user_id`, `rule_entity_id`) values (?, ?);';
            data.push(user_id);
            data.push(child);
        }
        await this.query(query, data);
    }

    async checkAccess(user_id, rule_id) {
        const assignments = await this.query('select `rule_entity_id` from `'+this.tables.user_rule+'` where `user_id` = ?', [ user_id ]);
        if (assignments.length <= 0) {
            return false;
        }
        let data = [];
        let range = '(?';
        let skip = true;
        for (let assignment of assignments) {
            if (assignment.rule_entity_id == rule_id) {
                return true;
            }
            data.push(parseInt(assignment.rule_entity_id));
            if (skip) {
                skip = false;
                continue;
            }
            range += ',?';
        }
        range += ')';
        const minimized = await this.query('select `child` from `'+this.tables.auth_assignment_min+'` where `parent` in ' + range, data);
        for (let rule of minimized) {
            if (rule.child == rule_id) {
                return true;
            }
        }
        return false;
    }
}

export default AccessControl;
