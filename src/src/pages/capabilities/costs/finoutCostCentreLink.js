const ACCOUNT_ID = "e071c3ed-1e3c-46f7-9830-71951712d791";

export function getFinoutLinkForCostCentre({ costCentre }) {
  const date = encodeURIComponent(
    JSON.stringify({ relativeRange: "last30Days", type: "day", range: 30 }),
  );
  const drilldown = encodeURIComponent(
    JSON.stringify([
      {
        filter: {
          costCenter: "virtualTag",
          key: "cba15b1b-dfe3-40b7-a10d-daade6465f33",
          path: "Virtual Tags/dfds.cost.centre",
          operator: "is",
          value: costCentre,
        },
        groupBy: {
          costCenter: "virtualTag",
          key: "d271558a-e790-4446-b205-2888fe81ebc2",
          path: "Virtual Tags/Business Capability",
        },
        preDrillDownGroupBy: {},
        preDrillDownGroupBys: [
          {
            costCenter: "virtualTag",
            key: "cba15b1b-dfe3-40b7-a10d-daade6465f33",
            path: "Virtual Tags/dfds.cost.centre",
          },
        ],
      },
    ]),
  );
  const xAxisGroupBy = encodeURIComponent(
    JSON.stringify({ type: "time", value: "day", path: null }),
  );

  return (
    `https://app.finout.io/app/total-cost` +
    `?accountId=${ACCOUNT_ID}` +
    `&date=${date}` +
    `&filters=%7B%7D` +
    `&xAxisGroupBy=${xAxisGroupBy}` +
    `&drilldown=${drilldown}` +
    `&metrics=cost` +
    `&groupByChartType=1` +
    `&tableTransposed=1` +
    `&showTableDates=1` +
    `&costType=amortizedCost` +
    `&calculationMethod=sum` +
    `&groupBys=%5B%5D`
  );
}

export function getFinoutLinkForCapability({ capabilityId }) {
  const date = encodeURIComponent(
    JSON.stringify({ relativeRange: "last30Days", type: "day", range: 30 }),
  );
  const filters = encodeURIComponent(
    JSON.stringify({
      costCenter: "virtualTag",
      key: "52c02d7e-093a-42b7-bf06-eb13050a8687",
      path: "Virtual Tags\uD83D\uDD25/capability",
      operator: "is",
      value: capabilityId,
    }),
  );
  const groupBy = encodeURIComponent(
    JSON.stringify({
      costCenter: "virtualTag",
      key: "1ee86223-0cf1-4eb4-9ea9-fb4616f358e6",
      path: "Virtual Tags\uD83D\uDD25/Services Level Breakdown",
    }),
  );
  const xAxisGroupBy = encodeURIComponent(
    JSON.stringify({ type: "time", value: "day", path: null }),
  );

  return (
    `https://app.finout.io/app/total-cost` +
    `?accountId=${ACCOUNT_ID}` +
    `&date=${date}` +
    `&filters=${filters}` +
    `&groupBy=${groupBy}` +
    `&xAxisGroupBy=${xAxisGroupBy}` +
    `&drilldown=%5B%5D` +
    `&metrics=cost` +
    `&groupByChartType=1` +
    `&tableTransposed=1` +
    `&showTableDates=1` +
    `&costType=amortizedCost` +
    `&calculationMethod=sum`
  );
}
