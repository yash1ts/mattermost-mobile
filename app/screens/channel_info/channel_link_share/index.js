// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from '@mm-redux/selectors/entities/channels';
import ChannelLinkShare from './channel_link_share';
import {getCurrentTeam} from '@mm-redux/selectors/entities/teams';
import {getConfig} from '@mm-redux/selectors/entities/general';

function mapStateToProps(state) {
    const currentChannel = getCurrentChannel(state);
    const currentTeam = getCurrentTeam(state);
    const config = getConfig(state);
    const channelUrl = `${config.SiteURL}/api/invite?team=${currentTeam.name}&&community=${currentChannel.name}`;
    return {
        channelUrl,
    };
}

export default connect(mapStateToProps)(ChannelLinkShare);
