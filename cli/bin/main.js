import AccessControlCli from "../lib/main.js";

const accessControl = new AccessControlCli()

if (!process.argv[2]) {
    accessControl.print(() => {
        console.error('You must pass arguments. (use "access-control-cli help" to get information about available commands)');
    })
}
else {
    switch (process.argv[2]) {
        case 'help':
            accessControl.print(() => {
                console.log('---- <config> [host] [db_name] [db_user] [db_pass]. (This command is used to provide access to your db for access-control util.)');
                console.log('---- <migrate> (This command will start migration process after which access-control add to your database some tables which are needed for correctly working.)');
                console.log('---- <add> [name (max=100)] [description (max=1000)] (This command will add new rule entity to access-control)');
                console.log('---- <rules> (This command will print all available rules in your db.)');
                console.log('---- <rules> [rule_id] (This command will print all children rules for [rule_id].)');
                console.log('---- <rules> -M [rule_id] (This command will print minimized (in format role => rule, with all inheritance) rules for [rule_id].)');
                console.log('---- <rules> -R [rule_1_id] [rule_2_id] ... [rule_n_id] (This command will print all available rules in your db. Max amount of rules in one command - 15)');
                console.log('---- <assign> [parent] [child_1] [child_2] ... [child_n]. (This command will assign all child rules to [parent]. Max amount of children in one command - 15)');
                console.log('---- <assign> -R [parent] [child_1] [child_2] ... [child_n]. (This command will remove assignments from [parent]. Max amount of children in one command - 15)');
                console.log('---- <rules> [parent]. (This command will print all rules which are children for [parent] in your db.)');
                console.log('---- <user> [user_id]. (This command will print all available rules for user with id = [user_id].)');
            })
            break;
        case 'config':
            accessControl.print(async () => {
                const credentials = {
                    host: process.argv[3],
                    database: process.argv[4],
                    user: process.argv[5],
                    password: process.argv[6],
                };
                console.log('Processing....');
                await accessControl.writeDbConfig(credentials).then(res => {
                    console.log('Done!');
                });
            })
            break;
        case 'migrate':
            accessControl.print(async () => {
                console.log('Start migration...');
                await accessControl.migrate().then(res => {
                    console.log('Done!');
                });
            })
            break;
        case 'add':
            accessControl.print(async () => {
                console.log('Processing...');
                const res = await accessControl.add(process.argv[3], process.argv[4]);
                if (res.affectedRows) {
                    console.log('Done!');
                }
            });
            break;
        case 'rules':
            accessControl.print(async () => {
                let rows = [];
                if (process.argv[3] == '-R') {
                    console.log('Start removing...');
                    let onDelete = [];
                    for (let i = 4; i < 20; i++) {
                        if (process.argv[i])
                            onDelete.push(parseInt(process.argv[i]));
                        else
                            break
                    }
                    await accessControl.removeRule(onDelete);
                    console.log('Done!');
                    return;
                } else if (process.argv[3] == '-M') {
                    rows = await accessControl.getRules(parseInt(process.argv[4]), true);
                } else if (process.argv[3]) {
                    rows = await accessControl.getRules(parseInt(process.argv[3]));
                } else {
                    rows = await accessControl.getRules();
                }
                console.log('ID | name | description |');
                rows.map(row => {
                    console.log(`${row.id} | ${row.name} | ${row.description}`);
                });
            })
            break;
        case 'assign':

            accessControl.print(async () => {
                if (process.argv[3] == '-R') {
                    console.log('Start removing...')
                    let children = [];
                    for (let i = 4; i < 19; i++) {
                        if (process.argv[i])
                            children.push(process.argv[i]);
                        else
                            break;
                    }
                    await accessControl.removeAssign(process.argv[3], children);
                    console.log('Done!');
                }
                else {
                    let children = [];
                    for (let i = 4; i < 19; i++) {
                        if (process.argv[i])
                            children.push(process.argv[i]);
                        else
                            break;
                    }
                    await accessControl.assign(process.argv[3], children);
                }
            });
            break;
        case 'user':
            break;
        default:
            console.log('<-------------------------------------------------------------------------------------------------------->');
            console.log('(*_*) Access control (*_*)');
            console.error('You must pass AVAILABLE arguments. (use "access-control-cli help" to get information about available commands)');
            console.log('<-------------------------------------------------------------------------------------------------------->');
    }
}
