<template>

    <el-container>
        <el-header style="background: #fff; padding: 0; ">
            <div class="nav-api-header">
                <div style="padding-top: 10px; margin-left: 10px">
                    <el-button
                        type="primary"
                        size="small"
                        icon="el-icon-circle-plus"
                        @click="dialogVisible = true"
                    >
                        新建分组
                    </el-button>

                    <el-dialog
                        title="新建分组"
                        :visible.sync="dialogVisible"
                        width="30%"
                        align="center"
                    >
                        <el-form
                            :model="nodeForm"
                            :rules="rules"
                            ref="nodeForm"
                            label-width="100px"
                            class="project">
                            <el-form-item label="节点名称" prop="name">
                                <el-input v-model="nodeForm.name"></el-input>
                            </el-form-item>
                        </el-form>

                        <el-radio-group v-model="radio" size="small">
                            <el-radio-button label="根节点"></el-radio-button>
                            <el-radio-button label="子节点"></el-radio-button>
                        </el-radio-group>

                        <span slot="footer" class="dialog-footer">
                        <el-button @click="dialogVisible = false">取 消</el-button>
                        <el-button type="primary" @click="handleConfirm('nodeForm')">确 定</el-button>
                      </span>
                    </el-dialog>

                    <el-button
                        :disabled="currentNode === '' || !isSuperuser"
                        :title="isSuperuser ? '删除所选分组' : '删除分组权限不足' "
                        type="danger"
                        size="small"
                        icon="el-icon-delete"
                        @click="deleteNode"
                    >删除分组
                    </el-button>


                    <el-button
                        :disabled="currentNode === '' "
                        type="info"
                        size="small"
                        icon="el-icon-edit-outline"
                        @click="renameNode"
                    >重命名
                    </el-button>


                    <el-button
                        :disabled="currentNode === '' "
                        type="primary"
                        size="small"
                        icon="el-icon-circle-plus-outline"
                        @click="initResponse = true"
                    >添加接口
                    </el-button>
                    &nbspHosts:
                    <el-select
                        placeholder="请选择"
                        size="small"
                        style=“width:100%”
                        tyle="margin-left: -6px"
                        v-model="currentHost"
                    >
                        <el-option
                            v-for="item in hostOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.name">
                        </el-option>
                    </el-select>
                    &nbsp配置:
                    <el-select
                        placeholder="请选择"
                        size="small"
                        tyle="margin-left: -6px"
                        v-model="currentConfig"
                    >
                        <el-option
                            v-for="item in configOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.name">
                        </el-option>
                    </el-select>



                    <el-button
                        v-if="!addAPIFlag"
                        style="margin-left: 20px"
                        type="primary"
                        size="mini"
                        @click="run = !run"
                    >批量运行</el-button>

                    <el-button
                        v-if="!addAPIFlag"
                        :disabled="!(!addAPIFlag && onlyMe && isSelectAPI)"
                        style="margin-left: 20px"
                        type="success"
                        size="mini"
                        @click="move = !move"
                        :title="'移动API到指定分组'"
                    >移动API</el-button>


                    <el-button
                        v-if="isSuperuser"
                        type="danger"
                        icon="el-icon-delete"
                        circle
                        size="mini"
                        :title="isSuperuser === true ? '批量删除所选API' : '批量删除API权限不足'"
                        :disabled="!isSuperuser"
                        @click="del = !del"
                    ></el-button>


                    <el-switch
                        style="margin-left: 20px"
                        v-model="onlyMe"
                        v-if="!addAPIFlag"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                        active-text="只看自己">
                    </el-switch>

                    <el-button
                        :disabled="!addAPIFlag"
                        type="text"
                        style="position: absolute; right: 30px;"
                        @click="handleBackList"
                    >返回列表
                    </el-button>

                </div>
            </div>
        </el-header>

        <el-container>
            <el-aside style="width:260px;margin-top: 10px;">
                <div class="nav-api-side">
                    <div class="api-tree">
                        <el-input
                            placeholder="输入关键字进行过滤"
                            v-model="filterText"
                            size="medium"
                            clearable
                            prefix-icon="el-icon-search"
                        >
                        </el-input>
                        <el-tree
                            @node-click="handleNodeClick"
                            :data="dataTree"
                            node-key="id"
                            :default-expand-all="false"
                            :expand-on-click-node="false"
                            draggable
                            highlight-current
                            :filter-node-method="filterNode"
                            ref="tree2"
                            @node-drag-end="handleDragEnd"
                        >
                            <span class="custom-tree-node"
                                  slot-scope="{ node, data }"
                            >
                                <span><i class="iconfont" v-html="expand"></i>&nbsp;&nbsp;{{ node.label }}</span>
                            </span>
                        </el-tree>
                    </div>

                </div>

            </el-aside>

            <el-main style="padding: 0;">
                <api-body
                    v-show="addAPIFlag"
                    :nodeId="currentNode.id"
                    :project="$route.params.id"
                    :response="response"
                    v-on:addSuccess="handleAddSuccess"
                    :config="currentConfig"
                    :host="currentHost"
                >
                </api-body>
                <api-list
                    v-show="!addAPIFlag"
                    v-on:api="handleAPI"
                    :pNode="currentNode !== '' ? currentNode.id : '' "
                    :project="$route.params.id"
                    :config="currentConfig"
                    :host="currentHost"
                    :del="del"
                    :back="back"
                    :run="run"
                    :move="move"
                    :listCurrentPage.sync="listCurrentPage"
                    :visibleTag.sync="visibleTag"
                    :rigEnv.sync="rigEnv"
                    :only-me.sync="onlyMe"
                    :isSelectAPI.sync="isSelectAPI"
                    @click-pager="handleChangePage"
                >
                </api-list>

            </el-main>
        </el-container>
    </el-container>

