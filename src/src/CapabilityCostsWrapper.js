export class CapabilityCosts{

constructor(){
  this.rechartsCosts = [];
  this.rawCosts = [];
  this.average = 0.0;
  }

  addCost(cost){
    this.rawCosts.push(cost);
    this.rechartsCosts.push({name:cost.timestamp, pv:cost.value});
  }
   calculateAndSetAverage(){

  }
}

export class CapabilityCostsWrapper {
  static get ForceCheckInterval() {
    return 60 * 5; // 5 minutes
  }

  static get MaxDaysWindowSize() {
    return 30;
  }

  constructor(apiClient) {
    this.apiClient = apiClient;
    this.costsMap = new Map();
    this.has_set_costs = false;
    this.next_forced_update = 0;
  }

  async tryUpdateMyCapabilityCosts() {
    let now = new Date().getTime()
    if (this.has_set_costs && this.next_forced_update > now) {
      return true;
    }

    let responseCosts = await this.apiClient.getMyCapabilityCosts(
      CapabilityCostsWrapper.MaxDaysWindowSize,
    );
    let costsMap = new Map();
    responseCosts.forEach((responseCost) => {
      let capabilityId = responseCost.capabilityId;
      if (!costsMap.has(capabilityId)) {
        costsMap.set(capabilityId, []);
      }

      responseCost.costs.forEach((cost) => {
        let chartStructure = {
          name: cost.timeStamp,
          pv: Math.floor(cost.value),
        };
        costsMap.get(capabilityId).push(chartStructure);
      });
    });
    this.costsMap = costsMap;
    this.has_set_costs = this.costsMap.size !== 0;
    this.next_forced_update = now + CapabilityCostsWrapper.ForceCheckInterval;
    return this.has_set_costs;
  }

  getCostsForCapability(capabilityId, daysWindow) {
    if (daysWindow > CapabilityCostsWrapper.MaxDaysWindowSize) {
      throw new Error("Days window size is too large");
    }

    if (
      !this.costsMap.has(capabilityId) ||
      this.costsMap.get(capabilityId).length === 0
    ) {
      console.log("No costs found for capabilityId " + capabilityId);
      return [];
    }

    let these_costs = this.costsMap.get(capabilityId);
    if (these_costs.length <= daysWindow) {
      return these_costs;
    }
    return these_costs.slice(-daysWindow);
  }
}
