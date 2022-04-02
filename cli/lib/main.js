import mysql from 'mysql'
import fs from 'fs'

class AccessControlCli {
    connection;
    constructor() {}

    async readFile(path) {
        return await (new Promise((resolve,reject) => {
            fs.readFile(path, (err, buffer) => {
                if (err)
                    reject(err)
                resolve(buffer.toString());
            })
        }))
    }

    async readDbConfig() {
        return await this.readFile('./db.json').then(data => JSON.parse(data)).catch(err => err);
    }

    async writeDbConfig(credentials) {
        return await (new Promise((resolve, reject) => {
            fs.writeFile('../lib/db.json', JSON.stringify(credentials), err => {
                if (err)
                    reject(err);
                resolve();
            })
        }))
    }

    async connect() {
        const db_cnf = await this.readDbConfig();
        this.connection = mysql.createConnection({
            ...db_cnf,
            multipleStatements: true
        });
        this.connection.connect();
    }

    async migrate() {
        const user_rule = await this.readFile('../lib/migrations/user_rule.sql').then(data => data).catch(err => console.error(err));
        const rule_entity = await this.readFile('../lib/migrations/rule_entity.sql').then(data => data).catch(err => console.error(err));
        const auth_assignment = await this.readFile('../lib/migrations/auth_assignment.sql').then(data => data).catch(err => console.error(err));
        const auth_assignment_min = await this.readFile('../lib/migrations/auth_assignment_min.sql').then(data => data).catch(err => console.error(err));

        console.log(user_rule, '----', rule_entity, '----', auth_assignment_min, '----', auth_assignment);
    }
}

export default AccessControlCli;