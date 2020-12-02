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
        :label="$t('permission.account')"
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
        :label="$t('permission.rolePermission')"
        width="180"
      >
        <template slot-scope="{row}">
          {{ row.role }}
        </template>
      </el-table-column>
      <el-table-column
        align="header-center"
        :label="$t('table.modifyDate')"
      >
        <template slot-scope="{row}">
          {{ row.timestamp | parseTime }}
        </template>
      </el-table-column>
      <el-table-column
        align="header-center"
        :label="$t('table.modifyUser')"
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
        ref="form"
      >
        <el-form-item label="帳號" prop="name">
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
        <!-- <el-form-item label="新密碼">
          <el-input
            ref="newPassword"
            name="newPassword"
            v-model="account.newPassword"
            placeholder="請輸入密碼"
          />
        </el-form-item> -->
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
          :label="$t('permission.rolePermission')"
          prop="role"
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
import { cloneDeep } from 'lodash'
import { Component, Vue } from 'vue-property-decorator'
import { RouteConfig } from 'vue-router'
import { createRole, deleteRole } from '@/api/roles'
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
  status: string
  description: string
  timestamp: string | number
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
  status: 'open',
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

  private validateAccount = (rule: any, value: string, callback: Function) => {
    if (value.length < 8 || value.length > 20) {
      callback(new Error('英數字組合8-20字元'))
    } else {
      callback()
    }
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
    name: [{ required: true, validator: this.validateAccount, trigger: 'blur' }],
    password: [{ required: true, validator: this.validatePassword, trigger: 'blur' }],
    confirmPassword: [{ required: true, trigger: 'blur' }],
    role: [{ required: true, trigger: 'blur' }]
  }

  get name() {
    return UserModule.name
  }

  created() {
    // this.getRoles()
    this.getAccounts()
    this.getUser()
  }

  private getUser() {
    this.user = {
      name: this.name
    }
  }

  // private async getRoles() {
  //   const { data } = await getRoles({ /* Your params here */ })
  //   this.rolesList = data.items
  // }

  private async getAccounts() {
    const { data } = await getAccounts({ /* Your params here */ })
    this.accountsList = data.items
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

  private async confirmAccount() {
    const isEdit = this.dialogType === 'edit'

    if (isEdit) {
      if (this.account.password !== this.account.confirmPassword) {
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

    const form = this.$refs.form as any
    form.validate((valid: boolean) => {
      if (valid) {
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
    })
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
