import arg from 'arg';

function parseArgumentsIntoOptions(rawArgs:any) {
    const args  = arg(
        {
            '--yes':Boolean,
            '--git':Boolean,
            '--install':Boolean,
            '-y':'--yes',
            '-g':'--git',
            '-i':'--install'
        },{
            argv: rawArgs.slice(2)
        }
    );
    return {
        skipPrompts: args['--yes'] || false,
        runInstall: args['--install'] || false,
        template: args._[0],
    }
}

async function promptsForMissingOptions(options:any) {
    const defaultTemplate = 'NodeJS';
    if(options.skipPrompts){
        return {
            ...options,
            template: options.template || defaultTemplate
        };
    }
const questions =[];
if (!options.template) {
    questions.push({
        type:'list',
        name:'template',
        message: 'Please choose which project template to use',
        choices: ['JavaScript','TypeScript','node','node-api','.netcore']
    });
}

}

export function cli(args:any){
    let options = parseArgumentsIntoOptions(args);
    console.log(options);
}