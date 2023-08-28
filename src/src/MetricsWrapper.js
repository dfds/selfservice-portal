export class MetricsData {
  constructor() {
    this.hasData = false;
    this.nextForcedUpdate = 0;
    this.capabilitiesMap = new Map();
  }

  shouldUpdate(now) {
    return !this.hasData || this.nextForcedUpdate > now;
  }

  updateCapabilityMap(now, capabilitiesMap) {
    this.capabilitiesMap = capabilitiesMap;
    this.hasData = true;
    this.nextForcedUpdate = now + MetricsWrapper.ForceCheckInterval;
  }
}

export class MetricsWrapper {
  static get ForceCheckInterval() {
    return 60 * 5; // 5 minutes
  }

  static get MaxDaysWindowSize() {
    return 30;
  }

  static get CostsKey() {
    return "metrics-costs";
  }

  static get ResourceCountsKey() {
    return "metrics-resource-counts";
  }

  constructor(apiClient) {
    this.apiClient = apiClient;
    this.metrics = new Map();
    this.metrics.set(MetricsWrapper.CostsKey, new MetricsData());
    this.metrics.set(MetricsWrapper.ResourceCountsKey, new MetricsData());
  }

  hasLoaded(key) {
    return this.metrics.get(key).hasData;
  }

  async tryUpdateMetrics() {
    let now = new Date().getTime();
    await this.#tryUpdateMyCapabilityCosts(now);
    await this.#tryUpdateResourceCounts(now);

    let has_all_data = true;
    for (let [_, value] of this.metrics) {
      if (!value.has_data) {
        has_all_data = false;
        break;
      }
    }

    return has_all_data;
  }

  async #tryUpdateResourceCounts(now) {
    let metric = this.metrics.get(MetricsWrapper.ResourceCountsKey);
    if (!metric.shouldUpdate(now)) {
      return;
    }

    let responseResourceCounts =
      await this.apiClient.getMyCapabilitiesResourceCounts();

    let resourceCountsMap = new Map();
    responseResourceCounts.forEach((responseResourceCount) => {
      let capabilityId = responseResourceCount.capabilityId;
      if (!resourceCountsMap.has(capabilityId)) {
        resourceCountsMap.set(capabilityId, new Map());
      }

      responseResourceCount.awsResourceCounts.forEach((resourceCount) => {
        resourceCountsMap
          .get(capabilityId)
          .set(resourceCount.resourceId, resourceCount.resourceCount);
      });
    });
    if (resourceCountsMap.size > 0) {
      metric.updateCapabilityMap(now, resourceCountsMap);
      this.metrics.set(MetricsWrapper.ResourceCountsKey, metric);
    }
  }

  async #tryUpdateMyCapabilityCosts(now) {
    let metric = this.metrics.get(MetricsWrapper.CostsKey);
    if (!metric.shouldUpdate(now)) {
      return;
    }

    let responseCosts = await this.apiClient.getMyCapabilitiesCosts();
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
    if (costsMap.size > 0) {
      metric.updateCapabilityMap(now, costsMap);
      this.metrics.set(MetricsWrapper.CostsKey, metric);
    }
  }

  getAwsResourcesTotalCountForCapability(capabilityId) {
    const metric = this.metrics.get(MetricsWrapper.ResourceCountsKey);

    const counts = metric.capabilitiesMap.get(capabilityId);
    if (counts === undefined) {
      return 0;
    }
    let total = 0;
    for (let [_, value] of counts) {
      total += value;
    }
    return total;
  }

  getAwsResourceCountsForCapability(capabilityId) {
    const metric = this.metrics.get(MetricsWrapper.ResourceCountsKey);
    const counts = metric.capabilitiesMap.get(capabilityId);
    if (counts === undefined) {
      return new Map();
    }
    return counts;
  }

  getAwsResourceCountForCapability(capabilityId, resourceId) {
    const metric = this.metrics.get(MetricsWrapper.ResourceCountsKey);
    const counts = metric.capabilitiesMap.get(capabilityId);
    if (counts === undefined) {
      return 0;
    }
    return counts.get(resourceId);
  }

  getCostsForCapability(capabilityId, daysWindow) {
    if (daysWindow > MetricsWrapper.MaxDaysWindowSize) {
      throw new Error("Days window size is too large");
    }
    const metric = this.metrics.get(MetricsWrapper.CostsKey);
    if (
      !metric.capabilitiesMap.has(capabilityId) ||
      metric.capabilitiesMap.get(capabilityId).length === 0
    ) {
      console.log("No costs found for capabilityId " + capabilityId);
      return [];
    }

    let these_costs = metric.capabilitiesMap.get(capabilityId);
    if (these_costs.length <= daysWindow) {
      return these_costs;
    }
    return these_costs.slice(-daysWindow);
  }
}
