<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card class="box-card">
        <!-- 提示区域 -->
        <el-alert title="添加商品信息" type="info" :closable="false" show-icon center>
        </el-alert>
        <!-- 步骤条区域 -->
        <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <!-- tab栏区域 -->
        <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-position="top" label-width="100px">
          <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <!-- 使用type="number"规定只能输入数值 -->
                <el-input v-model="addForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <!-- 选择商品分类的级联选择框 -->
                <el-cascader v-model="addForm.goods_cat" :options="cateList"
                  :props="cascaderProps" @change="handelChanged" clearable>
                </el-cascader>
              </el-form-item>
            </el-tab-pane>            
            <el-tab-pane label="商品参数" name="1">
              <!-- 渲染表单的Item项 -->
              <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                <!-- 复选框组 -->
                <el-checkbox-group v-model="item.attr_vals">
                 <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <!-- 渲染表单的Item项 -->
              <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <!-- action表示图片要上传到的后台API地址 -->
              <!-- list-type指的是upload组件渲染出来的UI效果 -->
              <el-upload 
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <!-- 富文本编辑器组件 -->
              <quill-editor v-model="addForm.goods_introduce"></quill-editor>
              <!-- 添加商品按钮 -->
              <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>
      <!-- 图片预览的对话框 -->
      <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
        <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条和tab标签栏的当前项索引
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
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
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 上传图片的请求地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览的图片路径
      previewPath: '',
      // 控制预览图片的对话框的显示与隐藏
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // console.log(res.data)
      // 把数据列表赋值给cateList
      this.cateList = res.data 
      // console.log(this.cateList)
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 当级联选择器选择项变化时触发该函数
    handelChanged() {
      // console.log(this.addForm.goods_cat)
      // 只允许选中三级分类，如果选中的是二级或一级分类，则清空级联选择器
      if(this.addForm.goods_cat.length !== 3) {
        // 始终是数组的最后一项为添加的分类的父级id
        this.addForm.goods_cat = []
      }
    },
    // 监听标签页离开的事件，用来阻止标签页的切换
    beforeTabLeave(activeName, oldActiveName) {
      // activeName是即将进入的标签页名称name
      // oldActiveName是即将离开的标签页名称name
      if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 监听标签页的点击事件
    async tabClicked() {
      // 访问的是商品动态参数面板
      if(this.activeIndex === '1') {
        // 根据所选分类的Id，和当前所处的面板，获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: { sel: 'many' }
        })
        if(res.meta.status !== 200) {
          return this.$message.error('获取商品参数列表失败！')
        }
        // 通过空格分割，把attr_vals转换为数组
        res.data.forEach(item => {
          // attr_vals如果为空字符串，返回的是false，执行冒号后面的条件判断
          // 空字符串不用split分割，直接赋值为空数组
          // attr_vals如果不为空字符串，则按空格进行分割
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
        // console.log(this.manyTableData)
      } else if(this.activeIndex === '2') {
        // 访问的是商品静态属性面板
        // 根据所选分类的Id，和当前所处的面板，获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: { sel: 'only' }
        })
        if(res.meta.status !== 200) {
          return this.$message.error('获取商品参数列表失败！')
        }
        this.onlyTableData = res.data
        // console.log(this.onlyTableData)
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      console.log(file)
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从pics数组中，找到这个图片对应的索引值
      // 形参x就是数组里的每一项，如果x的pic属性等于filePath的值的话，就返回这一项的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的splice得方法，把图片信息对象，从pics数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 监听事件上传成功的对象
    handleSuccess(response) {
      console.log(response)
      // 1. 拼接得到一个图片信息对象
      // 图片的临时存放路径
      const picInfo = { pic: response.data.tmp_path }
      // 2. 将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 添加商品
    async addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        // 验证通过，则可以发起添加商品的网络请求
        // 这样写会导致级联选择框的错误
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            // 静态属性的attr_vals属性并没有被转换为数组，本身就是字符串
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        // 将后来新修改的attrs的值重新赋值给form对象
        form.attrs = this.addForm.attrs
        // 发起请求添加商品
        const { data: res } = await this.$http.post('goods', form)
        console.log('form:', form)
        console.log('res:', res)
        if(res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')          
        }
        this.$message.success('添加商品成功！')
        // 添加完商品后重定向到商品列表页面
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 当前选中的三级分类的id
    cateId() {
      if(this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0!important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
