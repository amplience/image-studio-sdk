import {
  AbstractProvider,
  execute,
  graphql,
  GraphQlRequestType,
} from '@amplience/gql-client';

interface Entitlement {
  name: string;
  type: string;
  value: boolean;
}

export const checkEntitlement = (entitlement: Entitlement) => {
  return (
    entitlement.name === 'image-studio-enabled' &&
    entitlement.type === 'boolean' &&
    entitlement.value === true
  );
};

const orgHasEntitlement = async (
  provider: AbstractProvider,
  { id }: { id: string },
): Promise<boolean> => {
  const getEntitlements = graphql(
    'query getOrganizationEntitlements($orgId: ID!) {\n  node(id: $orgId) {\n    ... on Organization {\n      id\n      entitlements {\n        name\n        label\n        value\n        type\n      }\n      plans {\n        name\n        entitlements {\n          name\n          label\n          type\n          value\n        }\n      }\n    }\n  }\n}',
  );

  const orgResponse = await execute(
    provider,
    GraphQlRequestType.Query,
    getEntitlements,
    { orgId: id },
  );

  const org = orgResponse.node;

  if (org && 'entitlements' in org) {
    // Check explicit entitlements first
    for (const entitlement of org.entitlements ?? []) {
      if (checkEntitlement(entitlement)) {
        return true;
      }
    }
  }

  if (org && 'plans' in org) {
    // Check entitlements associated with plans
    for (const plan of org.plans ?? []) {
      for (const entitlement of plan.entitlements ?? []) {
        if (checkEntitlement(entitlement)) {
          return true;
        }
      }
    }
  }

  return false;
};

export const userHasImageStudioEntitlement = async (
  provider: AbstractProvider,
): Promise<boolean> => {
  const getOrgs = graphql(
    'query getOrganizations {\n  viewer {\n    organizations {\n      edges {\n        node {\n          id\n          name\n          label\n        }\n      }\n    }\n  }\n}',
  );

  const orgResponse = await execute(
    provider,
    GraphQlRequestType.Query,
    getOrgs,
  );

  if (
    orgResponse.viewer == null ||
    orgResponse.viewer.organizations.edges == null
  ) {
    return false;
  }

  const orgEdges = orgResponse.viewer.organizations.edges;

  for (let i = 0; i < orgEdges.length; i++) {
    const node = orgEdges[i]?.node;
    if (node != null && (await orgHasEntitlement(provider, node))) {
      return true;
    }
  }

  return false;
};
