import { LightningElement, wire } from 'lwc'; // 从 LWC 模块导入 LightningElement 和 wire 装饰器
import { getRecord, getFieldValue } from 'lightning/uiRecordApi'; // 从 UI Record API 导入 getRecord 和 getFieldValue 方法
import { refreshApex } from '@salesforce/apex';
import getProducts from '@salesforce/apex/ProductService.getProducts';
import initializeProducts from '@salesforce/apex/ProductService.initializeProducts';
import createProduct from '@salesforce/apex/ProductService.createProduct';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id'; // 导入当前登录用户的 Id
import NAME_FIELD from '@salesforce/schema/User.Name'; // 导入 User 对象的 Name 字段描述
const fields = [NAME_FIELD]; // 定义需要查询的字段数组
export default class Selector extends LightningElement { // 导出默认的 Selector 组件类并继承 LightningElement
  selectedProductId; // 定义选中的产品 Id 属性
  products = []; // 当前查询到的真实商品记录
  recommendedBikes = []; // 推荐商品列表
  wiredProductsResult;
  isCreating = false; // 是否显示新建商品表单
  formData = {
    name: '',
    category: 'Mountain',
    level: 'Beginner',
    material: 'Aluminum',
    msrp: '',
    description: '',
    pictureUrl: ''
  }; // 新建商品表单数据

  @wire(getProducts)
  wiredProducts(result) {
    this.wiredProductsResult = result;
    const { data, error } = result;
    if (data) {
      this.products = data;
      this.recommendedBikes = data.slice(0, 3);
    }
    if (error) {
      this.products = [];
      this.recommendedBikes = [];
      console.error('Failed to load products', error);
    }
  }

  connectedCallback() {
    initializeProducts()
      .then(() => {
        if (this.wiredProductsResult) {
          refreshApex(this.wiredProductsResult);
        }
      })
      .catch((error) => {
        console.error('Product initialization failed', error);
      });
  }

  handleProductSelected(evt) { // 处理产品选择事件的方法
    this.selectedProductId = evt.detail; // 将事件传递的详情设置为选中的产品 Id
  }
  handleClearSelection(event) { // 点击空白处恢复初始状态
    const path = event.composedPath ? event.composedPath() : [event.target];
    const interactiveTags = new Set(['C-TILE', 'C-DETAIL', 'A', 'BUTTON', 'IMG', 'LIGHTNING-BADGE', 'INPUT', 'TEXTAREA', 'SELECT']);
    const clickedInteractiveElement = path.some(
      (node) => node && node.tagName && interactiveTags.has(node.tagName.toUpperCase())
    );
    if (!clickedInteractiveElement) {
      this.selectedProductId = undefined;
    }
  }

  toggleCreateForm() {
    this.isCreating = !this.isCreating;
  }

  handleFormInputChange(event) {
    const field = event.target.dataset.field;
    this.formData[field] = event.target.value;
  }

  async handleSubmitProduct() {
    if (!this.validateForm()) {
      return;
    }
    try {
      await createProduct({
        name: this.formData.name,
        category: this.formData.category,
        level: this.formData.level,
        material: this.formData.material,
        msrp: parseFloat(this.formData.msrp),
        description: this.formData.description,
        pictureUrl: this.formData.pictureUrl
      });
      this.dispatchEvent(new ShowToastEvent({
        title: '成功',
        message: '新建商品成功',
        variant: 'success'
      }));
      this.resetForm();
      this.isCreating = false;
      if (this.wiredProductsResult) {
        await refreshApex(this.wiredProductsResult);
      }
    } catch (error) {
      this.dispatchEvent(new ShowToastEvent({
        title: '错误',
        message: '新建商品失败: ' + error.body.message,
        variant: 'error'
      }));
    }
  }

  validateForm() {
    if (!this.formData.name.trim()) {
      this.dispatchEvent(new ShowToastEvent({
        title: '验证失败',
        message: '请输入商品名称',
        variant: 'warning'
      }));
      return false;
    }
    if (!this.formData.msrp || parseFloat(this.formData.msrp) <= 0) {
      this.dispatchEvent(new ShowToastEvent({
        title: '验证失败',
        message: '请输入有效的价格',
        variant: 'warning'
      }));
      return false;
    }
    return true;
  }

  resetForm() {
    this.formData = {
      name: '',
      category: 'Mountain',
      level: 'Beginner',
      material: 'Aluminum',
      msrp: '',
      description: '',
      pictureUrl: ''
    };
  }
  userId = Id; // 将当前用户 Id 赋值给 userId 属性
  @wire(getRecord, { recordId: '$userId', fields }) // 使用 wire 装饰器获取当前用户记录
  user; // 保存查询到的用户记录对象
  get name() { // 定义 name 计算属性
    return getFieldValue(this.user.data, NAME_FIELD); // 从用户记录中读取 Name 字段值并返回
  }
} 