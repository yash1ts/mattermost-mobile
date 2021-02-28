// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from '@mm-redux/selectors/entities/channels';
import ChannelLinkShare from './channel_link_share';
<<<<<<< HEAD
import {getCurrentTeam} from '@mm-redux/selectors/entities/teams';
import {getConfig} from '@mm-redux/selectors/entities/general';

function mapStateToProps(state) {
    const currentChannel = getCurrentChannel(state);
    const currentTeam = getCurrentTeam(state);
    const config = getConfig(state);
    const channelUrl = `${config.SiteURL}/api/invite?team=${currentTeam.name}&&community=${currentChannel.name}`;
=======
import {getCurrentTeamUrl} from '@mm-redux/selectors/entities/teams';

function mapStateToProps(state) {
    const currentChannel = getCurrentChannel(state);
    const channelUrl = `${getCurrentTeamUrl(state)}/communities/${currentChannel.name}`;
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
    return {
        channelUrl,
    };
}

export default connect(mapStateToProps)(ChannelLinkShare);
