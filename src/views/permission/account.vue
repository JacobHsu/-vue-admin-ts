<template>
  <div class="app-container">
    <el-button
      type="primary"
      @click="handleCreateAccount"
    >
      {{ $t('permission.createAccount') }}
    </el-button>

    <el-table
      :data="accountsList"
      style="width: 100%;margin-top:30px;"
      border
    >
      <el-table-column
        align="center"
        label="帳號"
        width="220"
      >
        <template slot-scope="{row}">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.status')"
        class-name="status-col"
        width="80"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status | permissionStatusFilter">
          {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="角色權限"
        width="180"
      >
        <template slot-scope="{row}">
          {{ row.role }}
        </template>
      </el-table-column>
      <el-table-column
        align="header-center"
        label="最後更改時間"
      >
        <template slot-scope="{row}">
          {{ row.timestamp | parseTime }}
        </template>
      </el-table-column>
      <el-table-column
        align="header-center"
        label="操作人員"
      >
        {{ user.name }}
      </el-table-column>
      <el-table-column
        align="center"
        label=""
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(scope)"
          >
            {{ $t('permission.editPermission') }}
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope)"
          >
            {{ $t('permission.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType==='edit'?'Edit Account':'New Account'"
    >
      <el-form
        :rules="rules"
        :model="account"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="帳號">
          <span v-if="dialogType==='edit'">{{ account.name}}</span>
          <template v-else>
            <el-input
              v-model="account.name"
              placeholder="請輸入帳號"
            />
          </template>
        </el-form-item>
        <el-form-item label="密碼" prop="password">
          <el-input
            ref="password"
            name="password"
            v-model="account.password"
            placeholder="請輸入密碼"
          />
        </el-form-item>
        <el-form-item label="新密碼">
          <el-input
            ref="newPassword"
            name="newPassword"
            v-model="account.newPassword"
            placeholder="請輸入密碼"
          />
        </el-form-item>
        <el-form-item label="重複密碼" prop="confirmPassword">
          <el-input
            ref="confirmPassword"
            name="confirmPassword"
            type="password"
            v-model="account.confirmPassword"
            placeholder="請再輸入一次"
          />
        </el-form-item>
        <el-form-item
          :label="$t('table.type')"
        >
          <el-select
            v-model="account.role"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in rolesTypeOptions"
              :key="item.key"
              :label="item.displayName"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.status')">
          <el-radio-group v-model="account.status">
            <el-radio-button label="open">開啟</el-radio-button>
            <el-radio-button label="close">關閉</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="danger"
          @click="dialogVisible=false"
        >
          {{ $t('permission.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="confirmAccount"
        >
          {{ $t('permission.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import path from 'path'
import { cloneDeep } from 'lodash'
import { Component, Vue } from 'vue-property-decorator'
import { RouteConfig } from 'vue-router'
import { getRoutes, createRole, deleteRole } from '@/api/roles'
import { getAccounts, updateAccount } from '@/api/accounts'
import { UserModule } from '@/store/modules/user'
import { isValidPWD } from '@/utils/validate'

const rolesTypeOptions = [
  { key: 'admin', displayName: 'admin' },
  { key: 'editor', displayName: 'editor' },
  { key: 'visitor', displayName: 'visitor' }
]

interface IRole {
  key: number
  name: string
  description: string
  routes: RouteConfig[]
}

interface IAccount {
  key: number
  username: string
  password: string
  newPassword: string
  confirmPassword: string
  name: string
  role: string
  description: string
  timestamp: string | number
}

interface IRoutesTreeData {
  children: IRoutesTreeData[]
  title: string
  path: string
}

interface IProfile {
  name: string
}

const defaultRole: IRole = {
  key: 0,
  name: '',
  description: '',
  routes: []
}

const defaultAccount: IAccount = {
  key: 0,
  username: '',
  password: '',
  newPassword: '',
  confirmPassword: '',
  name: '',
  role: '',
  description: '',
  timestamp: 0
}

const defaultProfile: IProfile = {
  name: 'Loading...'
}

@Component({
  name: 'RolePermission'
})
export default class extends Vue {
  private rolesTypeOptions = rolesTypeOptions
  private user = defaultProfile
  private role = Object.assign({}, defaultRole)
  private account = Object.assign({}, defaultAccount)
  private reshapedRoutes: RouteConfig[] = []
  private serviceRoutes: RouteConfig[] = []
  private accountsList: IAccount[] = []
  private dialogVisible = false
  private dialogType = 'new'
  private checkStrictly = false
  private defaultProps = {
    children: 'children',
    label: 'title'
  }

  private validatePassword = (rule: any, value: string, callback: Function) => {
    if (!isValidPWD(value)) {
      callback(new Error('需至少包含一個大寫字母及數字'))
    } else if (value.length < 6) {
      callback(new Error('The password can not be less than 6 digits'))
    } else {
      callback()
    }
  }

  private rules = {
    // type: [{ required: true, message: 'type is required', trigger: 'change' }],
    password: [{ validator: this.validatePassword, trigger: 'blur' }]
  }

  get routesTreeData() {
    return this.generateTreeData(this.reshapedRoutes)
  }

  get name() {
    return UserModule.name
  }

  created() {
    // Mock: get all routes and roles list from server
    this.getRoutes()
    // this.getRoles()
    this.getAccounts()
    this.getUser()
  }

  private getUser() {
    this.user = {
      name: this.name
    }
  }

  private async getRoutes() {
    const { data } = await getRoutes({ /* Your params here */ })
    this.serviceRoutes = data.routes
    this.reshapedRoutes = this.reshapeRoutes(data.routes)
  }

  // private async getRoles() {
  //   const { data } = await getRoles({ /* Your params here */ })
  //   this.rolesList = data.items
  // }

  private async getAccounts() {
    const { data } = await getAccounts({ /* Your params here */ })
    this.accountsList = data.items
  }

  private generateTreeData(routes: RouteConfig[]) {
    const data: IRoutesTreeData[] = []
    for (const route of routes) {
      const tmp: IRoutesTreeData = {
        children: [],
        title: '',
        path: ''
      }
      tmp.title = this.$t(`route.${route.meta.title}`).toString()
      tmp.path = route.path
      if (route.children) {
        tmp.children = this.generateTreeData(route.children)
      }
      data.push(tmp)
    }
    return data
  }

  // Reshape the routes structure so that it looks the same as the sidebar
  private reshapeRoutes(routes: RouteConfig[], basePath = '/') {
    const reshapedRoutes: RouteConfig[] = []
    for (let route of routes) {
      // Skip hidden routes
      if (route.meta && route.meta.hidden) {
        continue
      }
      const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)
      if (route.children && onlyOneShowingChild && (!route.meta || !route.meta.alwaysShow)) {
        route = onlyOneShowingChild
      }
      const data: RouteConfig = {
        path: path.resolve(basePath, route.path),
        meta: {
          title: route.meta && route.meta.title
        }
      }
      // Recursive generate child routes
      if (route.children) {
        data.children = this.reshapeRoutes(route.children, data.path)
      }
      reshapedRoutes.push(data)
    }
    return reshapedRoutes
  }

  private flattenRoutes(routes: RouteConfig[]) {
    let data: RouteConfig[] = []
    routes.forEach(route => {
      data.push(route)
      if (route.children) {
        const temp = this.flattenRoutes(route.children)
        if (temp.length > 0) {
          data = [...data, ...temp]
        }
      }
    })
    return data
  }

  private handleCreateAccount() {
    this.account = Object.assign({}, defaultAccount)
    this.dialogType = 'new'
    this.dialogVisible = true
  }

  private handleEdit(scope: any) {
    this.dialogType = 'edit'
    this.dialogVisible = true
    this.checkStrictly = true
    this.role = cloneDeep(scope.row)
    this.account = cloneDeep(scope.row)
  }

  private handleDelete(scope: any) {
    const { $index, row } = scope
    this.$confirm('Confirm to remove the role?', 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
      .then(async() => {
        await deleteRole(row.key)
        this.accountsList.splice($index, 1)
        this.$message({
          type: 'success',
          message: 'Deleted!'
        })
      })
      .catch(err => { console.error(err) })
  }

  private generateTree(routes: RouteConfig[], basePath = '/', checkedKeys: string[]) {
    const res: RouteConfig[] = []
    for (const route of routes) {
      const routePath = path.resolve(basePath, route.path)
      // recursive child routes
      if (route.children) {
        route.children = this.generateTree(route.children, routePath, checkedKeys)
      }
      if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
        res.push(route)
      }
    }
    return res
  }

  private async confirmAccount() {
    const isEdit = this.dialogType === 'edit'

    if (isEdit) {
      if (this.account.newPassword !== this.account.confirmPassword) {
        this.$message({
          type: 'error',
          message: '两次输入密码不一致!'
        })
        return
      }

      await updateAccount(this.account.key, { role: this.account })
      for (let index = 0; index < this.accountsList.length; index++) {
        if (this.accountsList[index].key === this.account.key) {
          this.accountsList.splice(index, 1, Object.assign({}, this.account))
          break
        }
      }
    } else {
      const { data } = await createRole({ role: this.role })
      this.account.key = data.key
      this.accountsList.push(this.account)
    }

    const { description, key, name } = this.role
    this.dialogVisible = false
    this.$notify({
      title: 'Success',
      dangerouslyUseHTMLString: true,
      message: `
          <div>Role Key: ${key}</div>
          <div>Role Name: ${name}</div>
          <div>Description: ${description}</div>
        `,
      type: 'success'
    })
  }

  // Reference: src/layout/components/Sidebar/SidebarItem.vue
  private onlyOneShowingChild(children: RouteConfig[] = [], parent: RouteConfig) {
    let onlyOneChild = null
    const showingChildren = children.filter(item => !item.meta || !item.meta.hidden)
    // When there is only one child route, the child route is displayed by default
    if (showingChildren.length === 1) {
      onlyOneChild = showingChildren[0]
      onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
      return onlyOneChild
    }
    // Show parent if there are no child route to display
    if (showingChildren.length === 0) {
      onlyOneChild = { ...parent, path: '' }
      return onlyOneChild
    }
    return false
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }

  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
