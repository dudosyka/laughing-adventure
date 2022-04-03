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
                console.log('---- <assign> [parent] [child_1] [child_2] ... [child_n]. (This command will assign child rules to [parent].)');
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
                console.log('ID | name | description |');
                const rows = await accessControl.getRules();
                rows.map(row => {
                    console.log(`${row.id} | ${row.name} | ${row.description}`);
                });
            });
            break;
        case 'assign':
            await accessControl.assign(process.argv[3], process.argv[4]);
            // accessControl.print(async () => {
            // });
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
