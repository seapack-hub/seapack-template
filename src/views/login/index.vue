<template>
  <div class="login-container">
    <Owl :close-eyes="isFocus" />
    <div class="login-card">
      <div class="title">Sea Pack</div>
      <div class="content">
        <el-form
          ref="loginFormRef"
          :model="loginFormData"
          :rules="loginFormRules"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model.trim="loginFormData.username"
              placeholder="用户名"
              type="text"
              tabindex="1"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginFormData.password"
              placeholder="密码"
              type="password"
              tabindex="2"
              :prefix-icon="Lock"
              size="large"
              show-password
              @blur="handleBlur"
              @focus="handleFocus"
            />
          </el-form-item>
          <el-form-item prop="code">
            <el-input
              v-model.trim="loginFormData.code"
              placeholder="验证码"
              type="text"
              tabindex="3"
              :prefix-icon="Key"
              maxlength="7"
              size="large"
            >
              <template #append>
                <el-image :src="codeUrl" @click="createCode" draggable="false">
                  <template #placeholder>
                    <el-icon>
                      <picture />
                    </el-icon>
                  </template>
                  <template #error>
                    <el-icon>
                      <Loading />
                    </el-icon>
                  </template>
                </el-image>
              </template>
            </el-input>
          </el-form-item>
          <el-button :loading="loading" type="primary" size="large" @click.prevent="handleLogin">登 录</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from "vue-router"
import { type LoginRequestData } from '@/api/login/types/login.ts'
import { type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Key, Picture, Loading } from '@element-plus/icons-vue'
import { getLoginCodeApi } from "@/api/login/index.ts"
import Owl from "./components/Owl.vue"
import { useFocus } from "./hooks/useFocus"

const router = useRouter()
const { isFocus, handleBlur, handleFocus } = useFocus()

/** 验证码图片*/
const codeUrl = ref("")
/** 登录表单数据 */
const loginFormData: LoginRequestData = reactive({
  username: 'admin',
  password: '12345678',
  code: '',
})
/** 登录表单元素的引用 */
const loginFormRef = ref<FormInstance | null>(null)
/** 表单验证规则 */
const loginFormRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

/** 登录按钮 Loading */
const loading = ref(false)

/** 登录逻辑 */
const handleLogin = () => {
  loginFormRef.value?.validate((valid:boolean,fields)=>{
    if(valid){
      loading.value = true;

      router.push({path:"/menuTab"})

      loading.value = false;
    }else{
      console.error("表单校验不通过", fields)
    }
  })
}

/** 创建验证码图片*/
const createCode = async ()=>{
  //清空输入
  loginFormData.code = "";
  //获取验证码
  codeUrl.value = "";
  const code = await getLoginCodeApi();
  codeUrl.value = code.data;
}

/** 初始化验证码 */
createCode()
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100%;

  .login-card {
    width: 480px;
    max-width: 90%;
    border-radius: 20px;
    box-shadow: 0 0 10px #dcdfe6;
    background-color: var(--el-bg-color);
    overflow: hidden;
    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80px;
      font-size:50px;
      img {
        height: 100%;
      }
    }
    .content {
      padding: 20px 50px 50px 50px;
      :deep(.el-input-group__append) {
        padding: 0;
        overflow: hidden;
        .el-image {
          width: 100px;
          height: 40px;
          border-left: 0px;
          user-select: none;
          cursor: pointer;
          text-align: center;
        }
      }
      .el-button {
        width: 100%;
        margin-top: 10px;
      }
    }
  }
}
</style>
