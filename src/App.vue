<template>
  <div id="app">
    <div class="test">test</div>
    <van-button type="primary">主要按钮</van-button>
    <router-view />
  </div>
</template>
<style lang="scss">
#app{
  .test{
    width: 200px;
    height: 200px;
  }
}
</style>