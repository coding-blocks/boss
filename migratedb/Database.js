/**
 * Created by abhishek on 28/05/17.
 */
'use strict';

const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path');

class Migration{
    constructor(fileName,dataDir){
        let res =  /^(\d{3})-to-(\d{3}).sql$/.exec(fileName);
        if(res) {
            this.from = res[1];
            this.to = res[2];
            this.dataDir = dataDir;
            this.fileName = fileName;
            this.name =  `Migration from ${this.from} to ${this.to}`;
        } else {
            console.log(`WARN: ${fileName} is not a migration file`);
        }
    }

    get content(){
        return fs.readFileSync(path.join(this.dataDir,this.fileName),'UTF-8');
    }

    get queries(){
        return this.content.split(';').filter(query=>{ if( query.trim().length ) return query });
    }
}

class Database {
    constructor(options){
        this.db = pgp(options);
        this.dataDir = options.dataDir;
    }

    // arg:  @migrations -> Array of Instance of Migrations to apply
    // Returns : A promise
    applyMigrations(migrations){
        //
        const allQueries = migrations.reduce( (queries , migration) => {
            return queries.concat(migration.queries);
        },[]);


        const source = (index,data,delay)=>{
            console.log(allQueries.length);
            if(allQueries.length > index) {
                console.log(`EXECUTE: ${allQueries[index]}`);
                return this.db.none(allQueries[index]);
            } else {
                return ;
            }
        };

        return this.db.tx(t=> {
            return t.sequence(source);
        });
    }

    // Returns an array of migration need to get to @from to @to
    getMigrations(from,to){
        //TODO
    }

    listMigrations(){
        return new Promise((resolve , reject)=>{
            fs.readdir(this.dataDir , (err,files)=>{
                if(err) {
                    reject(err);
                } else {
                    const migrations = files.map(file => new Migration(file,this.dataDir) )
                                            .filter(m=> { if(Object.keys(m).length !== 0) return m});
                    resolve(migrations);
                }
            })
        })

    }

    end(){
        pgp.end();
    }
}

module.exports = Database;