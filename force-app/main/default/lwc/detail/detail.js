import { LightningElement, api, wire } from 'lwc';
import getProductById from '@salesforce/apex/ProductService.getProductById';
import deleteProduct from '@salesforce/apex/ProductService.deleteProduct';
import updateProduct from '@salesforce/apex/ProductService.updateProduct';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class Detail extends LightningElement {
    _productId;
    productData;
    error;
    showConfirmModal = false;
    confirmAction = null; // 'delete' or 'edit'
    isEditing = false;
    editFormData = {};
    wiredProductResult;

    @api
    get productId() {
        return this._productId;
    }
    set productId(value) {
        this._productId = value;
        if (!value) {
            this.productData = undefined;
            this.error = undefined;
            this.isEditing = false;
        }
    }

    @wire(getProductById, { productId: '$_productId' })
    wiredProduct(result) {
        this.wiredProductResult = result;
        const { error, data } = result;
        if (data) {
            this.productData = data;
            this.error = undefined;
        } else if (error) {
            this.productData = undefined;
            this.error = error;
        } else {
            this.productData = undefined;
            this.error = undefined;
        }
    }

    get hasProduct() {
        return !!this.productData;
    }

    handleDetailClick(event) {
        event.stopPropagation();
    }

    handleDeleteClick() {
        this.confirmAction = 'delete';
        this.showConfirmModal = true;
    }

    handleEditClick() {
        this.editFormData = { ...this.productData };
        this.isEditing = true;
    }

    handleEditFormChange(event) {
        const field = event.target.dataset.field;
        this.editFormData[field] = event.target.value;
    }

    handleSaveEdit() {
        this.confirmAction = 'edit';
        this.showConfirmModal = true;
    }

    handleCancelEdit() {
        this.isEditing = false;
        this.editFormData = {};
    }

    handleConfirm() {
        if (this.confirmAction === 'delete') {
            this.performDelete();
        } else if (this.confirmAction === 'edit') {
            this.performUpdate();
        }
    }

    get isDeleteConfirm() {
        return this.confirmAction === 'delete';
    }

    get confirmTitle() {
        return this.isDeleteConfirm ? '确认删除' : '确认修改';
    }

    get confirmButtonLabel() {
        return this.isDeleteConfirm ? '删除' : '确认修改';
    }

    handleCancel() {
        this.showConfirmModal = false;
        this.confirmAction = null;
    }

    async performDelete() {
        try {
            await deleteProduct({ productId: this.productData.Id });
            this.dispatchEvent(new ShowToastEvent({
                title: '成功',
                message: '商品已删除',
                variant: 'success'
            }));
            this.productData = undefined;
            this.showConfirmModal = false;
            this.dispatchEvent(new CustomEvent('productdeleted', {
                detail: this.productData.Id
            }));
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: '错误',
                message: '删除商品失败: ' + error.body.message,
                variant: 'error'
            }));
        }
    }

    async performUpdate() {
        try {
            await updateProduct({
                productId: this.editFormData.Id,
                name: this.editFormData.Name,
                category: this.editFormData.Category__c,
                level: this.editFormData.Level__c,
                material: this.editFormData.Material__c,
                msrp: parseFloat(this.editFormData.MSRP__c),
                description: this.editFormData.Description__c,
                pictureUrl: this.editFormData.Picture_URL__c
            });
            this.dispatchEvent(new ShowToastEvent({
                title: '成功',
                message: '商品已更新',
                variant: 'success'
            }));
            this.isEditing = false;
            this.showConfirmModal = false;
            if (this.wiredProductResult) {
                await refreshApex(this.wiredProductResult);
            }
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: '错误',
                message: '更新商品失败: ' + error.body.message,
                variant: 'error'
            }));
        }
    }
}