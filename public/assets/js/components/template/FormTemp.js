const template=`
<div class="form-body">
    <el-steps v-if="steps" :active="activeStep" finish-status="success" simple style="margin-bottom: 10px">
        <el-step :title="stepTitle" v-for="stepTitle in steps"></el-step>
    </el-steps>
    <el-tabs v-if="tabs" v-model="activeTab" @tab-change="tabChange">
        <el-tab-pane v-for="(tab,index) in tabs" :label="tab" :name="index"></el-tab-pane>
    </el-tabs>
    <el-form :require-asterisk-position="requireAsteriskPosition" ref="formRef" :model="form_.data" :label-position="documentWidth<=600?'top':labelPosition" :label-width="labelWidth"  :rules="form_.rules">
        <slot :rows="form_.data" :step="activeStep"></slot>
        <template v-for="(column,key) in form_.columns">
            <template v-if="column.edit && column.edit.form=='slot'">
                 <div :class="((steps && column.step!=activeStep) || (tabs && column.tab!=activeTab) || column.visible===false || (column.visible!==undefined && typeof column.visible=='function' && !column.visible(form_.data)) || (column.edit.form=='input' && column.edit.type=='hidden'))?'hide':''">
                    <slot :name="column.field" :rows="form_.data" :value="column.edit.value" :step="activeStep"></slot>
                 </div>
            </template>
            <template v-if="column.isTitle">
                <div style="font-size: 14px;font-weight: bold;border-bottom: 1px solid #eae9e9;padding-bottom: 10px;margin-bottom: 10px;">{{column.title}}</div>
            </template>
            <template v-if="column.edit && column.edit.form!='slot'">
            <el-form-item :prop="column.field" :label="column.title+':'" :error="column.edit.error" :class="((steps && column.step!=activeStep) || (tabs && column.tab!=activeTab) || column.visible===false || (column.visible!==undefined && typeof column.visible=='function' && !column.visible(form_.data)) || (column.edit.form=='input' && column.edit.type=='hidden'))?'hide':''">        
                 <el-row style="width:100%">
                    <el-col :span="24-appendWidth">
                        <Wangeditor v-if="column.edit.form=='editor'" :field="column.field" @change="changeEditor" :value="form_.data[column.field]" :width="column.edit.width" :height="column.edit.height"></Wangeditor>
                        <el-input @blur="column.edit.blur(form_.data[column.field],form_.data)" :disabled="column.edit.readonly" v-model="form_.data[column.field]" v-if="column.edit.form=='input'" :type="column.edit.type" :rows="(column.edit.type=='textarea')?column.edit.rows:0" :placeholder="column.edit.placeholder">
                            <template #prepend v-if="column.edit.prepend">{{column.edit.prepend}}</template>
                            <template #append v-if="column.edit.append">{{column.edit.append}}</template>
                            <template #append v-if="column.edit.button">
                                <div :class="['input-btn',column.edit.button.type?column.edit.button.type:'primary']" @click="column.edit.button.method(form_.data[column.field],form_.data)">{{column.edit.button.text}}</div>
                            </template>
                        </el-input>
                        <el-select @change="column.edit.change(form_.data[column.field],form_.data)" :placeholder="column.edit.placeholder" v-model="form_.data[column.field]" :disabled="column.edit.disabled?true:false" :multiple="column.edit.multiple?true:false" :clearable="column.edit.clearable?true:false" v-if="column.edit.form=='select'" style="width: 100%">
                            <template #header v-if="column.edit.multiple">
                                  <el-checkbox
                                    v-model="column.edit.checkAll"
                                    :indeterminate="false"
                                    @change="handleSelectCheckAll(column)">
                                    ${__('全选')}
                                  </el-checkbox>
                            </template>
                            <el-option
                                v-for="(value,key) in column.searchList"
                                :key="key.toString()"
                                :label="value"
                                :value="key.toString()">                            
                            </el-option>
                        </el-select>
                        <el-checkbox-group @change="column.edit.change(form_.data[column.field],form_.data)" v-model="form_.data[column.field]" v-if="column.edit.form=='checkbox'" style="width: 100%;">
                            <el-checkbox
                                v-for="(value,key) in column.searchList"
                                :label="key">
                                {{value}}
                            </el-checkbox>
                        </el-checkbox-group>
                        <el-radio-group @change="column.edit.change(form_.data[column.field],form_.data)" v-model="form_.data[column.field]" v-if="column.edit.form=='radio'" style="width: 100%;">
                            <template v-if="isYesOrNo(column.searchList)">
                                <el-radio label="1">${__('是')}</el-radio>
                                <el-radio label="0">${__('否')}</el-radio>
                            </template>
                            <template v-else>
                                <el-radio
                                    v-for="(value,key) in column.searchList"
                                    :label="key">
                                    {{value}}
                                </el-radio>
                            </template>
                        </el-radio-group>
                        <el-switch @change="column.edit.change(form_.data[column.field],form_.data)" v-model="form_.data[column.field]" :active-value="column.edit.activeValue" :inactive-value="column.edit.inactiveValue" v-if="column.edit.form=='switch'"></el-switch>
                        <el-date-picker
                            range-separator="到"
                            v-model="form_.data[column.field]"
                            @change="column.edit.change(form_.data[column.field],form_.data)"
                            v-if="column.edit.form=='date-picker'"
                            :type="column.edit.type"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            :placeholder="column.edit.placeholder"
                            :shortcuts="column.edit.shortcuts"
                            :format="column.edit.format"
                            style="width: 100%;">
                        </el-date-picker>
                        <el-time-picker 
                            v-if="column.edit.form=='time-picker'"
                            @change="column.edit.change(form_.data[column.field],form_.data)"
                            range-separator="到"
                            :is-range="column.edit.isRange"
                            :placeholder="column.edit.placeholder"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            :editable="false"
                            :format="column.edit.format"
                            :arrow-control="true"
                            v-model="form_.data[column.field]"
                            style="width:100%">           
                        </el-time-picker>
                        <el-cascader
                            @change="column.edit.change(form_.data[column.field],form_.data)"
                            v-if="column.edit.form=='cascader'"
                            v-model="form_.data[column.field]"
                            :props="column.edit.props"
                            :placeholder="column.edit.placeholder"
                            :options="column.edit.options"
                            :clearable="true"
                            style="width: 100%">
                        </el-cascader>
                        <el-upload
                            v-if="column.edit.form=='files'"
                            v-model:file-list="form_.data[column.field]"
                            :multiple="column.edit.multiple?true:false"
                            :accept="column.edit.accept?column.edit.accept:'image/*'"
                            :limit="column.edit.limit?column.edit.limit:1"
                            action="${Yunqi.config.baseUrl}${Yunqi.config.upload.uploadurl}"
                            :data="{disks:column.edit.disks?column.edit.disks:'',category:''}"
                            :headers="{'x-requested-with': 'XMLHttpRequest'}"
                            list-type="picture-card"          
                            :on-success="fileUploadSuccess"
                            :before-upload="fileUploadBefore"
                            :class="(form_.data[column.field].length>=column.edit.limit)?'disabled':''" 
                            :on-preview="handlePictureCardPreview">
                            <i class="fa fa-plus"></i> 
                        </el-upload> 
                        <Attachment @change="changeAttachment" :field="column.field" :value="form_.data[column.field]" :limit="column.edit.limit" v-if="column.edit.form=='attachment'"></Attachment>
                        <template v-if="column.edit.form=='selectpage'">
                            <select-page
                                @change="changeSelectpage" 
                                :url="column.edit.url"
                                :label-field="column.edit.labelField"
                                :key-field="column.edit.keyField"
                                :field="column.field"
                                :placeholder="column.edit.placeholder"
                                :page-size="column.edit.pageSize"
                                :value="form_.data[column.field]"
                                :disabled="column.edit.disabled?true:false"
                                :multiple="column.edit.multiple">
                            </select-page>
                        </template>
                        <template v-if="column.edit.form=='fieldlist'">
                            <Fieldlist :label="column.edit.label" :keys="column.edit.keys" :value="form_.data[column.field]" @change="changeFieldlist" :field="column.field"></Fieldlist>
                        </template>
                    </el-col>
                    <el-col v-if="appendWidth>0 && appendWidth<13" :span="appendWidth">
                        <slot name="append" :column="column"></slot>
                    </el-col>
                </el-row>
             </el-form-item>
            </template> 
        </template>
        <div :class="isLayer?'form-footer-layer':'form-footer'">
            <slot name="footer" :step="activeStep">
            <el-button v-if="steps && activeStep>0" type="primary" @click="preStep"><i class="fa fa-angle-double-left"></i>&nbsp;上一步</el-button>
            <el-button v-if="steps && steps.length>activeStep+1" type="primary" @click="nextStep"><i class="fa fa-angle-double-right"></i>&nbsp;下一步</el-button>
            <el-button v-if="!steps || (steps && steps.length==activeStep+1)" type="primary" @click="submit"><i class="fa fa-check"></i>&nbsp;提交</el-button>
            <el-button type="info"  @click="reset"><i class="fa fa-reply"></i>&nbsp;重置</el-button>
            </slot>
        </div>
    </el-form>
</div>
`;
export default template;