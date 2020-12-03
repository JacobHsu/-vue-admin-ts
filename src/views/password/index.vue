<template>
  <div class="app-container">

    <el-dialog
      :visible.sync="dialogVisible"
      :title="'Edit Account'"
    >
      <el-form
        :rules="rules"
        :model="account"
        label-width="80px"
        label-position="left"
        ref="form"
      >
        <el-form-item label="帳號" prop="name">
          <span>{{ account.name}}</span>
        </el-form-item>
        <el-form-item label="密碼" prop="password">
          <el-input
            ref="password"
            name="password"
            v-model="account.password"
            placeholder="請輸入密碼"
          />
        </el-form-item>
        <el-form-item label="新密碼" prop="newPassword">
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
import { cloneDeep, findKey } from 'lodash'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getAccounts, updateAccount } from '@/api/accounts'
import { UserModule } from '@/store/modules/user'
import { TagsViewModule } from '@/store/modules/tags-view'
import { isValidPWD } from '@/utils/validate'

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
  email: string
  name: string
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
  email: 'Loading...',
  name: 'Loading...'
}

@Component({
  name: 'RolePermission'
})
export default class extends Vue {
  private user = defaultProfile
  private account = Object.assign({}, defaultAccount)
  private accountsList: IAccount[] = []
  private dialogVisible = false
  private checkStrictly = false

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
    password: [{ required: true, validator: this.validatePassword, trigger: 'blur' }],
    newPassword: [{ required: true, trigger: 'blur' }],
    confirmPassword: [{ required: true, trigger: 'blur' }],
    role: [{ required: true, trigger: 'blur' }]
  }

  get name() {
    console.log(333, UserModule)
    return UserModule.name
  }

  get email() {
    return UserModule.email
  }

  @Watch('dialogVisible')
  private onDialogVisibleChange(value: boolean) {
    if (value === false) {
      const view = TagsViewModule.visitedViews
      const key = findKey(view, { name: 'password' })
      TagsViewModule.delView(view[Number(key)])
      this.$router.push('/')
    }
  }

  created() {
    this.getAccounts()
    this.getUser()
  }

  private getUser() {
    this.user = {
      email: this.email,
      name: this.name
    }
  }

  private async getAccounts() {
    const { data } = await getAccounts({ /* Your params here */ })
    this.accountsList = data.items
    this.dialogVisible = true
    this.account = cloneDeep(data.items[0])
  }

  private async confirmAccount() {
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

    const form = this.$refs.form as any
    form.validate((valid: boolean) => {
      if (valid) {
        const { description, key, name } = this.account
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
