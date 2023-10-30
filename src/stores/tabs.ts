import { focusElemByClass } from "@/utils";
import { defineStore } from "pinia";

const tablist = {
  home: "home",
  queue: "queue",
  search: "search",
  lyrics: "lyrics",
};

export default defineStore("tabs", {
  state: () => ({
    tabs: tablist,
    current: tablist.lyrics,
  }),
  actions: {
    changeTab(tab: string) {
      if (tab === this.tabs.queue) {
        setTimeout(() => {
          focusElemByClass("currentInQueue");
        }, 500);
      }
      this.current = tab;
    },
    switchToQueue() {
      this.changeTab(tablist.queue);
    },
    switchToSearch() {
      this.changeTab(tablist.search);
    },
    switchToHome() {
      this.changeTab(tablist.home);
    },
  },
});
