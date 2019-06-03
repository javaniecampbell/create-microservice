import fs, { fdatasync } from "fs";
import { promisify } from "util";
import path from "path";
import slug from "./lib/slug";
import settings from "./config/services.json";
import commandExists from "command-exists";
import { execSync, exec } from "child_process"
import { Observable, from, fromEventPattern } from "rxjs";
import { map } from "rxjs/operators";


const readAsync = promisify(fs.readFile);
const writeAsync = promisify(fs.writeFile);
const existsAsync = promisify(fs.exists);
const executeCmd = promisify(exec); //https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
const processChdir = promisify(process.chdir);
const FILEPATH = path.join(__dirname, "config/services.json");

const saveConfigAsync = async (action: Function) => {
    try {
        if (await existsAsync(FILEPATH)) {
            const config = await readConfigurationAysnc(FILEPATH);
            action(config);
            await writeAsync(FILEPATH, JSON.stringify({ ...config }));
        }
    } catch (e) {
        throw e;
    }
};




// Change directory process.chdir(PATH)
// Show current directory process.pwd()
const changeDirectory = (directoryPath: string) => {

    console.log(`Switching from ${process.cwd()}  to ${directoryPath}`);
    process.chdir(directoryPath);
    from
};

const addService = async (name: String, version: String) => {
    try {
        const escapedName = slug(name.toString());
        await saveConfigAsync((config: any) => {
            config.microservices.push({ name: escapedName, version });
            console.log(config);
        })
    } catch (e) {
        throw e;
    }
};



const main = async () => {

    try {
        const config = await readConfigurationAysnc(FILEPATH);
        // console.log("Configurations", JSON.stringify(config, null, 4));
        //await addService("Happy Fi Yuh","1.0.0");
        // https://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
        const DIST_FOLDER_PATH = path.join(__dirname, `folders/`);
        if (!fs.existsSync(DIST_FOLDER_PATH)) {
            fs.mkdirSync(DIST_FOLDER_PATH);
        }

        iterateMicroservices(config, (microservice: any) => {
            try {
                if (!microservice) return;
                if (microservice && !microservice.name) return;

                let MICROSERVICE_DIR_PATH = path.join(__dirname, `folders/${microservice.name}/`).toLowerCase();
                if (!fs.existsSync(MICROSERVICE_DIR_PATH)) {
                    fs.mkdirSync(MICROSERVICE_DIR_PATH);

                    initializePlatforms(microservice, MICROSERVICE_DIR_PATH);

                } else {
                    if (isDirectoryEmpty(MICROSERVICE_DIR_PATH)) {
                        initializePlatforms(microservice, MICROSERVICE_DIR_PATH);
                    } else {
                        console.log(`Skipping creation ${microservice.platform} folder for ${microservice.name} microservice at location: ${process.cwd()}.`);
                    }
                }
            } catch (error) {
               // console.log(error);
                throw error;
            }
        });

    } catch (error) {
        throw error;
    }
}

const readConfigurationAysnc = async (FILEPATH: string) => {
    return JSON.parse(await readAsync(FILEPATH, { encoding: 'UTF-8' }));
}



const initializePlatforms = (microservice: any, projectPath: string) => {
    if (microservice.platform && microservice.platform === ".netcore") {
        commandExists('dotnet', (_error, exists) => {
            if (exists) {
                changeDirectory(projectPath);
                exec(`dotnet new webapi`, handleOutput);
                //execSync(`dotnet new webapi`);
                console.log(`Created ${microservice.platform} project for ${microservice.name} microservice at location: ${process.cwd()}.`);

                //   changeDirectory("..");
            }
        });
    }


    if (microservice.platform && microservice.platform === "node-api") {
        commandExists('npx', (_error, exists) => {
            if (exists) {
                changeDirectory(projectPath);
                // const { stdout, stderr } = await executeCmd("npx create-express-api ");
                // exec(`npx express --no-view`, handleOutput);
                execSync(`npx express --no-view -f`);
                console.log(`Created ${microservice.platform} project for ${microservice.name} microservice at location: ${process.cwd()}.`);

                // changeDirectory("..");

            }
        });

    }
    if (microservice.platform && microservice.platform === "node") {
        commandExists('npx', (_error, exists) => {
            if (exists) {
                changeDirectory(projectPath);
                // exec(`npx express --view=hbs`, handleOutput);
                execSync(`npx express --view=hbs -f`);
                console.log(`Created ${microservice.platform} project for ${microservice.name} microservice at location: ${process.cwd()}.`);

                //changeDirectory("..");
            }

        });
    }
    initializeGitRepository(microservice, projectPath);
}

from(main()).subscribe((_) => {
    console.log("Doing some work now!!")
}, (error) => {
    console.log("Main Error: ", error);
}, () => {
    console.log("Main Completed !")
});
const initializeGitRepository = (microservice: any, path: string) => {
    try {
        if (fs.existsSync(path)) {
            // setTimeout(() => {
            commandExists('git', (_error, exists) => {
                if (exists) {
                    changeDirectory(path);
                    //https://stackoverflow.com/questions/34953168/node-check-existence-of-command-in-path
                    exec("git init", handleOutput);
                    //execSync("git init");
                    console.log(`Initialize repository for ${microservice.name}`);
                }
                if (_error) {
                    throw _error;
                }
            });
            // }, 2500);
        }
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
const iterateMicroservices = (config: any, callback: Function) => {
    config.microservices.forEach((microservice: any) => {
        callback(microservice);
    });
};

const isDirectoryEmpty = (MICROSERVICE_DIR_PATH: string) => {
    // https://stackoverflow.com/questions/39217271/how-to-determine-whether-the-directory-is-empty-directory-with-nodejs
    let isEmpty: boolean = false;
    fs.readdir(MICROSERVICE_DIR_PATH, (err, files) => {
        if (err) {
            throw err;
        }
        else {
            if (!files.length) {
                isEmpty = true;
            } else {
                isEmpty = false;
            }
        }
    });

    return isEmpty;
};

const handleOutput = (error: any, stderr: any, stdout: any) => {
    if (error) {
        console.log(error);
        throw error;
    }
    if (stdout)
        console.log(`stdout: \n ${stdout}`);
    if (stderr) {
        console.log(`stderr: \n ${stderr}`);
    }
};
