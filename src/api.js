import axios from 'axios'
import filename from './filename'

let baseUrl = '/chfs'

/* 
axios.interceptors.request.use(config => {
    return config;
}, err => {
    console.error(err);
    return Promise.reject(err);
})
axios.interceptors.response.use(resp => {
    return resp;
}, err => {
    console.error(err);
    // return Promise.reject(err.response.data);
    return Promise.reject(err);
})
 */
axios.defaults.baseURL = baseUrl;

function getErrMsg(errcode){
    if(errcode === 400)
        return '参数错误';
    if(errcode === 401)
        return '无效Token';
    if(errcode === 403)
        return '无访问权限';
    if(errcode === 404)
        return '文件不存在';
    if(errcode === 500)
        return '服务器内部错误';
    return '未知错误';
}

export default {
    icon(icon){
        return filename.concat(baseUrl, icon);
    },
    files(filepath = '/', callback, errcb){
        axios.get('/files', {params:{filepath}})
        .then(res => callback && callback(res.data))
        .catch(err => errcb && errcb(getErrMsg(err.response.status)))
    },
    newdir(filepath, callback, ec){
        if(filepath && filepath !== ''){
            axios.post('/newdir', 'filepath=' + filepath, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(res => callback && callback(res.data))
            .catch(err => ec && ec(getErrMsg(err.response.status)))
        }
    },
    rmfiles(filepath, callback, ec){
        if(filepath && filepath !== ''){
            axios.delete('/rmfiles', {params:{filepath}})
            .then(res => callback && callback(res.data))
            .catch(err => ec && ec(getErrMsg(err.response.status)))
        }
    },
    rename(modifying, callback, ec){
        if(modifying && modifying.oldName && modifying.newName){
            let postData = new FormData();
            postData.append('new', modifying.newName);
            postData.append('old', modifying.oldName);
            axios.post('/rename', postData, {headers: {"Content-Type": "multipart/form-data"}})
            .then(res => callback && callback(res.data))
            .catch(err => ec && ec(getErrMsg(err.response.status)))
        }
    },
    downloaddir(name, filepath){
        let downloadUrl = filename.concat(baseUrl, 'downloaddir', filepath);
        // location.assign(downloadUrl);
        this.donwload(name, downloadUrl);
    },
    donwload(name, downloadUrl){
        var a = document.createElement('a');
        a.download = name;
        a.href = downloadUrl;
        a.click();
    },
    shared(name, filepath){
        let downloadUrl = filename.concat(baseUrl, 'shared', filepath);
        // location.assign(downloadUrl);
        this.donwload(name, downloadUrl);
    },
    sharedURL(filepath){
        return filename.concat(baseUrl, 'shared', filepath);
    },
    upload(basepath, file , source, pc, succ, errcb){
        let formData = new FormData();
        formData.append('file', file);
        formData.append('folder', filename.trimSeparator(basepath));

        return axios.post('/upload',formData, {
            cancelToken: source.token,
            onUploadProgress: function(progressEvent){
                pc && pc(progressEvent);
            }
        }).then(res => {
            succ && succ(res);
        }).catch(function(err){
            let errmsg = '';
            if(err.response){
                errmsg = getErrMsg(err.response.status);
            }
            errcb && errcb(errmsg)
        })
    },
    exist(basepath, name, succ, errcb){
        let filepath = filename.concat(basepath, name);
        return axios.get('/exist', {params:{file: filepath}})
        .then(res => {
            //文件已存在
            throw new Error('文件已存在');
        }).catch(err => {
            if(err.response){
                if(err.response.status === 404){
                    succ && succ();
                } else {
                    errcb(getErrMsg(err.response.status));
                }
            } else {
                errcb(err.message);
            }
        });
    },
    getSource(){
        return axios.CancelToken.source();
    }
}