import * as fs from 'fs';
import * as path from 'path';

class Config {
    path: string;
    private conf: any;
    constructor(userpath:string){
        this.path = userpath;
    }
    static load(userpath:string){
        if(!fs.existsSync(userpath)){
            console.error(new Error('File does not exist!'));
        }
        let config_string: any = fs.readFileSync(path.normalize(userpath), {encoding:'utf8'});
        config_string = config_string.replace(/(?:[,\r"' ])/g, '').split(/\n/g).map((chunk:string)=>chunk.indexOf('#') != -1?chunk.substr(0, chunk.indexOf('#')):chunk).map((chunk:string)=>chunk.split(/:(.+)/, 2));
        let config: any = {};
        let object_start:any;
        let array_start:any;
        config_string.forEach((chunk:Array<string>) => {
            if(chunk[0] == '')return;
            if(chunk[1] == '{' || chunk[1] == '['){
                if(chunk[1] == '{'){
                    config[chunk[0]] = chunk[1];
                    object_start = chunk[0];   
                }else{
                    config[chunk[0]] = chunk[1];
                    array_start = chunk[0];
                }
            }else if(chunk[0] == '}' || chunk[0] == ']'){
                if(chunk[0] == '}'){
                    config[object_start] = config[object_start].substr(0, config[object_start].length-1);
                    config[object_start] += chunk[0];
                    object_start = undefined;   
                }else{
                    config[array_start] = config[array_start].substr(0, config[array_start].length -1);
                    config[array_start] += chunk[0];
                    array_start = undefined;
                }
            }else{
                if(object_start != undefined){
                    config[object_start] += `"${chunk[0]}":"${chunk[1]}",`;
                }else if(array_start != undefined){
                    config[array_start] += `"${chunk[0]}",`;
                }else{
                    config[chunk[0]] = chunk[1];
                }
            }
        });
        return config;
    }
    get(specify:string|null|undefined){
        this.conf = this.conf?this.conf:Config.load(this.path);
        if(specify){
            let specified: any = {};
            for (const key in this.conf) {
                if (this.conf.hasOwnProperty(key) && key.split('_')[0] == specify) {
                    const selector = key.split('_')[1];
                    if(selector == undefined){
                        specified = this.conf[key];
                    }else{
                        specified[selector] = this.conf[key];
                    }
                    try {
                        if(selector == undefined){if(specified.charAt(0) == '{' || specified.charAt(0) == '['){
                            specified = JSON.parse(this.conf[key]);
                        }}else{if(specified[selector].charAt(0) == '{' || specified[selector].charAt(0) == '['){
                            specified[selector] = JSON.parse(this.conf[key]);
                        }}
                    } catch (error) {
                        console.log('you can ignore this: ' + error);
                        return;
                    }
                }
            }
            return specified;
        }
        return this.conf;
    }
}

export default {
    Config
}