[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/coding-blocks/boss) 

[![Total alerts](https://img.shields.io/lgtm/alerts/g/coding-blocks/boss.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/coding-blocks/boss/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/coding-blocks/boss.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/coding-blocks/boss/context:javascript)


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* NodeJS
* Node Package Manager(NPM)
* Git
* PostgreSQL

### Installing

A step by step series of examples that tell you have to get a development environment running

1. Download ZIP file or clone the repository to create your own copy.

```
git clone https://github.com/coding-blocks/boss.git

```

2. Move to the boss repository  

```
cd ./boss

```

3. Install all project dependency packages via NPM

```
npm install

```

4. Create a `secrets.json` file in the root directory taking hint from the `secrets-sample.json` file or You can also create a copy of `secrets-sample.json` file and rename it as `secrets.json` in the root directory. ( Don't worry secrets.json is already added to .gitignore file so it won't be commited )

  

5. Create a Client on Coding Blocks OneAuth using [https://account.codingblocks.com/clients/add](https://account.codingblocks.com/clients/add)

**Remember the Client ID and Client Secret and copy them to your `secrets.json` file.**

  
Also, remember to change the callback URL to your desired url. You can use `http://localhost:3232/login/callback` if you are testing on your localhost system.

  

5. Set up PostgreSQL

- If you don't have PostgreSQL setup on you machine you can download it from [here](https://www.postgresql.org/download/).
- If you have renamed the `secrets-sample.json` file to `secrets.json` then
  - After Installation is complete create a new PostgreSQL user **username** with password as **pass**.
  - Create a new database in PostgreSQL server with name **dbname**.
- If you have created a new `secrets.json` file then create the respective things accordingly.

6. Start the server.

```
npm start
```

And see it working on http://localhost:3232


### For Testing

```
BOSS_DEV=localhost node index.js
```

## API
### CLAIMS
#### List All Claims
```
GET /api/claims?[status=accepted]
```
#### Add a claim
```
POST /api/claims/add
BODY
{
  user: "championswimmer",
  issueUrl: "http://github.com/coding-blocks/lab/issues/7",
  pullUrl: "http://github.com/coding-blocks/lab/pull/7",
  bounty: 20
}

```
