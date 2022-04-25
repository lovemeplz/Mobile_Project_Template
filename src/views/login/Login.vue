<template>
  <div class="page-login">
    <van-form class="login-box" @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="username"
          name="username"
          label="用户名223"
          placeholder="用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit">
          提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>
<script>
import { onMounted, ref } from 'vue'
import { useStore } from '@/store'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    // const username = ref('')
    // const password = ref('')
    // const onSubmit = (values) => {
    //   store.dispatch('Login', values)
    // }
    onMounted(() => {
      console.log('mounted:::', dd)
    })
    return {
      store,
      // username,
      // password,
      // onSubmit,
    }
  },
}
</script>

<style lang="scss" scoped>
.page-login {
  .login-box {
    margin-top: 100px;
  }
}
</style>