</template>

<script>
    import ApiBody from './components/ApiBody'
    import ApiList from './components/ApiList'

    export default {
        watch: {
            filterText(val) {
                this.$refs.tree2.filter(val);
            }
        },
        components: {
            // 子组件
            ApiBody,
            ApiList
        },

        computed: {
            initResponse: {
                get() {
                    return this.addAPIFlag;
                },
                set(value) {
                    this.addAPIFlag = value;
                    this.response = {
                        id: '',
                        body: {
                            name: '',
                            times: 1,
                            url: '',
                            method: 'POST',
                            header: [{
                                key: "",
                                value: "",
                                desc: ""
                            }],
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
                            validate: [{
                                expect: "",
                                actual: "",
                                comparator: "equals",
                                type: 1
                            }],
                            variables: [{
                                key: "",
                                value: "",
                                desc: "",
                                type: 1
                            }],
                            extract: [{
                                key: "",
                                value: "",
                                desc: ""
                            }],
                            hooks: [{
                                setup: "",
                                teardown: ""
                            }]
                        }
                    };
                }
            },
        },
        data() {
            return {
                isSuperuser: this.$store.state.is_superuser,
                configOptions: [],
                hostOptions: [],
                // currentConfig: '请选择',
                currentConfig: '',
                currentHost: '请选择',
                back: false,
                del: false,
                run: false,
                move: false,
                response: '',
                nodeForm: {
                    name: '',
                },
                rules: {
                    name: [
                        {required: true, message: '请输入节点名称', trigger: 'blur'},
                        {min: 1, max: 50, message: '最多不超过50个字符', trigger: 'blur'}
                    ]
                },
                radio: '根节点',
                addAPIFlag: false,
                treeId: '',
                maxId: '',
                dialogVisible: false,
                currentNode: '',
                data: '',
                filterText: '',
                expand: '&#xe65f;',
                dataTree: [],
                listCurrentPage: 1,
                visibleTag: '',
                rigEnv: '',
                onlyMe: true,
                isSelectAPI: false
            }
        },
        methods: {

            handleDragEnd() {
                this.updateTree(false);
            },
            handleAddSuccess() {
                this.rigEnv = '';
                this.visibleTag = '';
                this.back = !this.back;
                this.addAPIFlag = false;
            },

            handleAPI(response) {
                this.addAPIFlag = true;
                this.response = response;
            },

            handleChangePage(val) {
                this.listCurrentPage = val;
            },

            getTree() {
                this.$api.getTree(this.$route.params.id, {params: {type: 1}}).then(resp => {
                    this.dataTree = resp['tree'];
                    this.treeId = resp['id'];
                    this.maxId = resp['max'];
                })
            },
            getConfig() {
                this.$api.getAllConfig(this.$route.params.id).then(resp => {
                    this.configOptions = resp;
                    this.configOptions.unshift({
                        name: '请选择'
                    });
                    const _config = this.configOptions.filter(item=> item.is_default === true);
                    if(_config.length) {
                        this.currentConfig = _config[0].name
                    } else {
                        this.currentConfig = '请选择'
                    }
                });

            },

            getHost() {
                this.$api.getAllHost(this.$route.params.id).then(resp => {
                    this.hostOptions = resp;
                    this.hostOptions.push({
                        name: '请选择'
                    })
                })
            },

            updateTree(mode) {
                this.$api.updateTree(this.treeId, {
                    body: this.dataTree,
                    node: this.currentNode.id,
                    mode: mode,
                    type: 1
                }).then(resp => {
                    if (resp['success']) {
                        this.dataTree = resp['tree'];
                        this.maxId = resp['max'];
                    } else {
                        this.$message.error(resp['msg']);
                    }
                })
            },

            deleteNode() {
                this.$confirm('此操作将永久删除该节点下所有接口, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    if (this.currentNode === '') {
                        this.$message.info('请选择一个节点');
                    } else {
                        if (this.currentNode.children.length !== 0) {
                            this.$message.warning('此节点有子节点，不可删除！');
                        } else {
                            this.remove(this.currentNode, this.data);
                            this.updateTree(true);
                        }
                    }

                })
            },

            renameNode() {
                this.$prompt('请输入节点名', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /\S/,
                    inputErrorMessage: '节点名称不能为空'
                }).then(({value}) => {
                    const parent = this.data.parent;
                    const children = parent.data.children || parent.data;
                    const index = children.findIndex(d => d.id === this.currentNode.id);
                    children[index]["label"] = value
                    this.updateTree(false);
                });
            },


            handleConfirm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.append(this.currentNode);
                        this.updateTree(false);
                        this.dialogVisible = false;
                    }
                });
            },

            handleNodeClick(node, data) {
                // 点击分分组之前,先把页码设置为1.2019年7月2日,并且传给子组件.
                this.listCurrentPage = 1;
                this.visibleTag = '';
                this.addAPIFlag = false;
                this.currentNode = node;
                this.data = data;
                this.rigEnv = '';
            },

            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },

            remove(data, node) {
                const parent = node.parent;
                const children = parent.data.children || parent.data;
                const index = children.findIndex(d => d.id === data.id);
                children.splice(index, 1);
            },

            append(data) {
                const newChild = {id: ++this.maxId, label: this.nodeForm.name, children: []};
                if (data === '' || this.dataTree.length === 0 || this.radio === '根节点') {
                    this.dataTree.push(newChild);
                    return
                }
                if (!data.children) {
                    this.$set(data, 'children', []);
                }
                data.children.push(newChild);
            },

            handleBackList(){
              this.addAPIFlag = false
            },

        },
        name: "RecordApi",
        mounted() {
            this.getTree();
            this.getConfig();
            this.getHost();
        }
    }
</script>

<style scoped>


</style>
