import AccessControlCli from "../lib/main.js";

const accessControl = new AccessControlCli()

if (!process.argv[2]) {
    console.log('<-------------------------------------------------------------------------------------------------------->');
    console.log('(*_*) Access control (*_*)');
    console.error('You must pass arguments. (use "access-control-cli help" to get information about available commands)');
    console.log('<-------------------------------------------------------------------------------------------------------->');
}

switch (process.argv[2]) {
    case 'help':
        console.log('<-------------------------------------------------------------------------------------------------------->');
        console.log('(*_*) Access control (*_*)');
        console.log('---- <config> [host] [db_name] [db_user] [db_pass]. (This command is used to provide access to your db for access-control util.)');
        console.log('---- <migrate> (This command will start migration process after which access-control add to your database some tables which are needed for correctly working.)');
        console.log('---- <rules> (This command will print all available rules in your db.)');
        console.log('---- <rules> [parent]. (This command will print all rules which are children for [parent] in your db.)');
        console.log('---- <assign> [parent] [child_1] [child_2] ... [child_n]. (This command will assign child rules to [parent].)');
        console.log('---- <user> [user_id]. (This command will print all available rules for user with id = [user_id].)');
        console.log('<-------------------------------------------------------------------------------------------------------->');
        break;
    case 'config':
        console.log('<-------------------------------------------------------------------------------------------------------->');
        console.log('(*_*) Access control (*_*)');
        const credentials = {
            host: process.argv[3],
            database: process.argv[4],
            user: process.argv[5],
            password: process.argv[6],
        };
        console.log('Processing....');
        accessControl.writeDbConfig(credentials).then(res => {
            console.log('Done!');
            console.log('<-------------------------------------------------------------------------------------------------------->');
        });
        break;
    case 'migrate':
        console.log('<-------------------------------------------------------------------------------------------------------->');
        console.log('(*_*) Access control (*_*)');
        console.log('Start migration...');
        accessControl.migrate().then(res => {
            console.log('Done!');
            console.log('<-------------------------------------------------------------------------------------------------------->');
        });
        break;
    case 'rules':
        break;
    case 'assign':
        break;
    case 'user':
        break;
    default:
        console.log('<-------------------------------------------------------------------------------------------------------->');
        console.log('(*_*) Access control (*_*)');
        console.error('You must pass AVAILABLE arguments. (use "access-control-cli help" to get information about available commands)');
        console.log('<-------------------------------------------------------------------------------------------------------->');
}