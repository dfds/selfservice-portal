# Add tag: Business Capability

## Need:
In order to track spending more granularly than on cost center / tribe level all capabilities (technical) must note which capability (business) they belong to.

## Assumptions:
The list of business capabilities will not change often.
There is no desire from management to control this list externally.

## Decision
Hard code values in Portal.
Portal becomes single source of truth for this.
This is acceptable for a proof of concept.

## Revisit
If changes happen more often than once per month.
If management want to control this through third party sources.
