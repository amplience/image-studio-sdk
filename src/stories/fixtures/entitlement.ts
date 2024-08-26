export const orgListResponse = {
  data: {
    viewer: {
      organizations: {
        edges: [
          {
            node: {
              id: 'ABCDEFGHIJKLMNOP',
              name: 'amplience',
              label: 'Amplience',
            },
          },
        ],
      },
    },
  },
};

export const orgEntitlementsResponse = {
  data: {
    node: {
      id: 'ABCDEFGHIJKLMNOP',
      entitlements: [
        {
          name: 'users',
          label: 'Overall Users',
          value: 105,
          type: 'number',
        },
        {
          name: 'image-studio-enabled',
          label: 'Image Studio',
          value: true,
          type: 'boolean',
        },
      ],
      plans: [
        {
          name: 'content-hub',
          entitlements: [
            {
              name: 'content-hub-enabled',
              label: 'Content Hub',
              type: 'boolean',
              value: true,
            },
          ],
        },
      ],
    },
  },
};

export const orgPlanEntitlementsResponse = {
  data: {
    node: {
      id: 'ABCDEFGHIJKLMNOP',
      entitlements: [
        {
          name: 'users',
          label: 'Overall Users',
          value: 105,
          type: 'number',
        },
      ],
      plans: [
        {
          name: 'content-hub',
          entitlements: [
            {
              name: 'content-hub-enabled',
              label: 'Content Hub',
              type: 'boolean',
              value: true,
            },
          ],
        },
        {
          name: 'dynamic-content',
          entitlements: [
            {
              name: 'image-studio-enabled',
              label: 'Image Studio',
              value: true,
              type: 'boolean',
            },
          ],
        },
        {
          name: 'tier-small',
          entitlements: [
            {
              name: 'credit_allowance',
              label: 'AI Credits',
              type: 'number',
              value: 400,
            },
          ],
        },
      ],
    },
  },
};

export const orgNoEntitlementsResponse = {
  data: {
    node: {
      id: 'ABCDEFGHIJKLMNOP',
      entitlements: [
        {
          name: 'users',
          label: 'Overall Users',
          value: 105,
          type: 'number',
        },
      ],
      plans: [
        {
          name: 'content-hub',
          entitlements: [
            {
              name: 'content-hub-enabled',
              label: 'Content Hub',
              type: 'boolean',
              value: true,
            },
          ],
        },
      ],
    },
  },
};
