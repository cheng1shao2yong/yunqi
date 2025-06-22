const columnTemp=`
<el-table-column
    v-if="column.field && column.visible && column.visible!='none'"                 
    :width="column.width?column.width:''" 
    :sortable="column.sortable?true:false"
    :fixed="column.fixed"
    :align="column.align?column.align:'center'"
    :type="column.type"
    :prop="column.field">
    <template #header>
        <slot name="header" :field="column.field">
            <div style="white-space: nowrap;text-align: center;width: 100%;">{{column.title}}</div>
        </slot>
    </template>
    <template #default="scope" v-if="column.field!='operate'">
        <div :style="column.width?'width:'+column.width+'px':'width:100%;white-space: nowrap;'">
            <template v-if="scope.row._formatter[column.field]._name=='slot'">
                <slot name="formatter" :rows="scope.row" :field="column.field" :searchList="column.searchList"></slot>
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='text'">
                {{scope.row._formatter[column.field].value}}
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='html'">
                <div style="width: 100%;text-align: left;" v-html="scope.row._formatter[column.field].value"></div>
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='switch' && (scope.row._formatter[column.field].value==scope.row._formatter[column.field].activeValue || scope.row._formatter[column.field].value==scope.row._formatter[column.field].inactiveValue)">
               <el-switch :size="pageFont" :disabled="scope.row._formatter[column.field].disabled?true:!auth.multi?true:false" @change="changeSwitch(scope.row,column.field)" :active-value="scope.row._formatter[column.field].activeValue" :inactive-value="scope.row._formatter[column.field].inactiveValue" v-model="scope.row._formatter[column.field].value"></el-switch>
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='select'">
               <el-select :size="pageFont" :disabled="scope.row._formatter[column.field].disabled?true:!auth.multi?true:false" @change="changeSelect(scope.row,column.field)" v-model="scope.row._formatter[column.field].value" style="width: 100%">
                    <el-option
                            v-for="(value,key) in column.searchList"
                            :key="key"
                            :label="value"
                            :value="key">                                
                    </el-option>
                </el-select>
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='image'">
                <el-image
                        v-if="scope.row._formatter[column.field].value"
                        :src="scope.row._formatter[column.field].value"
                        :style="(pageFont=='large')?'width:80px;height:80px;cursor:pointer;':(pageFont=='small')?'width:30px;height:30px;cursor:pointer;':'width:50px;height:50px;cursor:pointer;'"
                        :zoom-rate="1.2"
                        @click="previewImg(scope.row._formatter[column.field].value)"
                        fit="contain">
                </el-image>
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='images'">
                <el-image
                        v-for="img in scope.row._formatter[column.field].value"
                        :src="img"
                         :style="(pageFont=='large')?'width:80px;height:80px;cursor:pointer;':(pageFont=='small')?'width:30px;height:30px;cursor:pointer;':'width:50px;height:50px;cursor:pointer;'"
                        :zoom-rate="1.2"
                        @click="previewImg(scope.row._formatter[column.field].value)"
                        fit="contain">
                </el-image>
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='link'">
                <el-input class="link-input" v-model="scope.row._formatter[column.field].value">
                <template #append>
                    <a target="_blank" style="cursor: pointer;" @click="clickLink(scope.row._formatter[column.field].value,scope.row._formatter[column.field].trigger)"><i class="fa fa-link"></i></a>
                </template>
                </el-input>
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='date'">
                {{scope.row._formatter[column.field].value}}
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='datetime'">
                {{scope.row._formatter[column.field].value}}
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='tags'">
                <div :class="'tag-box tag-box-'+column.align">
                <template v-for="tag in scope.row._formatter[column.field].value">
                    <el-tag 
                        :size="pageFont"
                        :type="scope.row._formatter[column.field].type"
                        :effect="scope.row._formatter[column.field].effect"
                        :color="scope.row._formatter[column.field].color"
                        :round="scope.row._formatter[column.field].round"
                        @click="scope.row._formatter[column.field].click"
                        @close="scope.row._formatter[column.field].close"
                        :closable="scope.row._formatter[column.field].closable">
                       {{__(tag)}}
                    </el-tag>       
                </template>   
                </div>  
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='tag' && scope.row._formatter[column.field].value">
                <el-tag 
                    :size="pageFont"
                    :type="scope.row._formatter[column.field].type"
                    :effect="scope.row._formatter[column.field].effect"
                    :color="scope.row._formatter[column.field].color"
                    :round="scope.row._formatter[column.field].round"
                    @click="scope.row._formatter[column.field].click"
                    @close="scope.row._formatter[column.field].close"
                    :closable="scope.row._formatter[column.field].closable">
                   {{__(scope.row._formatter[column.field].value)}}
                </el-tag>  
            </template>
            <template v-if="scope.row._formatter[column.field]._name=='button'">
                <el-button size="small" :class="['el-button-icon',pageFont]" :type="scope.row._formatter[column.field].type" @click="scope.row._formatter[column.field].click(scope.row)">{{scope.row._formatter[column.field].title}}</el-button>  
            </template>
        </div>                        
    </template>
    <template #default="scope" v-if="column.field=='operate' && column.action">
         <div :class="['operate-box-'+column.direction,'operate-align-'+column.align]">
             <template v-for="(rx,action) in column.action" :key="action"> 
                    <el-tooltip
                            v-if="((typeof rx=='boolean' && rx) || (typeof rx=='function' && rx(scope.row))) && action=='edit' && auth.edit"
                            effect="dark"
                            :hide-after="0"
                            content="${__('编辑')}"
                            placement="top">
                        <el-button @click="edit(scope.row)" type="primary" size="small" :class="['el-button-icon',pageFont]"><i class="fa fa-pencil"></i></el-button>
                    </el-tooltip>
                    <el-tooltip
                            v-if="((typeof rx=='boolean' && rx) || (typeof rx=='function' && rx(scope.row))) && action=='sort' && auth.multi"
                            effect="dark"
                            :hide-after="0"
                            content="${__('排序')}"
                            placement="top">
                            <el-button type="warning" size="small" :class="['el-button-icon','sortableButton',pageFont]"><i class="fa fa-arrows"></i></el-button>
                    </el-tooltip>
                    <el-tooltip
                            v-if="((typeof rx=='boolean' && rx) || (typeof rx=='function' && rx(scope.row))) && action=='del' && auth.del"
                            effect="dark"
                            :hide-after="0"
                            content="${__('删除')}"
                            placement="top">
                        <el-button @click="delOne(scope.row)" type="danger" size="small" :class="['el-button-icon',pageFont]"><i class="fa fa-trash"></i></el-button>
                    </el-tooltip>
                    <template v-if="typeof rx=='object' && rx.visible(scope.row)">
                         <el-tooltip
                            v-if="rx.tooltip"
                            effect="dark"
                            :hide-after="0"
                            :content="rx.text"
                            placement="top">
                            <el-button @click="rx.method(scope.row)" :type="rx.type" size="small" :class="['el-button-icon',pageFont]">
                                <i :class="rx.icon"></i>
                            </el-button>
                        </el-tooltip>
                        <el-button v-else @click="rx.method(scope.row)" :type="rx.type" size="small" :class="['el-button-icon',pageFont]">
                            <i :class="rx.icon" v-if="rx.icon" style="margin-right: 5px;"></i>
                            <span v-if="rx.text">{{rx.text}}</span>
                        </el-button>
                    </template>
             </template>
         </div>  
    </template>            
</el-table-column>
`;
const operateTemp=`
<template v-if="column.field && column.field!='operate' && column.operate!==false">
    <el-col
        v-if="column.operate.form!='hidden' && column.operate.type!='hidden'"
        :xs="24"
        :sm="(column.operate.size=='large')?24:(column.operate.size=='small')?6:12"
        :md="(column.operate.size=='large')?16:(column.operate.size=='small')?4:8"
        :lg="(column.operate.size=='large')?12:(column.operate.size=='small')?3:6">
        <el-form-item :label="column.title">
            <el-input :size="pageFont" v-model="column.operate.value" v-if="column.operate.form=='input'" :type="column.operate.type" :placeholder="column.operate.placeholder">
                <template #prepend v-if="column.operate.prepend">{{column.operate.prepend}}</template>
                <template #append v-if="column.operate.append">{{column.operate.append}}</template>
            </el-input>
            <el-select :size="pageFont" :multiple="column.operate.multiple" v-model="column.operate.value" v-if="column.operate.form=='select'" style="width: 100%">
                <el-option
                        v-for="(value,key) in column.searchList"
                        :key="key"
                        :label="value"
                        :value="key">                                   
                </el-option>
            </el-select>
            <el-checkbox-group :size="pageFont" v-model="column.operate.value" v-if="column.operate.form=='checkbox'" style="width: 100%;">
                <el-checkbox
                        v-for="(value,key) in column.searchList"
                        :label="key">
                    {{value}}
                </el-checkbox>
            </el-checkbox-group>
            <el-radio-group :size="pageFont" v-model="column.operate.value" v-if="column.operate.form=='radio'" style="width: 100%;">
                <el-radio
                        v-for="(value,key) in column.searchList"
                        :label="key">
                    {{value}}
                </el-radio>
            </el-radio-group>
            <el-date-picker
                range-separator="到"
                :size="pageFont"
                v-model="column.operate.value"
                v-if="column.operate.form=='date-picker'"
                :type="column.operate.type"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :placeholder="column.operate.placeholder"
                :shortcuts="column.operate.shortcuts"
                :format="column.operate.format?column.operate.format:''"
                style="width: 100%;">
            </el-date-picker>
            <el-time-picker 
                :size="pageFont"
                v-if="column.operate.form=='time-picker'"
                v-model="column.operate.value"
                range-separator="到"
                :is-range="column.operate.type=='timerange'"
                :placeholder="column.operate.placeholder"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :editable="false"
                :format="column.operate.format"
                :arrow-control="true"
                style="width:100%">           
            </el-time-picker>
            <template v-if="column.operate.form=='between'">
                <div class="filter-between">
                    <el-input :size="pageFont" v-model="column.operate.value[0]" type="number" style="width: 40%" placeholder="开始"></el-input>
                    <span>到</span>
                    <el-input :size="pageFont" v-model="column.operate.value[1]" type="number" style="width: 40%" placeholder="结束"></el-input>
                </div>
            </template>
            <template v-if="column.operate.form=='cascader'">
                <el-cascader
                        :size="pageFont"
                        v-model="column.operate.value"
                        :props="column.operate.props"
                        :placeholder="'请选择'+column.operate.placeholder"
                        :options="column.operate.options"
                        :clearable="true"
                        style="width: 100%">
                </el-cascader>
            </template>
            <template v-if="column.operate.form=='selectpage'">
                 <select-page 
                    @change="changeSelectpage"
                    :size="pageFont"
                    :url="column.operate.url"
                    :label-field="column.operate.labelField"
                    :key-field="column.operate.keyField"
                    :field="column.field"
                    :placeholder="column.operate.placeholder"
                    :page-size="column.operate.pageSize"
                    :value="column.operate.value"
                    :multiple="column.operate.multiple">
                </select-page>
            </template>
        </el-form-item>
    </el-col>
</template>
`;
const columnTemp1=columnTemp.replaceAll('column.','column1.');
const columnTemp2=columnTemp.replaceAll('column.','column2.');
const columnTemp3=columnTemp.replaceAll('column.','column3.');
const operateTemp1=operateTemp.replaceAll('column.','column1.');
const operateTemp2=operateTemp.replaceAll('column.','column2.');
const operateTemp3=operateTemp.replaceAll('column.','column3.');

