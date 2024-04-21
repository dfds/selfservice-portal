import { makeAutoObservable } from 'mobx';


class Store {
  count = 0; 
  topics = [];// The State
  selectedTopic = [];

  constructor() {
    makeAutoObservable(this);
  }

  updateTopics(value) {
    this.topics = value;
  }

  updateSelectedTopic(newTopic){
    this.selectedTopic = newTopic;
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }
}

export const store = new Store();