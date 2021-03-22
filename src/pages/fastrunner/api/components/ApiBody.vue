<template>
    <div>
        <div>
                            
            <div>
                

                <el-input
                    style="width: 600px"
                    placeholder="请输入接口名称"
                    v-model="name"
                    clearable>
                    <template slot="prepend">接口信息录入</template>

                    <el-button
                        slot="append"
                        type="success"
                        plain
                        @click="save = !save"
                    >Save
                    </el-button>
                </el-input>
                
                <el-button
                    type="primary"
                    @click="reverseStatus"
                    v-loading="loading"
                    :disabled="loading"
                >Send
                </el-button>
                
                
                <el-upload
                    style="display:inline-block"
                        action=""
                        class="upload-demo"
                        ref="upload"
                        :on-change="handleChange"
                        :auto-upload="false"
                        :show-file-list='false'
                        :limit="1"><el-button type="primary" style="display:inline-block">解析文件</el-button>
                </el-upload>
                <el-input
                    style="width: 350px"
                    placeholder="请点击解析文件"
                    v-model="fileName"
                    :readonly="true"
                    >
                </el-input>
                <el-button type="primary" style="display:inline-block" @click="beforeRemove()">清空解析</el-button>


            </div>

            <div>
                <el-input
                    style="width: 600px; margin-top: 10px"
                    placeholder="请输入接口请求地址"
                    v-model="url"
                    clearable
                >
                    <el-select
                        style="width: 125px"
                        slot="prepend"
                        v-model="method">
                        <el-option
                            v-for="item of httpOptions"
                            :label="item.label"
                            :value="item.label"
                            :key="item.value">
                        </el-option>
                    </el-select>

                </el-input>

                <el-tooltip
                    effect="dark"
                    content="循环次数"
                    placement="bottom">
                    <el-input-number
                        v-model="times"
                        controls-position="right"
                        :min="1"
                        :max="100"
                        style="width: 120px">
                    </el-input-number>
                </el-tooltip>

                <el-button type="primary" style="display:inline-block" @click="debug()">查看调试结果</el-button>
            </div>

        </div>

        <div class="request">

            <el-dialog
                :visible.sync="dialogTableVisible">
                <report :summary="summary"></report>

            </el-dialog>

            <el-dialog :visible.sync='dialogHttprunnerLog' >
                <h3> HttpRunner 日志报错信息</h3>
                <el-divider></el-divider>
                
                <ul  style="overflow:auto">
                    <li v-for="(i) in summary.error" style="color:green;font-size:20px;background:black">{{ i }}</li>
                    
                </ul>
            </el-dialog>

            <el-tabs
                style="margin-left: 20px;"
                v-model="activeTag">
                <el-tab-pane label="Header" name="first">
                    <headers
                        :save="save"
                        v-on:header="handleHeader"
                        :header="response ? response.body.header: [] "
                        ref="header">>
                    </headers>
                </el-tab-pane>

                <el-tab-pane label="Request" name="second">
                    <request
                        :save="save"
                        v-on:request="handleRequest"
                        :request="response ? response.body.request: []">
                    </request>
                </el-tab-pane>

                <el-tab-pane label="Extract" name="third">
                    <extract
                        :save="save"
                        v-on:extract="handleExtract"
                        :extract="response ? response.body.extract : []">
                    </extract>
                </el-tab-pane>

                <el-tab-pane label="Validate" name="fourth">
                    <validate
                        :save="save"
                        v-on:validate="handleValidate"
                        :validate="response ? response.body.validate: []"
                    >

                    </validate>
                </el-tab-pane>

                <el-tab-pane label="Variables" name="five">
                    <variables
                        :save="save"
                        v-on:variables="handleVariables"
                        :variables="response ? response.body.variables : []"
                    >

                    </variables>
                </el-tab-pane>

                <el-tab-pane label="Hooks" name="six">
                    <hooks
                        :save="save"
                        v-on:hooks="handleHooks"
                        :hooks="response ? response.body.hooks: []"
                    >
                    </hooks>
                </el-tab-pane>
            </el-tabs>

        </div>


    </div>

</template>