const template=`
    <el-tabs type="card" v-model="tabsValue" v-if="tabs" @tab-change="tabChange">
        <el-tab-pane name="" label="${__('全部')}"></el-tab-pane>
        <el-tab-pane v-for="(tab,key) in tabList" :key="key" :name="key" :label="__(tab)"></el-tab-pane>
    </el-tabs>
    <div class="toolbar">
        <el-row>
            <el-col :xs="24" :sm="12" :md="12" :style="(pageFont=='small')?'margin-bottom:10px;':'margin-bottom:20px;'">
                <div class="left">
                    <el-button-group :size="pageFont">
                        <template v-for="(tool,key) in table_.toolbar" :key="key">
                            <slot name="toolbar" :selections="selections" :tool="tool"></slot>
                            <el-button v-if="tool=='refresh'" class="refresh" @click.stop="reload" type="info" :disabled="loading"><i :class="loading?'fa fa-refresh fa-spin':'fa fa-refresh'"></i></el-button>
                            <el-button v-if="auth.add && tool=='add'" @click.stop="add" type="primary"><i class="fa fa-plus"></i>&nbsp;${__('添加')}</el-button>
                            <el-button v-if="auth.edit && tool=='edit'" @click.stop="edit(0)" type="primary" :disabled="selections.length?false:true"><i class="fa fa-pencil"></i>&nbsp;${__('编辑')}</el-button>
                            <el-button v-if="auth.import && tool=='import'" @click.stop="importExcel" type="info"><i class="fa fa-upload"></i>&nbsp;${__('导入')}</el-button>
                            <el-button v-if="auth.del && tool=='del'" @click.stop="del" type="danger" :disabled="selections.length?false:true"><i class="fa fa-trash"></i>&nbsp;${__('删除')}</el-button>    
                            <el-button v-if="auth.recyclebin && tool=='recyclebin'" @click.stop="recyclebin" type="danger"><i class="fa fa-recycle"></i>&nbsp;${__('回收站')}</el-button>
                            <el-dropdown  v-if="auth.multi && tool=='more'" trigger="click">
                                <el-button type="warning" :disabled="selections.length?false:true"><i class="fa fa-cog"></i>&nbsp;${__('更多')}</el-button>  
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click.stop="changeShow('normal')"><i class="fa fa-eye"></i> ${__('设为可见')}</el-dropdown-item>
                                        <el-dropdown-item @click.stop="changeShow('hidden')"><i class="fa fa-eye-slash"></i> ${__('设为隐藏')}</el-dropdown-item>                      
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>    
                        </template>      
                    </el-button-group>
                </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :style="(pageFont=='small')?'margin-bottom:10px;':'margin-bottom:20px;'">
                <div class="right">
                    <el-input class="hide-800" :size="pageFont" v-if="search" placeholder="${__('搜索')}" v-model="searchValue" @blur="blurSearch"></el-input>
                    <el-select suffix-icon="" multiple ref="rightToolSelect">
                        <template v-if="rightToolOption.type=='column'">
                             <template v-for="item in rightToolOption.list">
                                <el-option
                                        v-if="item.title && item.visible!='none'"
                                        :key="item.field"
                                        :value="item.field">
                                        <el-checkbox @change="changeVisiable(item.field)" :checked="item.visible" :label="item.title" style="width: 100%"></el-checkbox>
                                </el-option>
                            </template>
                        </template>
                        <template v-if="rightToolOption.type=='font'">
                             <template v-for="(item,key) in rightToolOption.list">
                                <el-option :value="key" @click="changeFont(key)">
                                    <div style="display: flex;justify-content: space-between;align-items: center;">
                                        <span :style="(pageFont==key)?'font-weight:bolder;color: var(--el-color-primary);':''">{{item}}</span>
                                        <i v-if="pageFont==key" class="fa fa-check" style="color: var(--el-color-primary);"></i>
                                    </div>
                                </el-option>
                            </template>
                        </template>
                        <template #prefix>
                            <el-button-group :size="pageFont">
                                <el-button v-if="extend.download_url" type="info" @click.stop="clickRightToolBar('download')">
                                    <i class="fa fa-download"></i>
                                </el-button>
                                 <el-button type="info" @click="clickRightToolBar('font')">
                                    <span v-if="pageFont=='large'">${__('大')}</span>
                                    <span v-if="pageFont=='default'">${__('中')}</span>
                                    <span v-if="pageFont=='small'">${__('小')}</span>
                                    <i class="fa fa-caret-down"></i>
                                </el-button>
                                <el-button type="info" @click="clickRightToolBar('column')">
                                    <i class="fa fa-th"></i>
                                    <i class="fa fa-caret-down"></i>
                                </el-button>
                                <el-button v-if="commonSearch" type="info" @click.stop="table_.searchFormVisible=!table_.searchFormVisible">
                                    <i class="fa fa-search"></i>
                                </el-button>
                                <el-button v-if="menutype == 'tab'" type="info" @click.stop="changeExpand" id="mainFrameExpand">
                                    <i v-if="!mainFrameExpand" class="fa fa-expand"></i>
                                    <i v-else class="fa fa-compress"></i>
                                </el-button>
                            </el-button-group>
                        </template>
                    </el-select>
                </div>
            </el-col>
        </el-row>
    </div>
    <el-card class="yunqi-filter" shadow="hover" v-show="commonSearch && table_.searchFormVisible">
        <el-form label-width="100" label-position="left">
            <el-row :gutter="20">
                <template v-for="(column1,index1) in table_.columns" :key="index1">
                    <template v-if="column1.children">
                        <template v-for="(column2,index2) in column1.children" :key="index2">
                            <template v-if="column2.children">
                                 <template v-for="(column3,index3) in column2.children" :key="index3">
                                     ${operateTemp3}
                                 </template>
                            </template>
                            <template v-else>
                                ${operateTemp2}
                            </template>
                        </template>
                    </template>
                    <template v-else>
                        ${operateTemp1}
                    </template>
                </template>
                <el-divider style="margin-bottom: 10px;">
                    <el-col :span="24">
                        <div class="form-group submit">
                            <el-button :size="pageFont" type="success" @click="submit"><i class="fa fa-check"></i>&nbsp;提交</el-button>
                            <el-button class="hide-600" :size="pageFont" type="info"  @click="reset"><i class="fa fa-reply"></i>&nbsp;重置</el-button>
                            <el-button class="hide-800" :size="pageFont" type="primary" @click="table_.searchFormVisible=false;"><i class="fa fa-long-arrow-up"></i>&nbsp;收起</el-button>
                        </div>
                    </el-col>
                </el-divider>           
            </el-row>
        </el-form>
    </el-card>
    <el-table
            :data="list"
            ref="table"
            :style="style"
            :header-cell-style="{'text-align':'center','color':'#333'}"
            :row-key="pk"
            :tree-props="{children:'childlist'}"
            :default-expand-all="treeExpandAll"
            :size="pageFont"
            :flexible="true"
            table-layout="auto"
            stripe
            @sort-change="changeSort"
            border
            @select="selectOne"
            @select-all="selectAll"> 
            <template v-for="(column1,index1) in table_.columns" :key="index1">
                <el-table-column :align="column1.align?column.align:'center'" v-if="column1.checkbox" type="selection" :selectable="column1.selectable"></el-table-column>
                <template v-if="column1.children">
                    <el-table-column :label="column1.title" v-if="column1.visible">
                         <template #header>
                            <slot name="header" :field="column1.field">
                                <div style="white-space: nowrap;text-align: center;width: 100%;">{{column1.title}}</div>
                            </slot>
                        </template>
                        <template v-for="(column2,index2) in column1.children" :key="index2">
                            <template v-if="column2.children">
                                <el-table-column :label="column2.title" v-if="column2.visible">
                                     <template #header>
                                        <slot name="header" :field="column2.field">
                                            <div style="white-space: nowrap;text-align: center;width: 100%;">{{column2.title}}</div>
                                        </slot>
                                    </template>
                                    <template v-for="(column3,index3) in column2.children" :key="index3">
                                         ${columnTemp3}
                                    </template>
                                </el-table-column>
                            </template>
                            <template v-else>
                                ${columnTemp2}
                            </template>
                        </template>
                    </el-table-column>
                </template>
                <template v-else>
                    ${columnTemp1}
                </template>
            </template>
    </el-table>
    <el-card shadow="never" :class="['table-footer',pageFont]" v-if="showSummary">
        合计：<span v-html="summary"></span>
    </el-card>
    <el-pagination
            v-if="pagination"
            style="margin: 15px 0"
            :current-page="currentPage"
            :page-size="pageSize"
            :small="(pageFont=='small')"
            :page-sizes="[10, 15, 20, 25, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :background="true"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
    >
    </el-pagination>
    <el-dialog
        v-model="download.show"
        title="下载"
        width="800">
        <el-form labelWidth="120" labelPostion="top">
               <el-form-item label="列表">
                    <el-checkbox-group v-model="download.field">
                        <template v-for="(column1,index1) in table_.columns" :key="index1">
                            <template v-if="column1.children">
                                <template v-for="(column2,index2) in column1.children" :key="index2">
                                    <template v-if="column2.children">
                                         <template v-for="(column3,index3) in column2.children" :key="index3">
                                             <el-checkbox
                                                checked
                                                v-if="column3.field && column3.field!='operate' && column3.visible!='none'"
                                                :label="column3.field">
                                                {{column3.title}}
                                             </el-checkbox>
                                         </template>
                                    </template>
                                    <template v-else>
                                        <el-checkbox
                                            checked
                                            v-if="column2.field && column2.field!='operate' && column2.visible!='none'"
                                            :label="column2.field">
                                            {{column2.title}}
                                         </el-checkbox>
                                    </template>
                                </template>
                            </template>
                            <template v-else>
                                 <el-checkbox
                                    checked
                                    v-if="column1.field && column1.field!='operate' && column1.visible!='none'"
                                    :label="column1.field">
                                    {{column1.title}}
                                 </el-checkbox>
                            </template>
                        </template>
                    </el-checkbox-group>
                </el-form-item>
               <el-form-item label="筛选条件">
                    <el-radio-group v-model="download.filter">
                         <el-radio :label="1">${__('是')}</el-radio>
                         <el-radio :label="0">${__('否')}</el-radio>
                    </el-radio-group>
                </el-form-item>
               <el-form-item label="筛选分页">
                    <el-radio-group v-model="download.page">
                         <el-radio :label="1">单页数据</el-radio>
                         <el-radio :label="0">全部数据</el-radio>
                    </el-radio-group>
                </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="download.show = false">${__('取消')}</el-button>
            <el-button type="primary" @click="dataList">${__('确认')}</el-button>
          </span>
        </template>
    </el-dialog>
    <el-dialog width="500" v-model="importResult.show" title="${__('导入结果')}">
        <div style="margin: -20px 0;">
             <el-scrollbar :height="importResult.fail.length>0?'300px':'100px'">
                 <p style="color: green;margin:0;padding:0;">成功导入{{importResult.success}}条记录!</p>
                 <template v-if="importResult.fail.length>0">
                 <p>失败：</p>
                 <p v-for="(item,key) in importResult.fail" :key="key" style="color: #ec7e7e;margin:0;padding:0;">{{key+1}}、{{item}}</p>
                 </template>
             </el-scrollbar>
        </div>
    </el-dialog>
    <el-upload
        class="importUpload hide"  
        ref="uploadRef"
        accept=".xls,.xlsx,.csv"
        :data="{disks:'local_private',category:''}"
        :headers="{'x-requested-with': 'XMLHttpRequest'}"
        action="${Yunqi.config.baseUrl}ajax/upload"
        :on-success="handleImportSuccess">
        <el-button>导入</el-button>
    </el-upload>
`;

export default template;