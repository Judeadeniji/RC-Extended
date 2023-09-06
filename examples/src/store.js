import { sleep } from "rc-extended"
import { defineStore } from "rc-extended/store";

export const counter = defineStore("counter", {
  state: () => ({
    count: 0,
  }),

  computed: {
    double: (state) => state.count * 2,
  },

  actions: {
    increment: async (state) => {
      await sleep (300);
      return { ...state, count: state.count + 1 };
    },
  },

  getters: {
    getQuadruple: ({ double }) => double() * 2,
  },
  
  effects: {
    double: (count) => {
      
      return () => alert("hi " + count)
    }
  }
});