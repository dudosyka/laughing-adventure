# Nodejs Access Control CLI tool

>This tool is used to manage roles and rules in your application from prompt

>To success install this package to your project
1. Create `.env` file in root of your project with such content:
    >ACCESS_CONTROL_HOST={YOUR_DATABASE_HOST}
    ACCESS_CONTROL_DATABASE={YOUR_DATABASE_NAME}
    ACCESS_CONTROL_USER={YOUR_DATABASE_USERNAME}
    ACCESS_CONTROL_PASSWORD={YOUR_DATABASE_PASSWORD}
2. Run `npm i -g nodejs-access-control-cli`
3. In your proj root dir run `nodejs-access-control-cli migrate`
> That will create in database which you set in step one some tables for success working of nodejs-access-control util
