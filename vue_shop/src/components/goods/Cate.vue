<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card class="box-card">
        <!-- 添加分类按钮 -->
        <el-row>
          <el-col :span="4">
            <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
          </el-col>
        </el-row>
        <!-- 商品分类区域 -->
        <tree-table class="treeTable" :data="cateList" :columns="columns" 
                    :selection-type="false" :expand-type="false"
                    show-index index-text="#"
                    border>
          <!-- 是否有效模板 -->
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: green;"></i>
            <i class="el-icon-error" v-else style="color: red;"></i>
          </template>
          <!-- 排序模板 -->
          <template slot="order" slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
          <!-- 操作模板 -->
          <template slot="option" slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showCateEditDialog(scope.row.cat_id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
          </template>
        </tree-table>
        <!-- 分页器 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <!-- 添加分类的对话框 -->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addCateForm" :rules="cateFormRules" ref="addCateFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- options用来指定数据源 -->
            <!-- props用来指定配置对象 -->
            <el-cascader v-model="selectedKeys" :options="parentCateList"
              :props="cascaderProps" @change="parentCateChanged" clearable
              change-on-select
              style="width: 100%">
            </el-cascader>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改分类的对话框 -->
      <el-dialog title="修改分类信息" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="editCateForm" :rules="cateFormRules" ref="editCateFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="editCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCateInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        // 默认获取三层分类列表
        type: 3,
        // 当前的页码值默认为第一页
        pagenum: 1,
        // 每页默认显示5条数据
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为tree-table指定列的定义
      columns: [
        {
          // label属性指定每列的标题
          label: '分类名称',
          // prop属性指定每列具体的值
          prop: 'cat_name'
        },
        {
          // label属性指定每列的标题
          label: '是否有效',
          // prop属性指定每列具体的值
          prop: 'cat_deleted',
          // 表示当前列使用作用域插槽中的模板
          type: 'template',
          // 模板名称
          template: 'isok'
        },
        {
          // label属性指定每列的标题
          label: '排序',
          // prop属性指定每列具体的值
          prop: 'cat_level',
          // 表示当前列使用作用域插槽中的模板
          type: 'template',
          // 模板名称
          template: 'order'
        },
        {
          // label属性指定每列的标题
          label: '操作',
          // 表示当前列使用作用域插槽中的模板
          type: 'template',
          // 模板名称
          template: 'option'
        }
      ],
      // 控制分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加和修改分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的id，默认设为0
        cat_pid: 0,
        // 分类的等级，默认要添加的是一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      cateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        // 选中的id值
        value: 'cat_id',
        // 看到的文本值
        label: 'cat_name',
        // 父子嵌套的属性
        children: 'children'
      },
      // 选中的父级分类的id数组，使用v-model双向绑定，注意必须是个数组
      selectedKeys: [],
      // 查询到的分类信息对象
      editCateForm: {},
      // 控制修改分类对话框的显示和隐藏
      editCateDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // console.log(res.data)
      // 把数据列表赋值给cateList
      this.cateList = res.data.result
      // console.log(this.cateList)
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 重新渲染数据
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      // 重新渲染数据
      this.getCateList()
    },
    // 点击添加分类按钮，显示对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if(res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      // console.log('父级分类列表：', res.data)
      this.parentCateList = res.data
    },
    // 当选择项变化时触发该函数
    parentCateChanged() {
      // console.log(this.selectedKeys)
      // 如果selectedKeys数组中的length大于0，则表明选中了父级分类
      // 否则，就说明没有选中任何父级分类
      if(this.selectedKeys.length > 0) {
        // 始终是数组的最后一项为添加的分类的父级id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 添加的分类的等级和数组的长度是一致的
        this.addCateForm.cat_level = this.selectedKeys.length
      }else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 分类等级
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确定按钮，添加新的分类
    async addCate() {
      // console.log(this.addCateForm) 
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return 
        // 验证通过，则可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if(res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        // 添加角色成功后隐藏对话框
        this.addCateDialogVisible = false
        // 添加用户后需要重新渲染角色列表
        this.getCateList()
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      // 清空表单
      this.$refs.addCateFormRef.resetFields()
      // 清空级联选择器
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示编辑分类信息的对话框
    async showCateEditDialog(id) {
      this.editCateDialogVisible = true
      // console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类信息失败！')
      }
      this.editCateForm = res.data
    },
    // 监听修改分类信息对话框的关闭事件
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 修改分类信息并提交
    editCateInfo() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类信息失败！')
        }
        // 关闭对话框
        this.editCateDialogVisible = false
        // 刷新数据列表
        this.getCateList()
        // 提示修改成功
        this.$message.success('更新分类信息成功！')
      })
    },
    // 根据id删除对应的分类信息
    async removeCateById(id) {
      // 弹框询问用户是否删除数据
      // 返回值是一个Promise对象，可以使用async/await对象
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        // 确定按钮的文本
        confirmButtonText: '确定',
        // 取消按钮的文本
        cancelButtonText: '取消',
        // type指的是前面的小图标
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回值为字符串confirm
      // 如果用户取消了删除，则返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发起删除用户的请求
      const { data: res } = await this.$http.delete('categories/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      this.$message.success('删除分类成功！')
      // 重新渲染列表
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>
