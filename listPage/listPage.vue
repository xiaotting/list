<template>
  <!-- 表单-表格页 -->
  <div>
    <div class="base-wrapper base-query-wrapper">
      <el-form ref="ruleForm" class="form" inline :model="formModel" :rules="formRules">
        <el-form-item
          v-for="(item,index) in formItems"
          :key="index"
          :prop="item.prop"
          :label="item.label"
        >
          <component
            :is="item.name"
            v-bind="item.props"
            v-model="formModel[item.prop]"
            v-on="item.ons"
          >
            <span v-if="item.text" v-html="item.text"></span>
            <template v-else>
              <template v-if="item.childs">
                <component
                  v-for="(childItem,childIndex) in item.childs"
                  :key="childIndex+'childs'"
                  :is="childItem.name"
                  v-bind="childItem.props"
                >
                  <span v-if="childItem.text" v-html="childItem.text"></span>
                </component>
              </template>
              <template v-if="item.childConfig">
                <component
                  v-for="(childItem,childIndex) in parseChild(item.childConfig)"
                  :key="childIndex+'childConfig'"
                  :is="childItem.name"
                  v-bind="childItem.props"
                >
                  <span v-if="childItem.text" v-html="childItem.text"></span>
                </component>
              </template>
            </template>
          </component>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList(true)">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <slot name="formButton"></slot>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-wrapper">
      <div class="btn-wrapper">
        <slot></slot>
      </div>
      <div class="table-wrapper">
        <el-table
          v-loading="loading"
          v-on="tableConfig.ons"
          v-bind="tableConfig.props"
          ref="multipleTable"
          :data="tableData"
        >
          <template v-for="(column,index) in tableConfig.columns">
            <el-table-column
              v-if="column.format||column.formats||column.component||column.props.prop==='columnHandle'"
              :key="index"
              v-bind="column.props"
            >
              <template slot-scope="scope">
                <span v-if="column.format" v-html="column.format(scope.row[column.props.prop])"></span>
                <span v-else-if="column.formats" v-html="column.formats(scope.row)"></span>
                <component
                  v-else-if="column.component"
                  :is="column.component"
                  :row="scope.row"
                  :props-data="column.otherData"
                ></component>
                <template v-else-if="column.props.prop==='columnHandle'">
                  <slot name="handle" :row="scope.row"></slot>
                </template>
              </template>
            </el-table-column>
            <el-table-column v-else :key="index" v-bind="column.props"></el-table-column>
          </template>
        </el-table>
      </div>
      <div class="base-pagination-wrapper">
        <el-pagination
          style="display:flex; justifyContent: flex-end; margin-right: 10px;"
          @size-change="handleRowsChange"
          @current-change="handlePageChange"
          :current-page.sync="pagination.page"
          :page-size.sync="pagination.rows"
          :page-sizes="[10, 20, 30,50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'listPage',
  props: {
    // 获取表格数据的方法
    getTableDataFn: {
      type: Function,
      default() {
        return function() {}
      }
    },
    // 表单的数据对象
    formModel: {
      type: Object,
      default() {
        return {}
      }
    },
    // 表单的校验规则
    formRules: {
      type: Object,
      default() {
        return {}
      }
    },
    // 表单选项
    formItems: {
      type: Array,
      default() {
        return []
      }
      /**
     * {
          label: '单选框组',  // 标签文本
          prop: 'radios',  // 表单域 model 字段
          name: 'el-radio-group', // 组件名
          text: 'a', // 文本 与 子组件 互斥
          childConfig: {  // 子组件配置 用于重复（循环）组件
            name: 'el-radio', // 组件名
            list: [{ value: 'a', label: '1' }, { value: 'b', label: '2' }], // 数据
            publicProp: {  // 每个选项都一样的配置
              border: true
            },
            individualityProps: [{ disabled: true }, { disabled: false }], // 每个选项值不一样的配置
            correspondingDataOptions: { // 组件属性 与 数据字段 对应关系
              label: 'label',y
              text: 'value'
            }
          },
          childs: [ // 子组件
            {
              name: 'el-radio',
              props: {
                label: '11'
              },
              text: 'a'
            }
          ]
        }
     * 
    */
    },
    // 表格的配置
    tableConfig: {
      type: Object,
      default() {
        return {
          columns: []
        }
      }
    },
    // 触发数据更新
    refresh: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      tableData: [],
      loading: false,
      pagination: {
        page: 1,
        rows: 10,
        total: 0
      }
    }
  },
  watch: {
    refresh: {
      handler() {
        this.getList()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 解析子组件
     */
    parseChild(config) {
      return config.list.map((item, index) => {
        config.publicProp || (config.publicProp = {})
        config.individualityProps || (config.individualityProps = [])
        const { text, ...correspondingDataOptions } = config.correspondingDataOptions
        let props = {}

        Object.keys(correspondingDataOptions).forEach(options => {
          props[options] = item[options]
        })
        return {
          name: config.name,
          props: {
            ...config.publicProp,
            ...config.individualityProps[index],
            ...props
          },
          text: item[text]
        }
      })
    },
    /**
     * 格式化参数
     */
    formatData() {
      const formData = this.formModel || {}
      let formParams = {}
      this.formItems.forEach(item => {
        formParams[item.prop] = item.format ? item.format[formData[item.prop]] : formData[item.prop]
      })
      return Object.assign({}, formData, formParams)
    },
    /**
     * 获取table数据
     */
    async getList(isFirst) {
      isFirst && (this.pagination.page = 1)
      const params = Object.assign({}, this.formatData(), {
        page: this.pagination.page,
        rows: this.pagination.rows
      })
      this.loading = true
      this.$emit('change-list', params)
      let data = await this.getTableDataFn(params)
      this.loading = false
      this.tableData = data.rows || []
      this.pagination.total = data.total || 0
    },
    /*  提交表单 */
    submitForm() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.getList(true)
        } else {
          return false
        }
      })
    },
    /*  重置表单 */
    resetForm() {
      this.$refs.ruleForm.resetFields()
    },

    /* 分页  */
    handleRowsChange() {
      this.getList(true)
    },
    handlePageChange() {
      this.getList()
    }
  }
}
</script>
<style lang="less" scoped>
.line {
  text-align: center;
}
</style>

