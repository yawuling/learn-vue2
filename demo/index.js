import Vue from 'vue'
Vue.config.optionMergeStrategies.name = 'test'
console.log(Vue.config)
// new Vue({
//   el: '#app',
//   data: {
//     firstName: 'John',
//     lastName: 'Joe',
//     reverseFirstName: 'John'.split('').reverse().join('')
//   },
//   computed: {
//     fullName() {
//       return this.firstName + this.lastName;
//     }
//   },
//   watch: {
//     firstName(val) {
//       this.reverseFirstName = val.split('').reverse().join('');
//     }
//   },
//   created() {
//     console.log(1)
//   },
//   mounted() {
//     console.log(this.$refs.firstDom);
//   },
//   methods: {
//     reset() {
//       this.firstName = 'John'
//     }
//   }
// })
