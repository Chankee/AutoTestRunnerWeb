<template>
  <div>


    <el-table
      :data="[summary]"
      size="medium"
      style="width: 100%"
      border
      stripe
      :header-cell-style="{textAlign:'center', background: '#F8F8FA'}"
      :cell-style="{textAlign:'center'}"
    >
      <el-table-column label="测试时间" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.time.start_at|timestampToTime}}</span>
        </template>
      </el-table-column>

      <el-table-column label="持续时间" width="100">
        <template slot-scope="scope">
          <span v-text="scope.row.time.duration.toFixed(3)+' 秒'"></span>
        </template>
      </el-table-column>

      <el-table-column label="Total" width="100">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.stat.teststeps.total }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Success" width="100">
        <template slot-scope="scope">
          <el-tag type="success">{{ scope.row.stat.teststeps.successes }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Failed" width="100">
        <template slot-scope="scope">
          <el-tag type="danger">{{ scope.row.stat.teststeps.failures }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Error" width="100">
        <template slot-scope="scope">
          <el-tag type="warning">{{ scope.row.stat.teststeps.errors }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Skipped" width="100">
        <template slot-scope="scope">
          <el-tag type="info">{{ scope.row.stat.teststeps.skipped }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Platform">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>HttpRunner: {{ scope.row.platform.httprunner_version }}</p>
            <p>Python: {{ scope.row.platform.python_version }}</p>
            <div slot="reference" class="name-wrapper">
              <el-tag size="medium">{{ scope.row.platform.platform }}</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <br />
    <br />

    <slot v-for="item in summary.details">
      <div>
        <span style="font-weight: bold; font-size: medium">{{item.name}}</span>
        <el-popover placement="top-start" width="400" trigger="hover">
          <pre class="code-block">{{item.in_out}}</pre>
          <el-button slot="reference" round type="text">parameters & output</el-button>
        </el-popover>
      </div>
      <el-table
        :data="item.records"
        style="width: 100%"
        border
        :header-cell-style="{textAlign:'center', background: '#F8F8FA'}"
        :cell-style="{textAlign:'center'}"
      >
        <el-table-column type="expand" fixed>
          <template slot-scope="props">
            <el-tabs>
              <el-tab-pane label="Request">
                <pre class="code-block" v-html="handleRequest(props.row.meta_data.request)"></pre>
              </el-tab-pane>
             <el-tab-pane label="Content" v-if="props.row.meta_data.response.body !== null">
                <pre
                  class="code-block"
                  v-text="handleContent(props.row.meta_data.response.body)"
                ></pre>
              </el-tab-pane>
              
              <el-tab-pane label="Response">
                <pre class="code-block" v-text="props.row.meta_data.response.body"></pre>
              </el-tab-pane>
              
              <el-tab-pane label="Validators" v-if="props.row.meta_data.validators.length !== null">
                <pre class="code-block" v-html="props.row.meta_data.validators"></pre>
              </el-tab-pane>


              
              <el-tab-pane label="Extract" v-if="props.row.meta_data.response.content !== null">
                <ResContent :data="props.row.meta_data.response.content"></ResContent>
              </el-tab-pane>

              <el-tab-pane label="HttprunnerRunLog" v-if="summary.msg !== ''">
                  <ul  style="overflow:auto">
                      <li v-for="(i) in summary.msg" style="color:green;font-size:20px;background:black">{{ i }}</li>
                      
                  </ul>
                <!-- <pre class="code-block" v-html="summary.msg"></pre> -->

              </el-tab-pane>
            </el-tabs>
          </template>
        </el-table-column>

        <el-table-column label="名 称">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="请求地址">
          <template slot-scope="scope">
            <span>{{ scope.row.meta_data.request.url }}</span>
          </template>
        </el-table-column>

        <el-table-column label="请求方法">
          <template slot-scope="scope">
            <span
              :class="scope.row.meta_data.request.method"
            >{{ scope.row.meta_data.request.method }}</span>
          </template>
        </el-table-column>

        <el-table-column label="响应时间 (ms)">
          <template slot-scope="scope">
            <span>{{ scope.row.response_time }}</span>
          </template>
        </el-table-column>

        <el-table-column label="测试结果">
          <template slot-scope="scope">
            <div :class="scope.row.status">{{ scope.row.status }}</div>
          </template>
        </el-table-column>

      </el-table>
    </slot>
  </div>
</template>

<script>
import ResContent from "./components/ResContent";

export default {
  name: "DebugReport",
  props: {
    summary: {
      require: true,
    },
  },
  components: {
    ResContent
  },
  methods: {
    handleRequest(request) {
      console.log(request['body'])
      const keys = ["start_timestamp"];

      keys.forEach(function (item) {
        delete request[item];
      });
      try {
        request["body"] = JSON.parse(request["body"]);
      } catch (e) {}

      return request;
    },

    handleContent(content) {
      try {
        content = JSON.parse(content);
      } catch (e) {}

      return content;
    },

    handleResponse_origin(response) {
      console.log(response)
      const keys = [
        "response_time_ms",
        "encoding",
        "ok",
        "reason",
        "url",
        "text",
        "json",
        "content_size",
        "content_type",
      ];

      keys.forEach(function (item) {
        delete response[item];
      });

      return response;
    },


  },
};
</script>

<style scoped>
</style>
