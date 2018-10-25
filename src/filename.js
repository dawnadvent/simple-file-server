var s = '/';
export default {
    concat(...filenames){
        let fns = filenames.map(fn => {
            if(fn){
                return this.trimSeparator(fn);
            } else {
                return 0;
            }
        }).filter(fn => fn !== 0);
        return '/' + fns.join('/');
    },
    trimSeparator(filename){
        if(filename.startsWith(s)){
            filename = filename.substr(1, filename.length);
            this.trimSeparator(filename);
        }
        if(filename.endsWith(s)){
            filename = filename.substr(0, filename.length - 1);
            this.trimSeparator(filename);
        }
        return filename;
    }
}