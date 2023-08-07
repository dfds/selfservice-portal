export class CapabilityCostsWrapper {
    static get DefaultFetchInterval() {
        return 60 * 60;
    }

    static get MaxDaysWindowSize() {
        return 30;
    }

    constructor(apiClient) {
        this.apiClient = apiClient;
        this.costsMap = new Map();
        this.has_set_costs = false;
    }


    async updateMyCapabilityCosts() {
        let responseCosts = await this.apiClient.getMyCapabilityCosts(CapabilityCostsWrapper.MaxDaysWindowSize);
        let costsMap = new Map();
        responseCosts.forEach(responseCost => {
            let capabilityId = responseCost.capabilityId;
            if (!costsMap.has(capabilityId)) {
                costsMap.set(capabilityId, []);
            }

            responseCost.costs.forEach(cost => {
                let chartStructure = {
                    name: cost.timeStamp,
                    pv: cost.value.toFixed(2),
                }
                costsMap.get(capabilityId).push(chartStructure)
            })
        });
        this.costsMap = costsMap;
        this.has_set_costs = this.costsMap.size !== 0;
        return this.has_set_costs;
    }

    getCostsForCapability(capabilityId, daysWindow) {

        if (daysWindow > CapabilityCostsWrapper.MaxDaysWindowSize) {
            throw new Error("Days window size is too large");
        }

        if (!this.costsMap.has(capabilityId) || this.costsMap.get(capabilityId).length === 0) {
            console.log("No costs found for capabilityId " + capabilityId)
            return [];
        }

        let costsForWindow = [];
        let now = new Date();
        let costs = this.costsMap.get(capabilityId);
        costs.forEach((cost) => {
            if (costsForWindow.length === daysWindow) {
                return;
            }
            let costDate = new Date(cost.name);
            if (costDate <= now) {
                costsForWindow.push(cost);
            }
        });

        return costsForWindow.slice().reverse();
    }

}
