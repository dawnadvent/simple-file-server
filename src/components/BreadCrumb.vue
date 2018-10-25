<template>
    <el-row>
        <!--
        <el-button size="mini" circle icon="el-icon-refresh"></el-button>
        -->
        <span v-for="(item,index) in pathStack" :key="index">
            <span class="breadcrumb-separator" v-if="index != 0">/</span>
            <span class="breadcrumb-item" @click="goto(item, index)">{{item.name}}</span>
        </span>
    </el-row>
</template>
<script>
export default {
    data(){
        return {
            // pathStack: [
            //     {path: '/', name: '根目录'},
            //     {path: '/test22', name: 'test22'},
            //     {path: '/test22/aa', name: 'aa'},
            //     {path: '/test22/aa/bb', name: 'bb'},
            // ]
        }
    },
    props:['pathStack'],
    methods:{
        goto(fileitem, index){
            this.$emit('breadcrumb-click', fileitem, index);
        }
    }
}
</script>
<style scoped>
    .el-row{
        background-color: #eeeeee;
        padding:10px 0px;
    }
    .breadcrumb-item,.breadcrumb-separator{
        margin-right: 10px;
        font-size:16px;
        font-family: 'Courier New', Courier, monospace;
    }
    .breadcrumb-item:hover{
        color: #409EFF;
        cursor: pointer;
    }
</style>
