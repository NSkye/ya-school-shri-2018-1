export function logger (currentModule) {
    return function(txt, place, type ='info', other ) {
        const date = new Date(Date.now())
        const log = `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}] ${type} [${place}] in [${currentModule}] ${txt}` + (other ? ('\n' + JSON.stringify(other)) : '');
        console.log(log);
    }
}