- ```npm init -y``` 

npm init <initializer> can be used to set up a new or existing npm package. Initializer in this case is an npm package named create-<initializer>, which will be installed by npm-exec, and then have its main bin executed -- presumably creating or updating package.json and running any other initialization-related operations.

**The -y flag when passed to NPM commands tells the generator to use the defaults instead of asking the usual questions.**
npm init -y
will simply generate an empty npm project without going through an interactive process and fill the JSON with preset values.



**Inside /server(or backend):**

-     npm install express mongoose dotenv cors            
-     npm install nodemon --save-dev

What these do:

- express → backend framework
- mongoose → MongoDB ODM
- dotenv → environment variables
- cors → allow frontend connection
- nodemon → auto restart server

## .env and .gitignore

All the files that start with a . like .gitignore and .env are hidden and treated as configuration files. 

### .env is a congig file that stores environment variables and secret data. 

example in .env we have : 
```
MONGO_URI=mongodb://127.0.0.1:27017/stockdb
PORT=5000
JWT_SECRET=mysecretkey
```

and this data our code reads using the line : ```require("dotenv").config;```

**We use .env and not directly write these config values as, some API Keys, passwords etc are secret. Also we might need different config settings for different environments (production, testing, dev etc)** 

TO CREEATE .FILES :
**Powershell** - ```New-Item .env -ItemType File```

**Windows bash, Linux, WSL etc** - ```touch .env```


## What -u Did (Very Important)
```git push -u origin main```

The -u means: Set upstream (link local branch to remote branch)

So next time you can just run: ```git push```
No need to type origin main again.

### install a dependency : ```npm install axios/<name>```

npm install firebase admin