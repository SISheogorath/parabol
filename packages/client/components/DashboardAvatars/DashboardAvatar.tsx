import {DashboardAvatar_teamMember} from '../../__generated__/DashboardAvatar_teamMember.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Avatar from '../Avatar/Avatar'
import {MenuPosition} from '../../hooks/useCoords'
import useModal from '../../hooks/useModal'
import lazyPreload from '../../utils/lazyPreload'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import {PALETTE} from '../../styles/paletteV3'
import {ElementWidth} from '../../types/constEnums'
import useTooltip from '../../hooks/useTooltip'
import useMutationProps from '../../hooks/useMutationProps'
import useAtmosphere from '../../hooks/useAtmosphere'
import ToggleManageTeamMutation from '../../mutations/ToggleManageTeamMutation'

interface Props {
  isViewerLead: boolean
  teamMember: DashboardAvatar_teamMember
}

const AvatarWrapper = styled('div')({
  width: 20
})

const StyledAvatar = styled(Avatar)<{isConnected: boolean; picture: string}>(
  ({isConnected, picture}) => ({
    // opacity causes transparency making overlap look bad. change img instead
    backgroundImage: `${
      isConnected ? '' : 'linear-gradient(rgba(255,255,255,.65), rgba(255,255,255,.65)),'
    } url(${picture}), url(${defaultUserAvatar})`,
    border: `2px solid ${PALETTE.SLATE_200}`,
    ':hover': {
      backgroundImage: `linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)),
    url(${picture}), url(${defaultUserAvatar})`
    }
  })
)

const TeamMemberAvatarMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TeamMemberAvatarMenu' */ './TeamMemberAvatarMenu')
)

const PromoteTeamMemberModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'PromoteTeamMemberModal' */ '../../modules/teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal'
  )
)
const RemoveTeamMemberModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'RemoveTeamMemberModal' */ '../../modules/teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal'
  )
)
const LeaveTeamModal = lazyPreload(() =>
  import(
    /* webpackChunkName: 'LeaveTeamModal' */ '../../modules/teamDashboard/components/LeaveTeamModal/LeaveTeamModal'
  )
)

const DashboardAvatar = (props: Props) => {
  const {isViewerLead, teamMember} = props
  const {isLead, picture, teamId} = teamMember
  const {user} = teamMember
  if (!user) {
    throw new Error(`User Avatar unavailable. ${JSON.stringify(teamMember)}`)
  }
  const {isConnected, preferredName} = user
  const atmosphere = useAtmosphere()
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const {
    closePortal: closePromote,
    togglePortal: togglePromote,
    modalPortal: portalPromote
  } = useModal()
  const {
    closePortal: closeRemove,
    togglePortal: toggleRemove,
    modalPortal: portalRemove
  } = useModal()
  const {closePortal: closeLeave, togglePortal: toggleLeave, modalPortal: portalLeave} = useModal()
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  const handleMouseEnter = () => {
    TeamMemberAvatarMenu.preload()
    openTooltip()
  }

  const handleClick = () => {
    closeTooltip()
    // togglePortal()
    if (!submitting) {
      submitMutation()
      ToggleManageTeamMutation(atmosphere, {teamId}, {onError, onCompleted})
    }
  }

  return (
    <AvatarWrapper onMouseEnter={handleMouseEnter} onMouseLeave={closeTooltip}>
      <StyledAvatar
        {...teamMember}
        isConnected={!!isConnected}
        onClick={handleClick}
        picture={picture || defaultUserAvatar}
        ref={originRef}
        size={ElementWidth.DASHBOARD_AVATAR}
      />
      {/* {menuPortal(
        <TeamMemberAvatarMenu
          menuProps={menuProps}
          isLead={Boolean(isLead)}
          isViewerLead={isViewerLead}
          teamMember={teamMember}
          togglePromote={togglePromote}
          toggleRemove={toggleRemove}
          toggleLeave={toggleLeave}
        />
      )} */}
      {portalPromote(<PromoteTeamMemberModal teamMember={teamMember} closePortal={closePromote} />)}
      {portalRemove(<RemoveTeamMemberModal teamMember={teamMember} closePortal={closeRemove} />)}
      {portalLeave(<LeaveTeamModal teamMember={teamMember} closePortal={closeLeave} />)}
      {tooltipPortal(preferredName)}
    </AvatarWrapper>
  )
}

export default createFragmentContainer(DashboardAvatar, {
  teamMember: graphql`
    fragment DashboardAvatar_teamMember on TeamMember {
      ...TeamMemberAvatarMenu_teamMember
      ...LeaveTeamModal_teamMember
      ...PromoteTeamMemberModal_teamMember
      ...RemoveTeamMemberModal_teamMember
      isLead
      picture
      teamId
      user {
        isConnected
        preferredName
      }
    }
  `
})
