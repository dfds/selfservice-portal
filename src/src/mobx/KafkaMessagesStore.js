import { makeAutoObservable } from 'mobx';


class KafkaMessagesStore {
  count = 0; 

  constructor() {
    makeAutoObservable(this);
  }

  updateCounter() {
    this.count = this.count + 1;
  }

}

export const kafkaStore = new KafkaMessagesStore();