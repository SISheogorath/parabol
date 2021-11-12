import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLString
} from 'graphql'
import GraphQLURLType from './GraphQLURLType'
import {
  IntegrationProviderTypeEnum,
  IntegrationProviderTokenTypeEnum,
  IntegrationProviderScopesEnum
} from './IntegrationProvider'
import {
  IntegrationProviderTypesEnum as IntegrationProviderTypesEnumT,
  IntegrationProviderScopesEnum as IntegrationProviderScopesEnumT,
  IntegrationProviderTokenTypeEnum as IntegrationProviderTokenTypeEnumT
} from '../../types/IntegrationProviderAndTokenT'

export interface AddIntegrationProviderInputT {
  type: Lowercase<IntegrationProviderTypesEnumT>
  tokenType: Lowercase<IntegrationProviderTokenTypeEnumT>
  scope: Lowercase<IntegrationProviderScopesEnumT>
  name: string
  oauthScopes?: string[] | null
  serverBaseUri: string
  oauthClientId?: string | null
  oauthClientSecret?: string | null
  orgId: string
  teamId: string
}

const AddIntegrationProviderInput = new GraphQLInputObjectType({
  name: 'AddIntegrationProviderInput',
  description: 'An Integration Provider configuration',
  fields: () => ({
    type: {
      type: IntegrationProviderTypeEnum,
      description: 'The service this provider is associated with'
    },
    tokenType: {
      type: IntegrationProviderTokenTypeEnum,
      description: 'The kind of token used by this provider'
    },
    scope: {
      type: IntegrationProviderScopesEnum,
      description:
        'The scope this provider configuration was created at (globally, org-wide, or by the team)'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the provider, suitable for display on a user interface'
    },
    oauthScopes: {
      type: new GraphQLList(GraphQLNonNull(GraphQLString)),
      description: 'A list of scope strings that should be requested from the provider'
    },
    serverBaseUri: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URI used to access the provider'
    },
    oauthClientId: {
      type: GraphQLString,
      description: 'The client id to give to the provider'
    },
    oauthClientSecret: {
      type: GraphQLString,
      description: 'The client id to give to the provider'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The org that the access token is attached to'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that the token is linked to'
    }
  })
})

export default AddIntegrationProviderInput