<script>
    import Headers from '../../../httprunner/components/Headers'
    import Request from '../../../httprunner/components/Request'
    import Extract from '../../../httprunner/components/Extract'
    import Validate from '../../../httprunner/components/Validate'
    import Variables from '../../../httprunner/components/Variables'
    import Hooks from '../../../httprunner/components/Hooks'
    import Report from '../../../reports/DebugReport'





    export default {
        name: "ApiBody",

        components: {
            Headers,
            Request,
            Extract,
            Validate,
            Variables,
            Hooks,
            Report
            },

        props: {
            host: {
                require: false
            },
            nodeId: {
                require: false
            },
            project: {
                require: false
            },
            config: {
                require: false
            },
            response: {
                require: false
            },
    
        },
        watch: {
            response() {
                this.name = this.response.body.name;
                this.method = this.response.body.method;
                this.url = this.response.body.url;
                this.times = this.response.body.times;
                this.id = this.response.id;
                this.header = this.response.body.header
                this.variables = this.response.body.variables
                this.validate = this.response.body.validate
                this.request = this.response.body.request
                this.hooks = this.response.body.hooks
                this.summary={}
            },
            save: function () {
                 if (!this.run) {
                    if (this.id === '') {
                        this.addAPI();
                    } else {
                        this.updateAPI();
                    }
                } else {
                    
                    this.runAPI();
                    this.run = false;
                }
            },
        },
        data() {
            return {
                loading: false,
                times: 1,
                name: '',
                url: '',
                id: '',
                json_header:'',
                header: [],
                request: {
                    data: [{
                            key: "",
                            value: "",
                            desc: "",
                            type: 1
                        }],
                    params: [{
                            key: "",
                            value: "",
                            desc: "",
                            type: 1
                        }],
                    json_data: ''
                },
                extract: [],
                validate: [],
                variables: [],
                hooks: [],
                method: 'GET',
                dialogHttprunnerLog:false,
                dialogTableVisible: false,
                save: false,
                run: false,
                summary: {},
                activeTag: 'second',
                httpOptions: [{
                    label: 'GET',
                }, {
                    label: 'POST',
                }, {
                    label: 'PUT',
                }, {
                    label: 'DELETE',
                }, {
                    label: 'HEAD',
                }, {
                    label: 'OPTIONS',
                }, {
                    label: 'PATCH',
                }],
                fileName:"",
            }
        },
        methods: {
            
            parseRequestParams() {
                let params = {
                    params: {},
                    desc: {}
                };
                for (let content of this.request.params) {
                    if (content['key'] !== '') {
                        params.params[content['key']] = content['value'];
                        params.desc[content['key']] = content['desc'];
                    }
                }
                return params;
            },

            parseRequestJson() {
                let json = {};
                if (this.jsonData !== '') {
                    try {
                        json = JSON.parse(this.request.json_data);
                    } catch (err) {
                        this.$notify.error({
                            title: 'json错误',
                            message: '不是标准的json数据格式',
                            duration: 2000
                        });
                    }
                }
                return json;
            },

            parseRequestHeader() {
                let header = {
                    header: {},
                    desc: {}
                };
                for (let content of this.header) {
                    if (content['key'] !== '' && content['value'] !== '') {
                        header.header[content['key']] = content['value'];
                        header.desc[content['key']] = content['desc'];
                    }
                }
                return header;
            },

            reverseStatus() {
                this.save = !this.save;
                this.run = true;
            },

            handleHeader(header) {
                this.header = header;
            },
            handleRequest(request) {
                this.request = request;
            },
            handleValidate(validate) {
                this.validate = validate;
            },
            handleExtract(extract) {
                this.extract = extract;
            },
            handleVariables(variables) {
                this.variables = variables;
            },
            handleHooks(hooks) {
                this.hooks = hooks;
            },

            validateData() {
                if (this.url === '') {
                    this.$notify.error({
                        title: 'url错误',
                        message: '接口请求地址不能为空',
                        duration: 1500
                    });
                    return false;
                }

                if (this.name === '') {
                    this.$notify.error({
                        title: 'name错误',
                        message: '接口名称不能为空',
                        duration: 1500
                    });
                    return false;
                }
                return true
            },
            updateAPI() {
                if (this.validateData()) {
                    this.$api.updateAPI(this.id, {
                        header: this.header,
                        request: this.request,
                        extract: this.extract,
                        validate: this.validate,
                        variables: this.variables,
                        hooks: this.hooks,
                        url: this.url,
                        method: this.method,
                        name: this.name,
                        times: this.times,
                    }).then(resp => {
                        if (resp.success) {
                            this.$emit('addSuccess');
                        } else {
                            this.$message.error({
                                message: resp.msg,
                                duration: this.$store.state.duration
                            })
                        }
                    })
                }
            },

            runAPI() {

                if(this.host === '请选择'){
                    if(!this.url.startsWith("http")){
                        this.$message({
                        type: "info",
                        message: "请选择host配置"
                        });
                        return
                    }else{
                        this.requestApi()
                    }
                }else{
                    this.requestApi()
                }
               

            },

            requestApi(){
                if (this.validateData()) {
                    this.loading = true;
                    console.log(this.header)
                    this.$api.runSingleAPI({
                        header: this.header,
                        request: this.request,
                        extract: this.extract,
                        validate: this.validate,
                        variables: this.variables,
                        hooks: this.hooks,
                        url: this.url,
                        method: this.method,
                        name: this.name,
                        times: this.times,
                        project: this.project,
                        config: this.config,
                        host:this.host,
                        timestamp:(new Date()).valueOf()
                    }).then(resp => {
                        this.summary = resp;
                        if(this.summary.error){
                            this.dialogHttprunnerLog = true
                        }else{
                            this.dialogTableVisible = true;
                        }
     
                        this.loading = false;
                    }).catch(resp => {
                        this.loading = false;
                    })
                }
            },

            addAPI() {
                if (this.validateData()) {
                    this.$api.addAPI({
                        header: this.header,
                        request: this.request,
                        extract: this.extract,
                        validate: this.validate,
                        variables: this.variables,
                        hooks: this.hooks,
                        url: this.url,
                        method: this.method,
                        name: this.name,
                        times: this.times,
                        nodeId: this.nodeId,
                        project: this.project,

                    }).then(resp => {
                        if (resp.success) {
                            this.$emit('addSuccess');
                        } else {
                            this.$message.error({
                                message: resp.msg,
                                duration: this.$store.state.duration
                            })
                        }
                    })
                }
            },

            parseHeader(self,data){

                let requestDataHeader = data['request']['headers']

                    for(let k in requestDataHeader) {
 
                        //遍历对象，k即为key，obj[k]为当前k对应的值
                        self.push({
                                key: k,
                                value: requestDataHeader[k],
                                desc: ""
                        })
                    }
                    this.handleHeader(self)

            },

            parseValidate(self,data){
                    let requestDataValidate = data['validate']
                    for(let k in requestDataValidate) {

                        for (let j in requestDataValidate[k]){
                            self.push({
                                expect: requestDataValidate[k][j][1],
                                actual: requestDataValidate[k][j][0],
                                comparator: "equals",
                                type: 1
                        })
                        }
                    }

                    this.handleValidate(self)
            },

            parseVariables(self,data){
                if(data['variables']){
                        let requestDataVariables = data['variables']    

                    for(let k in requestDataVariables) {
 
                        //遍历对象，k即为key，obj[k]为当前k对应的值
                        self.push({
                                key: k,
                                value: requestDataVariables[k],
                                desc: "",
                                type: 1
                        })
                    }

                    this.handleVariables(self)
                }else{
                        self.push({
                                key: "",
                                value: "",
                                desc: "",
                                type: 1
                        })
                    }
            },

            parseRequest(self,data){

                    if(data['request']['json']){
                        let requestJsonData = data['request']['json']                      
                        self.json_data = JSON.stringify(requestJsonData)
                    }else{
                        self.json_data = '{}'
                    }


                    if(data['request']['params'] ){
                        let requestParams = data['request']['params'] 
                        for(let k in requestParams) {
 
                        //遍历对象，k即为key，obj[k]为当前k对应的值
                            self.params.push({
                                    key: k,
                                    value: requestParams[k],
                                    desc: "",
                                    type: 1
                            })
                        }
                        
                    }else{
                        self.params.push({
                                    key: '',
                                    value: '',
                                    desc: "",
                                    type: 1
                            })
                    }

                    if(data['request']['data']){
                        let requestFormData = data['request']['data'] 

                        for(let k in requestFormData) {
 
                        //遍历对象，k即为key，obj[k]为当前k对应的值
                            self.data.push({
                                    key: k,
                                    value: requestFormData[k],
                                    desc: "",
                                    type: 1
                            })
                        }
                        
                    }else{
                        self.data.push({
                                    key: '',
                                    value: '',
                                    desc: "",
                                    type: 1
                            })
                    }

                    this.handleRequest(self)
            },
            parseHooks(self,setupHooks,teardownHooks){

                if(setupHooks != '' && teardownHooks != '' && typeof(teardownHooks) != "undefined" && typeof(setupHooks) != "undefined"){
                    
                    let setLen = setupHooks.length
                    let tearLen = teardownHooks.length

                    if(setLen >= tearLen){
                        for(let i=0;i<setLen;i++){
                            if(i<=tearLen){
                                self.push({
                                    setup: setupHooks[i],
                                    teardown: teardownHooks[i]
                                })
                            }else{
                                self.push({
                                    setup: setupHooks[i],
                                    teardown: ''
                                })
                            }
                        
                        }
                    }else{
                        for(let i=0;i<tearLen;i++){
                            if(i<=setLen){
                                self.push({
                                    setup: setupHooks[i],
                                    teardown: teardownHooks[i]
                                })
                            }else{
                                self.push({
                                    setup: '',
                                    teardown: teardownHooks[i]
                                })
                            }
                        
                        }
                        }
                    

                }else if(setupHooks != '' && (teardownHooks == ''|| typeof(teardownHooks) == "undefined")){
                    let setLen = setupHooks.length

                    for(let i=0;i<setLen;i++){

                        self.push({
                            setup: setupHooks[i],
                            teardown: ''
                            })
                        }

                }else if((setupHooks == '' || typeof(setupHooks) == "undefined" ) && teardownHooks != ''){
                    let tearLen = teardownHooks.length
                    for(let i=0;i<tearLen;i++){

                        self.push({
                            setup: '',
                            teardown: teardownHooks[i]
                            })
                        }
                }else{
                     self.push({
                            setup: '',
                            teardown: '',
                            })
                    
                } 
                this.handleHooks(self)
                
            },

            handleChange(file) {
                let reader = new FileReader();   //先new 一个读文件的对象 FileReader
                if (typeof FileReader === "undefined") {  //用来判断你的浏览器是否支持 FileReader
                    this.$message({
                        type: "info",
                        message: "您的浏览器不支持文件读取。"
                    });
                    return;
                }
            //  reader.readAsText(file.raw, "gb2312");  //读.txt文件
                reader.readAsArrayBuffer(file.raw); //读任意文件
                this.fileName = file.name

                var self = this
                this.clearAllData()
                reader.onload = function (e) {

                    
                    var ints = new Uint8Array(e.target.result); //要使用读取的内容，所以将读取内容转化成Uint8Array
                    ints = ints.slice(0, 5000); //截取一段读取的内容
                    
                    let snippets = new TextDecoder('utf8').decode(ints); //二进制缓存区内容转化成中文（即也就是读取到的内容）
                    
                    let data= JSON.parse(snippets.replace(/'/g, '"'))             

                    console.log(data)

                    self.name = data['name']
                    self.url = data['request']['url']
                    self.method = data['request']['method']
                    // header 操作
                    self.parseHeader(self.header,data)
                    // validate 操作
                    self.parseValidate(self.validate,data)
 

                    // variable 操作
                    self.parseVariables(self.variables,data)

                    // request 请求参数操作
                    self.parseRequest(self.request,data)

                    // setup_hooks 操作
                    // self.parseHooks(self,request.setup_hooks)
                    let setup = data.setup_hooks
                    let teardown = data.teardown_hooks

                    self.parseHooks(self.hooks,setup,teardown)

                    //teardown_hooks
                    

                }; 


            },

            clearAllData(){
                // 解析文本清空操作
                this.name=''
                this.url=''
                this.header.splice(0,this.header.length)
                this.variables.splice(0,this.variables.length);
                this.validate.splice(0,this.validate.length);
                this.request.data.splice(0,this.request.data.length)
                this.request.params.splice(0,this.request.params.length)
                this.hooks.splice(0,this.hooks.length)
                this.response.body.request.json_data = '' 
 


            },
             initData() {
                
                this.header.push({
                    key: "",
                    value: "",
                    desc: ""
                })

                this.validate.push ({
                    expect: "",
                    actual: "",
                    comparator: "equals",
                    type: 1
                })
                            
                this.variables.push({
                    key: "",
                    value: "",
                    desc: "",
                    type: 1
                })

                this.extract.push({
                    key: "",
                    value: "",
                    desc: ""
                })

                this.hooks.push({
                    setup: "",
                    teardown: ""
                })

                this.request.data.push(
                    {
                        key: "",
                        value: "",
                        desc: "",
                        type: 1
                    }
                )
                this.request.params.push(
                    {
                        key: "",
                        value: "",
                        desc: "",
                        type: 1
                    }
                )
                this.request.json_data=''

            },
            
            clearButton(){
                this.$refs.upload.clearFiles();
                this.fileName=''
                this.clearAllData()
                this.initData()
            },

            beforeRemove() {
                if(this.fileName != ''){

                   this.$confirm(`移除文件将清空解析内容，确定移除 ${ this.fileName }？`,{
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.clearButton()
                   }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消删除'
                        });          
                    });
                   
                    }else{
                        this.$message({
                            type: "error",
                            message: "你还没上传需要解析的api文件"
                        });

                    }          
            },
            debug(){
                let flag = JSON.stringify(this.summary)=="{}" 
                if(flag){
                    this.$message({
                        type: "info",
                        message: "请先调试接口"
                        });
                        return
                }
                if(this.summary.error){
                    this.dialogHttprunnerLog = true
                }else{
                    this.dialogTableVisible = true;
                }

            },

        }
        
    }
</script>

<style scoped>
    .request {
        margin-top: 15px;
        border: 1px solid #ddd;
    }


</style>
