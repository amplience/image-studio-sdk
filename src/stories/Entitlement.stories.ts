import { StoryObj, Meta } from '@storybook/html';
import { expect } from '@storybook/test';
import { FetchProvider } from '@amplience/gql-client';
import { AmplienceImageStudioOptions } from '../AmplienceImageStudio';

import { userHasImageStudioEntitlement } from '../utils/Entitlement';
import { http, HttpResponse } from 'msw';

import {
  orgListResponse,
  orgEntitlementsResponse,
  orgNoEntitlementsResponse,
  orgPlanEntitlementsResponse,
} from './fixtures/entitlement';

interface AmplienceImageStudioProps {
  imageUrl: string;
  provider: {
    token: string;
    serviceUrl: string;
  };
  options: AmplienceImageStudioOptions;
}

const meta: Meta<AmplienceImageStudioProps> = {
  title: 'Entitlement Check',
  tags: ['autodocs'],
  argTypes: {},
  render: () => {
    return document.createElement('div');
  },
};

export default meta;
type Story = StoryObj;

export const TryMe: Story = {
  args: {
    token: 'Bearer-Token-Here',
    serviceUrl: 'https://graphql-gateway.amplience-qa.net/graphql',
  },
  render: (args) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';

    const check = document.createElement('button');
    check.innerText = 'Check Entitlements for Token';
    check.onclick = async () => {
      const fetchProvider = new FetchProvider(args.serviceUrl).withToken(
        args.token,
      );

      try {
        resultText.nodeValue = `Check in progress`;
        const result = await userHasImageStudioEntitlement(fetchProvider);

        resultText.nodeValue = `Has Entitlement: ${result}`;
      } catch (e) {
        resultText.nodeValue = `Error: ${e}`;
      }
    };
    wrapper.appendChild(check);

    const resultText = document.createTextNode('');
    wrapper.appendChild(resultText);

    return wrapper;
  },
};

export const CheckEntitlement: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('https://storybook-service.net/graphql', async (req) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const body = (await req.request.json()) as any;

          if (body.query.indexOf('query getOrganizations') !== -1) {
            return HttpResponse.json(orgListResponse);
          } else {
            return HttpResponse.json(orgEntitlementsResponse);
          }
        }),
      ],
    },
  },
  play: async () => {
    const fetchProvider = new FetchProvider(
      'https://storybook-service.net/graphql',
    ).withToken('Bearer-Token-Here');

    const result = await userHasImageStudioEntitlement(fetchProvider);

    expect(result).toBeTruthy();
  },
};

export const CheckEntitlementPlan: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('https://storybook-service.net/graphql', async (req) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const body = (await req.request.json()) as any;

          if (body.query.indexOf('query getOrganizations') !== -1) {
            return HttpResponse.json(orgListResponse);
          } else {
            return HttpResponse.json(orgPlanEntitlementsResponse);
          }
        }),
      ],
    },
  },
  play: async () => {
    const fetchProvider = new FetchProvider(
      'https://storybook-service.net/graphql',
    ).withToken('Bearer-Token-Here');

    const result = await userHasImageStudioEntitlement(fetchProvider);

    expect(result).toBeTruthy();
  },
};

export const CheckNoEntitlement: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('https://storybook-service.net/graphql', async (req) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const body = (await req.request.json()) as any;

          if (body.query.indexOf('query getOrganizations') !== -1) {
            return HttpResponse.json(orgListResponse);
          } else {
            return HttpResponse.json(orgNoEntitlementsResponse);
          }
        }),
      ],
    },
  },
  play: async () => {
    const fetchProvider = new FetchProvider(
      'https://storybook-service.net/graphql',
    ).withToken('Bearer-Token-Here');

    const result = await userHasImageStudioEntitlement(fetchProvider);

    expect(result).toBeFalsy();
  },
};
