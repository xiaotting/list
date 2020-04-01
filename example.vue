
<template>
  <div>
    <list-page
      :fileter-data="fileterData"
      :table-list="tableList"
      :get-table-data-fn="getTableDataFn"
      :refresh="refresh"
      :form-data.sync="formData"
      @handelSelect="handelSelect"
      ref="listPage"
    >
      <div slot="handle" slot-scope="scope" class="handle">
        <el-button
          type="text"
          size="mini"
          @click="checkHandle(scope.row)"
          v-if="$Identify.showBtnNew('scsstore:punish:view')"
        >查看</el-button>
        <template v-if="tabPosition === '0'">
          <el-button
            size="mini"
            type="text"
            @click="editHandle(scope.row)"
            v-if="$Identify.showBtnNew('scsstore:punish:edit')"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            @click="endHandle(scope.row)"
            v-if="$Identify.showBtnNew('scsstore:punish:end')"
          >终止</el-button>
        </template>
      </div>
    </list-page>
  </div>
</template>

<script>
import listPage from "./listPage";
// import * as services from './services'
// import Reason from './component/PunishUndercarriag/reason'

// 公用方法
import { formatDate } from "@/utils/util.js";
import { formatData } from "@/components/common/listPage/ulits.js"; // 对表单数据
export default {
  name: "punishList",
  data() {
    return {
      fileterData: [
        {
          label: "店铺名称",
          type: "Input",
          model: "storeName",
          placeholder: "店铺名称（模糊搜索）"
        },
        {
          label: "商家名称",
          type: "Input",
          model: "companyName",
          placeholder: "商家名称（模糊搜索）"
        },
        {
          label: "商品名称",
          type: "Input",
          model: "goodsName",
          placeholder: "商品名称（模糊搜索）"
        },
        {
          label: "买手组",
          type: "Select",
          model: "buyerId",
          placeholder: "买手组（模糊搜索）",
          props: {
            value: "id",
            label: "name"
          },
          selectList: []
        },
        {
          label: "违规编号",
          type: "Input",
          model: "relateViolationCode",
          placeholder: "违规编号"
        },
        {
          label: "下架时间",
          type: "Time",
          model: ["unShelveStartTimeQuery", "unShelveEndTimeQuery"],
          defaultTime: "['00:00:00', '23:59:59']",
          placeholder: "请选择日期"
        },
        {
          label: "提交时间",
          type: "Time",
          model: ["startCreateTime", "endCreateTime"],
          defaultTime: "['00:00:00', '23:59:59']",
          placeholder: "请选择日期"
        }
      ],
      tableList: {
        cols: [
          {
            label: "商品信息",
            formats: row => {
              return `(${row.goodsId})【${row.goodsName}】`;
            }
          },
          {
            label: "店铺信息",
            width: "150",
            formats: row => {
              return `${row.storeCode || ""}<br/>${row.storeName || ""}`;
            }
          },
          {
            label: "商家信息",
            width: "150",
            formats: row => {
              return `${row.enterCode || ""}<br/>${row.companyName || ""}`;
            }
          },
          {
            prop: "buyerGroup",
            label: "买手组",
            width: "150"
          },
          {
            label: "下架时间",
            formats: row => {
              if (row.unShelveStatus === "0" || row.unShelveStatus === 0) {
                return `${formatDate(
                  new Date(row.unShelveStartTime),
                  "yyyy-MM-dd hh:mm:ss"
                )}~${formatDate(
                  new Date(row.unShelveEndTime),
                  "yyyy-MM-dd hh:mm:ss"
                )}`;
              } else {
                return `${formatDate(
                  new Date(row.unShelveStartTime),
                  "yyyy-MM-dd hh:mm:ss"
                )}~永久下架`;
              }
            },
            width: "150"
          },
          {
            prop: "relateViolationCode",
            label: "关联违规编号",
            width: "170",
            formats: row => {
              if (row.relateViolationCode && row.violationId) {
                return `<a style="color:#418fff" href="/scsstoreadminweb/violationManage/violationDetail?id=${row.violationId}&showtype=1" target="_blank">${row.relateViolationCode}</a>`;
              } else {
                return `${
                  row.relateViolationCode ? row.relateViolationCode : ""
                }`;
              }
            }
          },
          {
            prop: "unShelveReason",
            label: "下架原因",
            width: "170",
            component: Reason
          },
          {
            prop: "createTime",
            label: "提交时间",
            format: options => {
              return (
                options && formatDate(new Date(options), "yyyy-MM-dd hh:mm:ss")
              );
            }
          }
        ],
        handle: {
          isShow: true,
          width: "150px"
        },
        type: "selection"
      },
      tabPosition: "",
      //   批量编辑 终止
      form: {
        dialogVisible: false,
        unShelveStartTime: "",
        unShelveEndTime: "",
        time: "",
        title: "批量编辑"
      },
      pickerOptions: {},
      formData: {
        unShelveIng: 0
      },
      getTableDataFn: this.getList,
      refresh: true,
      flag: 0,
      selectIds: [], //批量选择的数据
      Rules: {
        unShelveEndTime: [{ required: true, message: "结束时间必选" }]
      }
    };
  },

  components: {
    listPage,
    Reason
  },
  watch: {
    tabPosition: {
      async handler(val) {
        this.formData.unShelveIng = val;
        const params = formatData(this.fileterData, this.formData);
        let data = await services.getUnshelveList(
          Object.assign({}, params, {
            unShelveIng: val,
            page: 1,
            rows: 10
          })
        );
        this.$refs["listPage"].currentPage = 1;
        this.$refs["listPage"].pageSize = 10;
        this.$refs["listPage"].tableData = data.rows || [];
        this.$refs["listPage"].totalNum = data.total || 0;
      },
      immediate: false
    }
  },
  computed: {},

  mounted() {},
  created() {
    this.$nextTick(() => {
      // 获取表单数据
      this.fileterData.forEach(this.findFormSelectList);
    });
  },
  methods: {
    async findFormSelectList(item, index) {
      switch (item.model) {
        case "buyerId":
          this.$set(item, "selectList", await services.findPopBuyer({}));
          break;
        default:
          break;
      }
    },
    /**
     * @method
     * @param {type} 参数名 参数说明
     * @return {type} 返回值
     * @desc 获取列表数据
     */
    getList(params, flag) {
      this.flag = this.flag || flag;
      return services.getUnshelveList({
        unShelveIng: this.tabPosition,
        ...params
      });
    },
    async updatedList() {
      var newParams = formatData(this.fileterData, this.formData);
      var newData = await services.getUnshelveList(
        Object.assign({}, newParams, {
          unShelveIng: this.tabPosition,
          page: 1,
          rows: 10
        })
      );
      this.$refs["listPage"].currentPage = 1;
      this.$refs["listPage"].pageSize = 10;
      this.$refs["listPage"].tableData = newData.rows || [];
      this.$refs["listPage"].totalNum = newData.total || 0;
    }
  }
};
</script>
<style lang='less' scoped>
</style>