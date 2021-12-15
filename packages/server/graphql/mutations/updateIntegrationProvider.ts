import {GraphQLNonNull} from 'graphql'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import publish from '../../utils/publish'
import UpdateIntegrationProviderPayload from '../types/UpdateIntegrationProviderPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import UpdateIntegrationProviderInput, {
  UpdateIntegrationProviderInputT
} from '../types/UpdateIntegrationProviderInput'
import {auth, validate, makeDbIntegrationProvider} from './helpers/integrationProviderHelpers'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import updateIntegrationProviderQuery from '../../postgres/queries/updateIntegrationProvider'

const updateIntegrationProvider = {
  name: 'UpdateIntegrationProvider',
  type: GraphQLNonNull(UpdateIntegrationProviderPayload),
  description: 'Update the Integration Provider settings',
  args: {
    provider: {
      type: GraphQLNonNull(UpdateIntegrationProviderInput),
      description: 'The new Integration Provider'
    }
  },
  resolve: async (
    _source,
    {provider}: {provider: UpdateIntegrationProviderInputT},
    context: GQLContext
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const viewerId = getUserId(authToken)
    const {teamId, orgId} = provider
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const authResult = auth(dataLoader, provider.scope, authToken, teamId, orgId)
    if (authResult instanceof Error) return standardError(authResult)

    // VALIDATION
    const providerDbId = IntegrationProviderId.split(provider.id)
    const validationResult = await validate(provider, viewerId, teamId, orgId, dataLoader)
    if (validationResult instanceof Error) return standardError(validationResult)

    // RESOLUTION
    const dbProvider = {
      ...makeDbIntegrationProvider(provider),
      ids: [providerDbId]
    }
    await updateIntegrationProviderQuery(dbProvider)

    //TODO: add proper scopes handling here, teamId only exists in provider with team scope
    const data = {userId: viewerId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateIntegrationProvider', data, subOptions)
    return data
  }
}

export default updateIntegrationProvider
