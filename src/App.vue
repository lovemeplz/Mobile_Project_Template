<template>
  <div id="app">
    <!-- <div class="test">test</div>
    <van-button type="primary" @click="handleToHome">测试</van-button> -->
    <router-view />
    
  </div>
</template>
<script>
export default {
  name: 'App', 
  methods: {
    handleToHome() {
      this.$router.push('/home')
    }
  }
}
</script>
<style lang="scss">
#app{
  .test{
    width: 200px;
    height: 200px;
  }
}
</style>