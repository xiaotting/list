<template>
  <div>
    <div class="base-wrapper base-query-wrapper">
      <el-form :inline="true" :model="formData" ref="ruleForm" class="form" label-width="80px">
        <el-form-item
          :label="`${item.label}：`"
          :label-width="item.labelWidth"
          v-for="(item, index) in fileterData"
          :key="index"
        >
          <el-input
            v-if="item.type == 'Input'"
            v-model="formData[item.model]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            :clearable="typeof(item.clearable)==='undefined'?true:item.clearable"
          />

          <el-input
            v-else-if="item.type == 'Textarea'"
            type="textarea"
            v-model="formData[item.model]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            :clearable="typeof(item.clearable)==='undefined'?true:item.clearable"
          />
          <el-select
            v-else-if="item.type == 'Select'"
            v-model="formData[item.model]"
            filterable
            :placeholder="item.placeholder || `请选择${item.label}`"
            :clearable="typeof(item.clearable)==='undefined'?true:item.clearable"
          >
            <el-option
              v-for="(e, listIndex) in item.selectList"
              :key="listIndex"
              :label="e[item.props?item.props.label:'label']"
              :value="e[item.props?item.props.value:'value']"
            ></el-option>
          </el-select>
          <el-cascader
            v-else-if="item.type == 'Cascader'"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :props="item.props"
            :options="item.options"
            v-model="formData[item.model]"
            change-on-select
            :clearable="typeof(item.clearable)==='undefined'?true:item.clearable"
            filterable
          ></el-cascader>
          <template v-else-if="item.type == 'Time'">
            <el-col :span="11">
              <el-date-picker
                type="datetime"
                placeholder="选择开始日期"
                v-model="formData[item.model[0]]"
                style="width: 100%;"
                value-format="yyyy-MM-dd HH:mm:ss"
                :clearable="typeof(item.clearable)==='undefined'?true:item.clearable"
              ></el-date-picker>
            </el-col>
            <el-col class="line" :span="2">-</el-col>
            <el-col :span="11">
              <el-date-picker
                type="datetime"
                placeholder="选择结束日期"
                value-format="yyyy-MM-dd HH:mm:ss"
                v-model="formData[item.model[1]]"
                style="width: 100%;"
                :clearable="typeof(item.clearable)==='undefined'?true:item.clearable"
                :picker-options="{
                    disabledDate(time){
                            return time.getTime() <= new Date(formData[item.model[0]]).getTime()
                    }
                }"
              ></el-date-picker>
            </el-col>
          </template>
          <el-date-picker
            v-else-if="item.type == 'datePicker'"
            v-model="formData[item.model]"
            type="date"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :value-format="item.valueFormat || 'yyyy-MM-dd'"
            :clearable="typeof(item.clearable)==='undefined'?true:item.clearable"
          ></el-date-picker>
          <el-date-picker
            v-else-if="item.type == 'Daterange'"
            v-model="formData[item.model]"
            :value-format="item.valueFormat || 'yyyy-MM-dd HH:mm:ss'"
            :default-time="['00:00:00', '23:59:59']"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
          <el-date-picker
            v-else-if="item.type == 'dateYear'"
            v-model="formData[item.model]"
            type="year"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :picker-options="item['picker-options'] || {}"
            :value-format="item.valueFormat || 'yyyy'"
            :clearable="typeof(item.clearable)==='undefined'?true:item.clearable"
          ></el-date-picker>
        </el-form-item>
        <el-form-item :label="''">
          <el-button type="primary" @click="submitForm">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <slot name="formButton"></slot>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-wrapper">
      <div class="btn-wrapper">
        <slot name="button"></slot>
      </div>
      <div class="table-wrapper">
        <el-table
          v-loading="loading"
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          @selection-change = "handelSelect"
          style="margin: 10px 0 20px"
          border
        >
          <el-table-column v-if="tableList.type" :type="tableList.type"></el-table-column>
          <el-table-column
            v-for="(item, index) in tableList.cols"
            :key="index"
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
            :sortable="item.sortable"
            align="center"
            :fixed="item.fixed||false"
          >
            <template slot-scope="scope">
              <span v-if="item.format" v-html="item.format(scope.row[item.prop])"></span>
              <span v-else-if="item.formats" v-html="item.formats(scope.row)"></span>
              <component
                v-else-if="item.component"
                :is="item.component"
                :row="scope.row"
                :props-data="item.data"
              ></component>
              <span :class="item.class || ''" v-else>{{scope.row[item.prop]}}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="tableList.handle?tableList.handle.isShow:false"
            label="操作"
            align="center"
            fixed="right"
            :width="tableList&&( tableList.handle.width || '100px')"
          >
            <template slot-scope="scope">
              <slot name="handle" :row="scope.row"></slot>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="base-pagination-wrapper">
        <el-pagination
          style="display:flex; justifyContent: flex-end; margin-right: 10px;"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalNum"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import { formatData } from './ulits.js'

export default {
  name: 'filterItem',
  props: {
    fileterData: {
      type: Array,
      default() {
        return []
      }
    },
    tableList: {
      type: Object,
      default() {
        return {}
      }
    },
    getTableDataFn: {
      type: Function,
      default() {
        return new Promise(((resolve) => {
          resolve([])
        }))
      }
    },
    formData: {
      type: Object,
      default() {
        return {}
      }
    },
    refresh: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      form: {},
      tableData: [],
      totalNum: 0, // 总记录
      pageSize: 10, // 每页大小
      loading: false, // list数据加载
      currentPage: 1 // 当前页数
    }
  },
  watch: {
    refresh: {
      handler() {
        this.getList(0)
      },
      immediate: true
    }
    // fileterData: {
    //   handler() {
    //     this.resetForm()
    //   },
    //   immediate: true,
    //   deep: true
    // }
  },
  methods: {
    /*  ,获取table数据 */
    async getList(flag = 0) {
      const params = formatData(this.fileterData, this.formData)
      const data = await this.getTableDataFn(
        Object.assign({}, params, {
          page: this.currentPage,
          rows: this.pageSize
        }), flag
      )
      this.tableData = data.rows || []
      this.totalNum = data.total || 0
      this.$emit('change-list')
    },
    /*  提交表单 */
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.currentPage = 1
          this.getList(1)
        } else {
          return false
        }
      })
    },
    /*  重置表单 */
    resetForm() {
      this.$emit('update:formData', Object.assign({}, this.form))
    },
    /*  format Date对象 */
    formatDate(date) {
      return formatDate(date, 'yyyy-MM-dd hh:mm:sss')
    },
    formatDateline(date) {
      return formatDate(new Date(date), 'yyyy-MM-dd')
    },

    /* 分页  */
    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },
    /*处理多选*/
    handelSelect(selection){
        this.$emit('handelSelect',selection)
    }
  },
  created() {
    this.form = Object.assign({}, this.formData)
  }
}
</script>
<style lang="less" scoped>
.line {
  text-align: center;
}
</style>
