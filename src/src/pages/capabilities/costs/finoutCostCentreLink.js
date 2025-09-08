var defaultLink = "https://app.finout.io/app/dashboards/";

var CostCentreLinkMap = {
  "ti-it":
    "https://app.finout.io/app/dashboards/0e37bc80-bf62-42c8-9ae0-eb1189037e9c",
  "ti-ce":
    "https://app.finout.io/app/dashboards/5a8f8ff5-ae82-4bc4-a5b8-a855c56d12a0",
  "ti-arch":
    "https://app.finout.io/app/dashboards/75bf5804-95ae-4dbf-8355-50754da1a388",
  finance:
    "https://app.finout.io/app/dashboards/05ed7718-1d1a-4d55-ac9f-c2ed93b183a7",
  "ti-inno":
    "https://app.finout.io/app/dashboards/9f944923-df46-4858-a736-bdeaa2de1b23",
  "ti-other":
    "https://app.finout.io/app/dashboards/38443c9f-4032-450f-b639-35e579c7afc1",
  "ti-data":
    "https://app.finout.io/app/dashboards/238cd51e-9e8e-4973-b2ce-d02effa8f2ea",
  "ti-pace":
    "https://app.finout.io/app/dashboards/3dd2a0ca-1ea6-47f8-b051-ff387fcd90ae",
  "ti-ferry":
    "https://app.finout.io/app/dashboards/b304b96e-2c33-40f2-a7d5-4ca3ca7304a6",
  "ti-logistics":
    "https://app.finout.io/app/dashboards/9fb7a0f8-fa22-4cb1-9977-b775a71b1d23",
};

export function getFinoutLinkForCostCentre({ costCentre }) {
  return CostCentreLinkMap[costCentre] || defaultLink;
}
