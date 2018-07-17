export function logger (currentModule) {
    return function(txt, place, type ='info', other ) {
        const log = `[${Date.now()}] ${type} [${place}] in [${currentModule}] ${txt}` + (other ? ('\n' + JSON.stringify(other)) : '');
        console.log(log);
    }
}