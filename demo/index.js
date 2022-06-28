import Vue from 'vue'

new Vue({
  el: "#app",
  // data: {
  //   firstName: 'John',
  //   lastName: 'Joe',
  //   reverseFirstName: 'John'.split('').reverse().join('')
  // },
  data() {
    return {
      firstName: "John",
      lastName: "Joe",
      reverseFirstName: "John".split("").reverse().join(""),
    };
  },
  components: {
    test: {
      data: {
        firstName: "11",
      },
      template: "<div  >111</div>",
    },
  },
  computed: {
    fullName() {
      return this.firstName + this.lastName;
    },
  },
  watch: {
    firstName(val) {
      this.reverseFirstName = val.split("").reverse().join("");
    },
  },
  created() {
    console.log(1);
  },
  mounted() {
    console.log(this.$refs.firstDom);
  },
  methods: {
    reset() {
      this.firstName = "John";
    },
  },
});
