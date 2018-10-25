<template>
    <el-container>
        <el-header>
            <div class="left-tools">
                <el-button type="primary" size="medium" @click="openFileSelector">
                    <i class="el-icon-upload"></i>上传文件
                    <input v-if="inputUpload" type="file" multiple id="multipartUploader" style="display:none;" @change="uploadingDialog" />
                </el-button>
                <el-button type="primary" size="medium" @click="showNewDir = true"><i class="el-icon-plus"></i>新建目录</el-button>
                <!--
                <el-button type="primary" size="medium"><i class="el-icon-document"></i>新建文本</el-button>
                -->
                <el-input v-model="searchText" :clearable="true" placeholder="请输入内容" size="medium" class="search-box" maxlength="20">
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
            <div class="right-tools">
                <!--
                <el-button type="danger" size="medium" class="logout">登出</el-button>
                -->
                <el-button round size="medium" @click="refreshList()">
                    <i class="el-icon-refresh"></i>
                    刷新
                </el-button>
            </div>
        </el-header>
        <el-main>
            <el-row>
                <bread-crumb @breadcrumb-click="breadcrumbClick" :pathStack="pathStack"></bread-crumb>
            </el-row>
            <el-row>
                <el-table :data="filterdFiles" class="data-table">
                    <el-table-column prop="filename" label="文件名" min-width="40%">
                        <template slot-scope="scope">
                            <img :src="scope.row.icon" class="file-icon" />
                            <span class="row-data" @click="goto(scope.row)">{{scope.row.filename}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="size" label="大小" min-width="10%"></el-table-column>
                    <el-table-column prop="updateTime" label="修改时间" min-width="20%"></el-table-column>
                    <el-table-column label="操作" min-width="20%">
                        <template slot-scope="scope">
                            <el-button circle size="small" icon="el-icon-download" type="success" :title="scope.row.dir ? '打包下载' : '下载'" @click="downloadFile(scope.row)"></el-button>
                            <el-button v-if="!scope.row.dir" circle size="small" icon="el-icon-menu" type="primary" title="二维码下载" @click="openQRCodeView(scope.row.filepath)"></el-button>
                            <el-button circle size="small" icon="el-icon-edit" type="warning" title="重命名" @click="showModifyDialog(scope.row)"></el-button>
                            <el-button circle size="small" icon="el-icon-delete" type="danger" title="删除" @click="rmfiles(scope.row.filepath)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </el-main>
        <el-dialog title="新建目录" :visible.sync="showNewDir" @closed="newDirName = ''">
            <el-row class="folder-name">
                <el-input v-model="newDirName" placeholder="目录名称，例如: 我的文档" :clearable="true" size="medium" :autofocus="true" maxlength="20"></el-input>
            </el-row>
            <el-row class="dialog-btns">
                <el-button type="danger" size="medium" @click="showNewDir = false"><i class="el-icon-close"></i>取消</el-button>
                <el-button type="primary" size="medium" @click="createDir"><i class="el-icon-check"></i>确定</el-button>
            </el-row>
        </el-dialog>
        <el-dialog title="重命名" :visible.sync="showModify" @closed="dirModifying.newName = ''">
            <el-row class="folder-name">
                <el-input :disabled="true" v-model="dirModifying.oldName" placeholder="目录名称，例如: 我的文档" :clearable="true" size="medium" :autofocus="true" maxlength="20"></el-input>
            </el-row>
            <el-row class="folder-name">
                <el-input v-model="dirModifying.newName" placeholder="目录名称，例如: 我的文档" :clearable="true" size="medium" :autofocus="true" maxlength="20"></el-input>
            </el-row>
            <el-row class="dialog-btns">
                <el-button type="danger" size="medium" @click="showModify = false"><i class="el-icon-close"></i>取消</el-button>
                <el-button type="primary" size="medium" @click="modifyDir"><i class="el-icon-check"></i>确定</el-button>
            </el-row>
        </el-dialog>
        <el-dialog title="文件上传" :close-on-click-modal="false" :visible.sync="showUploader" @closed="uploadClose" @close="refreshList()">
            <el-row>
                <div class="progress-item" v-for="(pg, index) of uploadProgress" :key="index">
                    <div class="progress-filename">
                        {{pg.filename}}({{pg.progressLabel}})
                        <a href="javascript:;" v-if="pg.status == ''" @click="pg.source.cancel('取消上传')">取消</a>
                    </div>
                    <el-progress :percentage="pg.percentage" :status="pg.status" :stroke-width="10" :show-text="false"></el-progress>
                </div>
            </el-row>
            <el-row class="dialog-btns">
                <el-button type="danger" size="medium" @click="showUploader = false"><i class="el-icon-close"></i>关闭</el-button>
            </el-row>
        </el-dialog>
        <el-dialog title="扫码下载" :visible.sync="showQRCode" width="500px">
            <canvas id="qrcodeCanvas"></canvas>
        </el-dialog>
    </el-container>
</template>
<script>
import BreadCrumb from '../components/BreadCrumb.vue'
import QRCode from 'qrcode'

export default {
    data(){
        return {
            //对话框
            showUploader: false,
            showNewDir: false,
            showModify: false,
            showQRCode: false,
            inputUpload: false,
            //新文件名
            newDirName: '',
            //重命名信息
            dirModifying: {oldName:'',newName: '',filepath: ''},
            //未筛选的结果
            files: [],
            //文件筛选结果
            filterdFiles: [],
            //文件查询的文本
            searchText:'',
            //面包屑导航的路径栈
            pathStack: [],
            //二维码内容，下载的url
            qrcodeContent: '',
            //进度条信息
            uploadProgress: []
        }
    },
    components:{BreadCrumb},
    created(){
        
    },
    mounted(){
        this.fillList('', '根目录');
    },
    methods: {
        fillList(basepath, filename, index){
            let that = this;
            // let basepath = this.getFullPath();
            this.$api.files(basepath, function(data){
                let fs = [];
                fs = fs.concat(data.files.filter(f => f.dir).sort());
                fs = fs.concat(data.files.filter(f => !f.dir).sort());
                fs = fs.map(f => {
                    return {
                        dir: f.dir,
                        icon: that.$api.icon(f.icon),
                        filename: f.name,
                        // filepath: basepath + '/' + f.name,
                        filepath: that.$filename.concat(basepath, f.name),
                        size: that.renderSize(f.size),
                        updateTime: f.modified
                    };
                });
                that.files = fs;
                that.filterdFiles = fs;
                that.searchText = '';
                index !== undefined && (that.pathStack = that.pathStack.slice(0, index));
                that.pathStack.push({path: basepath, name: filename});
            }, errmsg => {
                that.$message({
                    type: 'error',
                    showClose: true,
                    message: errmsg
                });
                that.refreshList();
            });
        },
        refreshList(){
            let lastIndex = this.pathStack.length - 1;
            let last = this.pathStack[lastIndex];
            // let last = this.pathStack.pop();
            this.fillList(last.path, last.name, lastIndex);
        },
        renderSize(value){
            if(null==value||value==''){
                return "0 B";
            }
            var unitArr = new Array("B","KB","MB","GB","TB","PB","EB","ZB","YB");
            var index=0;
            var srcsize = parseFloat(value);
            index=Math.floor(Math.log(srcsize)/Math.log(1024));
            var size =srcsize/Math.pow(1024,index);
            size=size.toFixed(2);//保留的小数位数
            return size + ' ' + unitArr[index];
        },
        goto(row){
            if(row.dir){
                this.fillList(row.filepath, row.filename);
            } else {
                this.downloadFile(row);
            }
        },
        breadcrumbClick(fileitem, index){
            this.fillList(fileitem.path, fileitem.name, index);
        },
        rmfiles(filepath){
            let that = this;
            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                that.$api.rmfiles(filepath, data => {
                    that.refreshList();
                    that.$message({
                        type:'success',
                        showClose: true,
                        message: '删除成功'
                    });
                }, errmsg => {
                    that.refreshList();
                    that.$message({
                        type:'error',
                        showClose: true,
                        message: errmsg
                    });
                });
            }).catch(() => {
                // this.$message('失败');
            });
        },
        //文件下载
        downloadFile(row){
            if(row.dir){
                this.$api.downloaddir(row.filename, row.filepath);
            } else {
                this.$api.shared(row.filename, row.filepath);
            }
        },
        createDir(){
            let that = this;
            let lastIndex = this.pathStack.length - 1;
            let last = this.pathStack[lastIndex];
            let newDir = this.$filename.concat(last.path, this.newDirName);
            // let newDir = last.path + '/' + this.newDirName;
            this.$api.newdir(newDir, data => {
                that.refreshList();
                that.showNewDir = false;
                that.newDirName = '';
            }, errmsg => {
                that.$message({
                    showClose: true,
                    type: 'error',
                    message: errmsg
                });
                that.refreshList();
            });
        },
        showModifyDialog(row){
            this.dirModifying.oldName = row.filename;
            this.dirModifying.filepath = row.filepath;
            this.showModify = true;
        },
        modifyDir(){
            let that = this;
            this.$api.rename({
                oldName: this.dirModifying.filepath,
                newName: this.dirModifying.newName
            }, res => {
                that.refreshList();
            }, errmsg => {
                that.refreshList();
                that.$message({
                    type:'error',
                    showClose: true,
                    message: errmsg
                });
            });
            this.showModify = false;
        },
        //文件上传
        openFileSelector(){
            this.inputUpload = true;
            setTimeout(()=>{
                try {
                    document.getElementById('multipartUploader').click()
                } catch (e) {
                    console.warn(e.name + ': ' + e.message);
                }
            }, 0);
            // document.getElementById('multipartUploader').click();
        },
        uploadingDialog(evt){
            let that = this;
            let files = evt.target.files;
            if(files && files.length > 0){
                this.showUploader = true;
                let reqs = [];
                for(var i = 0;i<files.length;i++){
                    let f = files[i];

                    this.uploadProgress.push({
                        filename: f.name,
                        size: that.renderSize(f.size),
                        status: '',
                        percentage: 0,
                        source: that.$api.getSource()
                    });
                    let currentDir = this.pathStack[this.pathStack.length - 1];
                    let req = this.uploadFile(currentDir.path, f, i);
                    reqs.push(req);
                }
            }
        },
        uploadFile(currentDirPath, file ,i){
            let that = this;
            let pg = that.uploadProgress[i];
            return this.$api.exist(currentDirPath, file.name, res => {
                return this.$api.upload(currentDirPath, file, pg.source, pgevt => {
                    console.log(pg.status)
                    pg.percentage = Number((pgevt.loaded / pgevt.total * 100).toFixed(2));
                    pg.progressLabel = ((pgevt.loaded / pgevt.total) * 100).toFixed(2) + '%';
                    if(pg.percentage == 100){
                        pg.status = 'success';
                    }
                }, res => {
                    console.log('上传成功结束');
                    pg.percentage = 100;
                    pg.progressLabel = '100%';
                    pg.status = 'success';
                }, errmsg => {
                    console.log('上传出现异常1');
                    // pg.percentage = 0;
                    // pg.progressLabel = '0%';
                    pg.status = 'exception';
                });
            }, errmsg => {
                console.log('上传出现异常2');
                pg.status = 'exception';
                pg.progressLabel = errmsg;
            });
        },
        uploadClose(){
            this.uploadProgress.forEach(p => {
                console.log('窗口关闭，取消上传');
                p.source.cancel('取消上传')
            });
            this.inputUpload = false;
            this.uploadProgress = [];
        },
        //二维码下载
        openQRCodeView(filepath){
            let qrcodeContent = this.$api.sharedURL(filepath);
            this.qrcodeContent = location.origin + qrcodeContent;
            this.showQRCode = true;
            setTimeout(this.fillQRCode, 0);
            // this.fillQRCode();
        },
        fillQRCode(){
            if(this.qrcodeContent && this.qrcodeContent != ''){
                console.log(this.qrcodeContent)
                QRCode.toCanvas(document.getElementById('qrcodeCanvas'), 
                this.qrcodeContent,
                {
                    errorCorrectionLevel: 'H',
                    width: 250
                }, 
                function(error){
                    // console.log(error);
                });
            }
        }
    },
    watch: {
        searchText(newVal){
            this.filterdFiles = this.files.filter(f => f.filename && f.filename.indexOf(newVal) !== -1);
        }
    }
}
</script>

<style scoped>
.el-container{
    padding: 20px 0;
    border-radius: 25px;
}
.el-header{
    height: auto !important;
}
.search-box{
    width:320px;
    margin-left: 10px;
}
.file-icon {
    max-width: 25px;
    max-height: 25px;
    vertical-align: middle;
}
.data-table{
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
}
.row-data{
    line-height: 25px;
    display: inline-block;
    margin-left: 10px;
    font-family: monospace,'Courier New', Courier;
    /* font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; */
    cursor: pointer;
}
.folder-name{
    padding:10px 0px;
}
.hide-row{
    display: none;
}
.left-tools{
    float: left;
    padding:0px;
    margin:0px;
}
.right-tools{
    float: right;
    margin:0px;
    padding:0px;
}
#qrcodeCanvas{
    width: 250px;
    height: 250px;
    margin:0px auto;
    display: block;
}
.dialog-btns{
    margin-top:20px;
}
.progress-item{
    padding:0px 0px;
    margin:0px 0px 10px 0px;
}
.progress-item .progress-filename{
    margin:5px 0px;
}

</style>
