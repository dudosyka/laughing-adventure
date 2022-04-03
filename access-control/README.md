# Nodejs Access Control tool

>This tool is used to manage roles and rules in your application

>Before start using that tool you should create .env file in your proj root with such content:
> 
>ACCESS_CONTROL_HOST={YOUR_DATABASE_HOST}
ACCESS_CONTROL_DATABASE={YOUR_DATABASE_NAME}
ACCESS_CONTROL_USER={YOUR_DATABASE_USERNAME}
ACCESS_CONTROL_PASSWORD={YOUR_DATABASE_PASSWORD}

## Methods
1. `writeDbConfig(credentials)`
   > credentials = {
   > 
   > host: "{YOUR_DB_HOST}"
   > 
   > database: "{YOUR_DB_NAME}"
   > 
   > user: "{YOUR_DB_USERNAME}"
   > 
   > password: "{YOUR_DB_PASSWORD}"
   > 
   >}

   This method is used to set the .env variables and success connect to db

2. `migrate`

    This method start migrations and create some tables for correct working

3. `getRules(rule_id, minimized, user)`

    This method return available rules in your project

4. `assign(parent, children)`

    This method create assignment for rules

5. `removeRules(ids) and removeAssign(parent, children)`

    These methods are used to remove rules or assignments

6. `assignToUser(user_id, children, remove)`

    This method create (if remove = false) or delete (if remove = true) assignments besides user and rule

7. `checkAccess(user_id, rule_entity_id)`

    This method checked have the user access to rule_entity
