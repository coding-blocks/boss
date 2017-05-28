#!/usr/local/bin/node
/**
 * Created by abhishek on 28/05/17.
 */
'use strict';

const program = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const secrets = require('../secrets.json').db;
const Database = require('./Database');


secrets.dataDir = path.join(__dirname , secrets.dataDir);
const db = new Database(secrets);

if(process.argv.length < 3)
{
    // default action
    console.log('Select the migration you want to run :');
    db.listMigrations().then(migrations=> {
        return inquirer.prompt([
            {
                type   : 'checkbox',
                message: 'Select Migration',
                name   : 'migrations',
                choices: migrations,
                validate(answer){
                    return true
                }
            }
        ]).then(answers=> {
           const selectedMigrations = migrations.filter( m => { if(answers.migrations.includes(m.name)) return m } );
           return db.applyMigrations(selectedMigrations);
        }).catch(err=>{
            console.error(err);
        });
    }).then(()=> db.end );

}

program
    .version('0.0.1')
    .command('list')
    .action(function(){
        db.listMigrations().then(files=>{
            console.log(files);
        });
    });

program
    .command('apply')
    .action(function () {
       db.listMigrations().then(migrations=>{
           db.applyMigration(migrations[0]);
       })
    });

program
    .command('run')
    .option(`-f --from <n>`,'Starting of Migration' , parseInt )
    .option(`-t --to <n>`, 'End of Migration' , parseInt)
    .action(function(options){
        console.log(options.from , options.to);
    });


program.parse(process.argv);





